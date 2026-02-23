import os
import uuid
import qrcode
import streamlit as st
from PIL import Image
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from the local .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Use the anon key or service role key
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

def generate_blank_qr():
    # 1. Generate a unique QR ID (e.g. KNO + random string)
    qr_id = "KNO" + str(uuid.uuid4().hex)[:10].upper()

    # 2. Create the QR image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_id)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    # Ensure output directory exists
    output_dir = "qrs_output"
    os.makedirs(output_dir, exist_ok=True)
    file_path = f"{output_dir}/{qr_id}.png"
    img.save(file_path)

    # 3. Add the blank record to Supabase
    db_status = ""
    if SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            
            # Insert the qr_id (other fields remain empty)
            result = supabase.table("qr_codes").insert({
                "qr_id": qr_id
            }).execute()
            
            db_status = f"✅ Successfully added empty QR code `{qr_id}` to Supabase Database!"
        except Exception as e:
            db_status = f"❌ Could not add to Supabase. Error: {e}"
    else:
        db_status = "⚠️ Missing Supabase credentials in .env file."

    return qr_id, file_path, db_status

# --- Streamlit UI ---
st.set_page_config(page_title="KNOC QR Generator", page_icon="🔲", layout="centered")

st.title("KNOC QR Code Generator")
st.markdown("Generate blank, unique QR codes and pre-register them in Supabase. These QR codes can later be assigned to a user via the React Native app onboarding flow.")

st.divider()

if st.button("Generate New QR Code", type="primary", use_container_width=True):
    with st.spinner("Generating QR and syncing with Supabase..."):
        qr_id, file_path, db_status = generate_blank_qr()
        
        st.success(f"Generated QR ID: **{qr_id}**")
        
        # Database Status
        if "✅" in db_status:
            st.info(db_status)
        else:
            st.error(db_status)
            
        # Display the image
        col1, col2, col3 = st.columns([1,2,1])
        with col2:
            img = Image.open(file_path)
            st.image(img, caption=qr_id, use_column_width=True)
            
            # Download button
            with open(file_path, "rb") as file:
                st.download_button(
                    label="Download QR PNG",
                    data=file,
                    file_name=f"{qr_id}.png",
                    mime="image/png",
                    use_container_width=True
                )
