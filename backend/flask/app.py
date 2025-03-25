import os
from flask import Flask, request, jsonify, send_file
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
CORS(app, origins=["http://localhost:3000"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred_path = os.path.join(BASE_DIR, "firebaseCred.json")

cred = credentials.Certificate(cred_path)
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
You are an AI that simplifies complex medical reports into clear, patient-friendly summaries.  
Your task is to analyze the following report and generate an easy-to-understand summary that includes:  

- **Patient Information:** Display the patient's name and basic details at the top.  
- **Key Findings:** Present the important results in bullet points using simple language.  
- **Explanation:** Briefly describe what each finding means for the patient's health.  
- **Recommendations:** Provide clear next steps, such as lifestyle changes or when to consult a doctor.  
- **Clarity:** Avoid unnecessary medical jargon and ensure the summary is concise and within ¾ of an A4 page.  

**Medical Report:**  
{text}  
"""

        response = model.generate_content(prompt)
        print("==" * 34)
        print(response)
        print("==" * 34)

        if response and hasattr(response, "text"):
            return response.text.strip()
        else:
            return "No insights available."

    except Exception as e:
        print("Error with Gemini API:", e)
        return "AI analysis failed."



def generate_pdf_report(ai_insights, output_pdf_path):
    try:
        # Page and margin settings
        page_width, page_height = 595, 842  # A4 size in points
        margin_x, margin_y = 50, 50
        max_width = page_width - (2 * margin_x)

        # Font and spacing settings
        title_font_size = 16
        section_font_size = 14
        content_font_size = 12
        bullet_font_size = 12
        line_spacing = 16
        section_spacing = 25
        bullet_spacing = 14

        if not ai_insights.strip():
            ai_insights = "No insights available."

        # Split the response into sections based on the parts
        sections = ai_insights.split("\n")
        doc = fitz.open()
        current_y = margin_y
        page = doc.new_page(width=page_width, height=page_height)

        # Define fonts
        title_font = "helv-bold"
        section_font = "helv-bold"
        content_font = "helv"

        # Add report title at the top
        title = "Medical Report Summary"
        title_rect = fitz.Rect(
            margin_x, current_y, margin_x + max_width, page_height - margin_y
        )
        page.insert_textbox(
            title_rect,
            title,
            fontsize=title_font_size,
            fontname=title_font,
            color=(0, 0, 0),
            align=1,
        )
        current_y += title_font_size + section_spacing

        # Extracting sections from the response
        for section in sections:
            section = section.strip()
            if not section:
                continue

            # Format headers (bold and slightly larger)
            if "**" in section and not section.startswith("•"):
                text = section.replace("**", "").strip()
                fontsize = section_font_size
                fontname = section_font
                line_gap = section_spacing
            elif section.startswith("* "):  # Bullet points
                text = "• " + section[2:].strip()
                fontsize = bullet_font_size
                fontname = content_font
                line_gap = bullet_spacing
            else:  # Normal text
                text = section
                fontsize = content_font_size
                fontname = content_font
                line_gap = line_spacing

            # Word wrapping
            wrapped_text = []
            words = text.split()
            current_line = ""

            for word in words:
                test_line = current_line + " " + word if current_line else word
                text_width = fitz.get_text_length(test_line, fontsize, fontname)
                if text_width < max_width:
                    current_line = test_line
                else:
                    wrapped_text.append(current_line)
                    current_line = word

            if current_line:
                wrapped_text.append(current_line)

            # Insert text into PDF
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
                    fontname=fontname,
                    color=(0, 0, 0),
                    align=0,
                )
                current_y += fontsize + 4

            current_y += line_gap

        # Save the generated PDF to the given path
        doc.save(output_pdf_path)
        doc.close()

    except Exception as e:
        print("Error generating PDF report:", e)


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

    file_path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
    uploaded_file.save(file_path)

    extracted_text = ""
    if uploaded_file.filename.lower().endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
    elif uploaded_file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        extracted_text = extract_text_from_image(file_path)
    else:
        return jsonify({"error": "Unsupported file format"}), 400

    if not extracted_text:
        return jsonify({"error": "No text found in the file"}), 400

    ai_insights = analyze_text_with_gemini(extracted_text)

    processed_pdf_path = os.path.join(PROCESSED_FOLDER, "Processed_Report.pdf")
    generate_pdf_report(ai_insights, processed_pdf_path)

    if not os.path.exists(processed_pdf_path):
        return jsonify({"error": "Generated PDF not found"}), 500

    return send_file(processed_pdf_path, as_attachment=True, mimetype="application/pdf")


if __name__ == "__main__":
    app.run(debug=True)
