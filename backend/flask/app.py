import os
import firebase_admin
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import xgboost as xgb
import pandas as pd
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cred_path = os.path.join(BASE_DIR, "firebaseCred.json")

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

PreviousTests_collection_ref = db.collection("PreviousTests")
Diabetes_collection_ref = db.collection("Diabetes")


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
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
