import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import * as admin from 'firebase-admin';

/**
 * DELETE /api/delete-user
 * Query or Body: { phone_number: string }
 * 
 * Deletes all data associated with the user, including:
 * 1. Their Firebase Auth account
 * 2. Unlinking their QR codes (resetting personal data)
 * 3. Deleting all knoc_logs for their QR codes
 */
export async function DELETE(req: NextRequest) {
    try {
        let phone_number: string | null = null;
        let delete_token: string | null = null;

        // Try getting from query params
        const { searchParams } = new URL(req.url);
        phone_number = searchParams.get('phone_number');

        // If not in query params, try getting from body
        if (!phone_number) {
            try {
                const body = await req.json();
                phone_number = body.phone_number;
                delete_token = body.delete_token;
            } catch (e) {
                // Ignore JSON parsing errors if body is empty
            }
        }

        if (!phone_number) {
            return NextResponse.json(
                { error: 'phone_number is required to delete user data' },
                { status: 400 }
            );
        }

        if (!delete_token) {
            return NextResponse.json(
                { error: 'delete_token is required. Please verify OTP first.' },
                { status: 400 }
            );
        }

        // Verify the delete token
        const tokenSnapshot = await db
            .collection('otp_verifications')
            .where('delete_token', '==', delete_token)
            .where('verified', '==', true)
            .where('used', '==', false)
            .limit(1)
            .get();

        if (tokenSnapshot.empty) {
            return NextResponse.json(
                { error: 'Invalid or expired delete token. Please verify OTP again.' },
                { status: 403 }
            );
        }

        const tokenDoc = tokenSnapshot.docs[0];
        const tokenData = tokenDoc.data();

        // Check token expiry (same as OTP expiry — 5 minutes from OTP creation)
        const expiresAt = tokenData.expires_at.toDate ? tokenData.expires_at.toDate() : new Date(tokenData.expires_at);
        if (new Date() > expiresAt) {
            return NextResponse.json(
                { error: 'Delete token has expired. Please verify OTP again.' },
                { status: 403 }
            );
        }

        // Check that the phone number matches the OTP record
        const formattedPhone = phone_number.startsWith('+') ? phone_number : `+91${phone_number.replace(/^91/, '')}`;
        if (tokenData.phone_number !== formattedPhone && tokenData.phone_number !== phone_number) {
            return NextResponse.json(
                { error: 'Delete token does not match this phone number.' },
                { status: 403 }
            );
        }

        // Mark the token as used
        await tokenDoc.ref.update({ used: true });

        // Format phone number to ensure it starts with +91 if missing
        if (!phone_number.startsWith('+')) {
            phone_number = `+91${phone_number.replace(/^91/, '')}`;
        }

        // 1. Find all QR codes linked to this phone number
        const qrSnapshot = await db
            .collection('qr_codes')
            .where('phone_number', '==', phone_number)
            .get();

        const batch = db.batch();

        for (const doc of qrSnapshot.docs) {
            const qrId = doc.id;

            // 2. Find all knoc_logs for this QR code
            const logsSnapshot = await db
                .collection('knoc_logs')
                .where('qr_id', '==', qrId)
                .get();
            
            // Add instructions to batch to delete all logs
            for (const logDoc of logsSnapshot.docs) {
                batch.delete(logDoc.ref);
            }

            // 3. Reset the QR code document so it is no longer linked.
            // This removes user PII but keeps the generated QR code physical integrity.
            batch.update(doc.ref, {
                name: null,
                location: null,
                phone_number: null,
                fcm_token: null,
            });
        }

        // Commit all Firestore writes (logs deletion + qr_code updates)
        await batch.commit();

        // 4. Delete user from Firebase Auth
        try {
            const userRecord = await admin.auth().getUserByPhoneNumber(phone_number);
            if (userRecord && userRecord.uid) {
                await admin.auth().deleteUser(userRecord.uid);
                console.log(`Successfully deleted Firebase Auth user: ${userRecord.uid}`);
            }
        } catch (authErr: any) {
            // Ignore error if user is not found in Auth (code: auth/user-not-found)
            console.warn(`Could not delete auth user for ${phone_number}:`, authErr.message);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully deleted all data for user ${phone_number}`,
        });
    } catch (err: any) {
        console.error('Delete user error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal server error while deleting user data' },
            { status: 500 }
        );
    }
}
