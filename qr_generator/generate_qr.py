import io
import uuid
import datetime
import qrcode
import streamlit as st
from PIL import Image
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
import os

import firebase_admin
from firebase_admin import credentials, firestore

# Load environment variables from the local .env file
load_dotenv()

# Change this to your production domain before deploying
BASE_URL = os.getenv("BASE_URL")

# ── Firebase Initialization ──────────────────────────────────────────────────
import json as _json

FIREBASE_SERVICE_ACCOUNT = os.getenv("FIREBASE_SERVICE_ACCOUNT", "firebase-service-account.json")

if not firebase_admin._apps:
    try:
        # If the env var looks like JSON (starts with '{'), parse it directly.
        # This is what Render sets when you paste the JSON into the env var field.
        # Locally, this falls back to reading from the firebase-service-account.json file.
        if FIREBASE_SERVICE_ACCOUNT.strip().startswith("{"):
            service_account_info = _json.loads(FIREBASE_SERVICE_ACCOUNT)
            cred = credentials.Certificate(service_account_info)
        else:
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        st.error(f"❌ Could not initialize Firebase: {e}")
        st.stop()

db = firestore.client()


def generate_blank_qr():
    """
    Generates a unique QR code, registers it in Firebase Firestore,
    and returns the qr_id, the QR PIL image, and the Firestore status.
    Nothing is written to disk.
    """
    # 1. Generate a unique QR ID
    qr_id = "KNO" + str(uuid.uuid4().hex)[:10].upper()

    # 2. Build QR image in memory
    qr_url = f"{BASE_URL}/qr/{qr_id}"
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    qr_img: Image.Image = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    # 3. Register in Firebase Firestore
    db_status = ""
    try:
        db.collection("qr_codes").document(qr_id).set({
            "qr_id": qr_id,
            "name": None,
            "location": None,
            "phone_number": None,
            "fcm_token": None,
            "created_at": firestore.SERVER_TIMESTAMP,
        })
        db_status = f"✅ Successfully added `{qr_id}` to Firestore!"
    except Exception as e:
        db_status = f"❌ Could not add to Firestore. Error: {e}"

    return qr_id, qr_img, db_status


def build_pdf(qr_items: list) -> bytes:
    """
    Builds a multi-page A4 PDF entirely in memory.
    Each (qr_id, qr_img) pair gets its own page with the QR centred
    and the QR ID printed below it.
    Returns raw PDF bytes.
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    page_w, page_h = A4

    for i, (qr_id, qr_img) in enumerate(qr_items):
        if i > 0:
            c.showPage()  # new page for each additional QR

        # --- QR image (centred, slightly above middle) ---
        qr_size = 10 * cm
        qr_x = (page_w - qr_size) / 2
        qr_y = (page_h - qr_size) / 2 + 1 * cm

        qr_buf = io.BytesIO()
        qr_img.save(qr_buf, format="PNG")
        qr_buf.seek(0)
        c.drawImage(ImageReader(qr_buf), qr_x, qr_y, width=qr_size, height=qr_size)

        # --- QR ID text ---
        c.setFont("Helvetica-Bold", 14)
        c.setFillColorRGB(0.26, 0.11, 0.72)   # KNOC purple
        text_y = qr_y - 0.8 * cm
        c.drawCentredString(page_w / 2, text_y, qr_id)

        # --- Subtitle ---
        c.setFont("Helvetica", 10)
        c.setFillColorRGB(0.56, 0.56, 0.58)
        c.drawCentredString(page_w / 2, text_y - 0.55 * cm, "Scan to KNOC")

        # --- Page number (bottom centre) ---
        c.setFont("Helvetica", 8)
        c.setFillColorRGB(0.75, 0.75, 0.75)
        c.drawCentredString(page_w / 2, 1 * cm, f"{i + 1} / {len(qr_items)}")

    c.save()
    return buf.getvalue()


# ── Streamlit UI ──────────────────────────────────────────────────────────────

st.set_page_config(page_title="KNOC QR Generator", page_icon="🔲", layout="centered")

# ── Session State Initialization ─────────────────────────────────────────────
if "session_start" not in st.session_state:
    st.session_state.session_start = datetime.datetime.now()
if "total_generated" not in st.session_state:
    st.session_state.total_generated = 0
if "session_log" not in st.session_state:
    st.session_state.session_log = []  # list of {qr_id, timestamp, status}

# ── Sidebar — Session Info ────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 📅 Session Info")
    st.divider()

    elapsed = datetime.datetime.now() - st.session_state.session_start
    elapsed_str = str(elapsed).split(".")[0]  # trim microseconds

    col1, col2 = st.columns(2)
    col1.metric("QR Generated", st.session_state.total_generated)
    col2.metric("Session Time", elapsed_str)

    st.caption(f"🕒 Started: {st.session_state.session_start.strftime('%I:%M %p')}")
    st.divider()

    if st.session_state.session_log:
        st.markdown("**Generated this session:**")
        for entry in reversed(st.session_state.session_log):
            icon = "✅" if entry["status"] == "ok" else "❌"
            st.markdown(f"{icon} `{entry['qr_id']}`")
            st.caption(f"🕒 {entry['timestamp']}")
    else:
        st.info("No QR codes generated yet.")

    if st.session_state.total_generated > 0:
        if st.button("🗑️ Clear session log", use_container_width=True):
            st.session_state.total_generated = 0
            st.session_state.session_log = []
            st.session_state.session_start = datetime.datetime.now()
            st.rerun()

st.title("KNOC QR Code Generator")

st.divider()

# ── Number of QR codes to generate ───────────────────────────────────────────
qr_count = st.number_input(
    "Number of QR codes to generate",
    min_value=1,
    max_value=50,
    value=1,
    step=1,
    help="Each QR code will get its own page in the downloaded PDF."
)

if st.button(f"Generate {qr_count} QR Code{'s' if qr_count > 1 else ''}", type="primary", use_container_width=True):
    qr_items = []   # list of (qr_id, qr_img)
    errors = []

    with st.spinner(f"Generating {qr_count} QR code(s) and syncing with Firestore..."):
        for i in range(qr_count):
            qr_id, qr_img, db_status = generate_blank_qr()
            qr_items.append((qr_id, qr_img))
            status = "ok" if "❌" not in db_status else "error"
            st.session_state.session_log.append({
                "qr_id": qr_id,
                "timestamp": datetime.datetime.now().strftime("%I:%M:%S %p"),
                "status": status,
            })
            st.session_state.total_generated += 1
            if status == "error":
                errors.append(f"`{qr_id}`: {db_status}")

    # ── Results banner ────────────────────────────────────────────────────────
    if errors:
        st.warning(f"{len(errors)} QR(s) had Firestore issues:")
        for e in errors:
            st.error(e)
    else:
        st.success(f"✅ {qr_count} QR code(s) registered in Firestore!")

    # ── Preview grid (max 3 per row) ──────────────────────────────────────────
    st.markdown("### Preview")
    cols_per_row = 3
    for row_start in range(0, len(qr_items), cols_per_row):
        row_items = qr_items[row_start:row_start + cols_per_row]
        cols = st.columns(cols_per_row)
        for col, (qr_id, qr_img) in zip(cols, row_items):
            with col:
                st.image(qr_img, caption=qr_id, use_column_width=True)

    # ── Download button — single PDF with all QR codes ────────────────────────
    pdf_bytes = build_pdf(qr_items)
    file_label = f"KNOC_{qr_count}_QR_codes" if qr_count > 1 else qr_items[0][0]
    st.download_button(
        label=f"⬇️ Download PDF ({qr_count} page{'s' if qr_count > 1 else ''})",
        data=pdf_bytes,
        file_name=f"{file_label}.pdf",
        mime="application/pdf",
        use_container_width=True,
    )
