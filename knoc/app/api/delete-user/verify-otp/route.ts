import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import crypto from 'crypto';

/**
 * POST /api/delete-user/verify-otp
 * Body: { phone_number: string, otp: string }
 *
 * Verifies the OTP and returns a one-time delete token.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let phone_number: string = body.phone_number;
        const otp: string = body.otp;

        if (!phone_number || !otp) {
            return NextResponse.json(
                { error: 'phone_number and otp are required' },
                { status: 400 }
            );
        }

        // Format phone number
        if (!phone_number.startsWith('+')) {
            phone_number = `+91${phone_number.replace(/^91/, '')}`;
        }

        // Find the most recent OTP for this phone number
        const otpSnapshot = await db
            .collection('otp_verifications')
            .where('phone_number', '==', phone_number)
            .where('verified', '==', false)
            .where('used', '==', false)
            .limit(1)
            .get();

        if (otpSnapshot.empty) {
            return NextResponse.json(
                { error: 'No pending OTP found. Please request a new one.' },
                { status: 400 }
            );
        }

        const otpDoc = otpSnapshot.docs[0];
        const otpData = otpDoc.data();

        // Check if OTP has expired
        const expiresAt = otpData.expires_at.toDate ? otpData.expires_at.toDate() : new Date(otpData.expires_at);
        if (new Date() > expiresAt) {
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Verify OTP by comparing hashes
        const inputHash = crypto.createHash('sha256').update(otp).digest('hex');
        if (inputHash !== otpData.otp_hash) {
            return NextResponse.json(
                { error: 'Invalid OTP. Please try again.' },
                { status: 400 }
            );
        }

        // Generate a one-time delete token
        const deleteToken = crypto.randomUUID();

        // Mark OTP as verified and store the delete token
        await otpDoc.ref.update({
            verified: true,
            delete_token: deleteToken,
            verified_at: new Date(),
        });

        return NextResponse.json({
            success: true,
            delete_token: deleteToken,
            message: 'OTP verified successfully',
        });
    } catch (err: any) {
        console.error('Verify OTP error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}
