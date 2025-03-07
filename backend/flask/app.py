from flask import Flask, jsonify, request
from flask_cors import CORS

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

if __name__ == '__main__':
    app.run(debug=True)