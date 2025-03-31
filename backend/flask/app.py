import base64
import os
from flask import Flask, json, request, jsonify, send_file
from flask_cors import CORS
import firebase_admin
import xgboost as xgb
import pandas as pd
from firebase_admin import credentials, firestore
import pytesseract
import PyPDF2
from PIL import Image
from datetime import datetime
import fitz
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://detectxhealth.netlify.app"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

firebase_cred_base64 = os.getenv("FIREBASE_CRED_BASE64")
if not firebase_cred_base64:
    raise ValueError("Firebase credentials not found in environment variables")
firebase_cred_json = base64.b64decode(firebase_cred_base64).decode("utf-8")
firebase_cred_dict = json.loads(firebase_cred_json)

cred = credentials.Certificate(firebase_cred_dict)
firebase_admin.initialize_app(cred)
db = firestore.client()

PreviousTests_collection_ref = db.collection("PreviousTests")
Diabetes_collection_ref = db.collection("Diabetes")

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GENAI_API_KEY:
    raise ValueError("GOOGLE_API_KEY is missing. Set it before running.")
genai.configure(api_key=GENAI_API_KEY)

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed_reports"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
PROCESSED_FOLDER = os.path.join(BASE_DIR, "processed_reports")


def store_tests_in_firestore(emailID, testName, date, prediction, testid):
    doc_ref = PreviousTests_collection_ref.add(
        {
            "Email_ID": emailID,
            "Test_ID": testid,
            "Test_Name": testName,
            "Date_Time": date,
            "Prediction_Percentage": prediction,
        }
    )


def store_diabetes_tests_in_firestore(data):
    doc_ref = Diabetes_collection_ref.add(
        {
            "email_id": data.get("email"),
            "A1Cresult_8": data.get("A1Cresult_8"),
            "A1Cresult_Norm": data.get("A1Cresult_Norm"),
            "max_glu_serum_300": data.get("max_glu_serum_300"),
            "max_glu_serum_Norm": data.get("max_glu_serum_Norm"),
            "num_medications": data.get("num_medications"),
            "num_lab_procedures": data.get("num_lab_procedures"),
            "number_inpatient": data.get("number_inpatient"),
            "age": data.get("age"),
            "time_in_hospital": data.get("time_in_hospital"),
            "number_diagnoses": data.get("number_diagnoses"),
        }
    )

    return doc_ref[1].id


def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, "rb") as pdf_file:
            reader = PyPDF2.PdfReader(pdf_file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print("Error extracting PDF text:", e)
    return text.strip()


def extract_text_from_image(image_path):
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print("Error extracting image text:", e)
        return ""


def analyze_text_with_gemini(text):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")

        prompt = f"""
        Given the following report text, summarize it and provide key findings in simple language so that 
        the patient can easily understand his health condition. The summary should fit within 3/4 of an A4 page 
        and be formatted clearly with:
        - Patient's name and details at the top
        - Key findings in bullet points
        - Simple, readable language
        - A recommendation section at the end
        - Avoid unnecessary medical jargon
        
        {text}
        """
        response = model.generate_content(prompt)

        if response and hasattr(response, "text"):
            return response.text.strip()
        else:
            return "No insights available."
    except Exception as e:
        print("Error with Gemini API:", e)
        return "AI analysis failed."


def generate_pdf_report(ai_insights, output_pdf_path):
    try:
        page_width, page_height = 595, 842
        margin_x, margin_y = 50, 50
        max_width = page_width - (2 * margin_x)

        font_size = 12
        line_spacing = 16
        section_spacing = 20
        bullet_spacing = 12

        if not ai_insights.strip():
            ai_insights = "No insights available."

        sections = ai_insights.split("\n")
        doc = fitz.open()
        current_y = margin_y
        page = doc.new_page(width=page_width, height=page_height)

        font = fitz.Font("helv")

        for section in sections:
            section = section.strip()
            if not section:
                continue

            if "**" in section and not section.startswith("•"):
                text = section.replace("**", "").strip()
                fontsize = font_size + 2
                line_gap = section_spacing
            elif section.startswith("* "):
                text = "• " + section[2:].strip()
                fontsize = font_size
                line_gap = bullet_spacing
            else:
                text = section
                fontsize = font_size
                line_gap = line_spacing
            wrapped_text = []
            words = text.split()
            current_line = ""

            for word in words:
                test_line = current_line + " " + word if current_line else word
                text_width = font.text_length(test_line, fontsize)
                if text_width < max_width:
                    current_line = test_line
                else:
                    wrapped_text.append(current_line)
                    current_line = word

            if current_line:
                wrapped_text.append(current_line)

            for line in wrapped_text:
                if current_y + fontsize + 4 > page_height - margin_y:
                    page = doc.new_page(width=page_width, height=page_height)
                    current_y = margin_y
                text_rect = fitz.Rect(
                    margin_x, current_y, margin_x + max_width, page_height - margin_y
                )

                page.insert_textbox(
                    text_rect,
                    line,
                    fontsize=fontsize,
                    fontname="helv",
                    color=(0, 0, 0),
                    align=0,
                )
                current_y += fontsize + 4

            current_y += line_gap

        doc.save(output_pdf_path)
        doc.close()
    except Exception as e:
        print("Error generating PDF report:", e)


@app.route("/")
def page():
    return "<h1>This is just the backend</h1>"


@app.route("/check", methods=["POST"])
def login():
    userData = request.get_json()  # Get JSON userData from React
    email = userData.get("email")
    uid = userData.get("uid")

    if email and uid:
        print(f"User logged in: {email}, UID: {uid}")
        return jsonify({"message": "Login data received", "email": email, "uid": uid})

    return jsonify({"error": "Invalid data"}), 400


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "models", "diabetes_model.json")
model = xgb.Booster()
model.load_model(model_path)

FEATURES = [
    "A1Cresult_>8",
    "A1Cresult_Norm",
    "max_glu_serum_>300",
    "max_glu_serum_Norm",
    "num_medications",
    "num_lab_procedures",
    "number_inpatient",
    "age",
    "time_in_hospital",
    "number_diagnoses",
]


@app.route("/predictDiabetes", methods=["POST", "GET"])
def predict():
    if request.content_type != "application/json":
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        # Get JSON data from request
        data = request.get_json()
        print("Received data:", data)  # Debugging log (will show in terminal)
        email = data.get("email")

        print("=" * 76)
        print(data)
        print("=" * 76)

        # Convert input data into DataFrame
        input_df = pd.DataFrame([data], columns=FEATURES)
        print("Converted DataFrame:", input_df)  # Debugging log

        # Convert DataFrame to DMatrix for XGBoost
        dmatrix = xgb.DMatrix(input_df)

        # Make prediction
        prediction = model.predict(dmatrix)

        store_tests_in_firestore(
            email,
            "diabetes",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            float(prediction[0] * 100),
            store_diabetes_tests_in_firestore(data),
        )

        # Return prediction as JSON response
        return jsonify({"prediction": float(prediction[0] * 100)})

    except Exception as e:
        print("Error:", str(e))  # Debugging log


@app.route("/ReportUpload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save file in uploads directory
    file_path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
    uploaded_file.save(file_path)

    # Extract text from PDF or Image
    extracted_text = ""
    if uploaded_file.filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
    elif uploaded_file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        extracted_text = extract_text_from_image(file_path)
    else:
        return jsonify({"error": "Unsupported file format"}), 400
    patient_name = "Unknown_Patient"
    for line in extracted_text.split("\n"):
        if "Name:" in line: 
            patient_name = line.split(":", 1)[1].strip().replace(" ", "_")
            break

    # Generate AI insights
    ai_insights = analyze_text_with_gemini(extracted_text)

    # Ensure PROCESSED_FOLDER exists
    os.makedirs(PROCESSED_FOLDER, exist_ok=True)

    # Use absolute path for processed report
    output_pdf_path = os.path.join(PROCESSED_FOLDER, f"{patient_name}.pdf")

    # Generate PDF
    generate_pdf_report(ai_insights, output_pdf_path)
    print(f"PDF saved at: {output_pdf_path}, Exists: {os.path.exists(output_pdf_path)}")

    # Verify if file exists before sending
    if not os.path.exists(output_pdf_path):
        return jsonify({"error": "Generated PDF not found"}), 500

    # Use absolute path when sending file
    return send_file(
        os.path.abspath(output_pdf_path), as_attachment=True, mimetype="application/pdf"
    )


if __name__ == "__main__":
    app.run(debug=True)
