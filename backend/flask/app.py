import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pytesseract
import PyPDF2
from PIL import Image
import fitz 
import google.generativeai as genai 

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  

GENAI_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GENAI_API_KEY:
    raise ValueError("GOOGLE_API_KEY is missing. Set it before running.")

genai.configure(api_key=GENAI_API_KEY)

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed_reports"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)


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
                text_rect = fitz.Rect(margin_x, current_y, margin_x + max_width, page_height - margin_y)

                page.insert_textbox(
                    text_rect,
                    line,
                    fontsize=fontsize,
                    fontname="helv",
                    color=(0, 0, 0),
                    align=0  
                )
                current_y += fontsize + 4

            current_y += line_gap

        doc.save(output_pdf_path)
        doc.close()
    except Exception as e:
        print("Error generating PDF report:", e)


@app.route("/upload", methods=["POST"])
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