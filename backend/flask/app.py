from flask import Flask, jsonify, request
from flask_cors import CORS
import xgboost as xgb
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/check', methods=['POST'])
def login():
    data = request.get_json()  # Get JSON data from React
    email = data.get("email")
    uid = data.get("uid")

    if email and uid:
        print(f"User logged in: {email}, UID: {uid}")
        return jsonify({"message": "Login data received", "email": email, "uid": uid})
    
    return jsonify({"error": "Invalid data"}), 400


# Load trained model
model = xgb.Booster()
model.load_model("R:\\Mini Projects\\GDG_Pirates\\backend\\models\\diabetes_model .json")

FEATURES = [
    "A1Cresult_>8", "A1Cresult_Norm", "max_glu_serum_>300", "max_glu_serum_Norm",
    "num_medications", "num_lab_procedures", "number_inpatient", "age",
    "time_in_hospital", "number_diagnoses"
]


@app.route("/predict", methods=["POST"])
def predict():
    if request.content_type != "application/json":
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        # Get JSON data from request
        data = request.get_json()
        print("Received data:", data)  # Debugging log (will show in terminal)

        # Convert input data into DataFrame
        input_df = pd.DataFrame([data], columns=FEATURES)
        print("Converted DataFrame:", input_df)  # Debugging log

        # Convert DataFrame to DMatrix for XGBoost
        dmatrix = xgb.DMatrix(input_df)

        # Make prediction
        prediction = model.predict(dmatrix)
        print("Prediction:", prediction)  # Debugging log

        # Return prediction as JSON response
        return jsonify({
            "prediction": float(prediction[0] * 100)
        })

    except Exception as e:
        print("Error:", str(e))  # Debugging log
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)