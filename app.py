import os
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from whitenoise import WhiteNoise
import tensorflow as tf

app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/", prefix="static/")
CORS(app)

# --- Model Path ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TFLITE_MODEL_PATH = os.path.join(BASE_DIR, "model.tflite")

# --- Load TFLite Model ---
try:
    interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print(f"TFLite model loaded from: {TFLITE_MODEL_PATH}")
except Exception as e:
    print(f"Failed to load TFLite model: {e}")
    interpreter = None

# --- Routes ---

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/predict_tumor", methods=["POST"])
def predict_tumor():
    print(" /predict_tumor hit")

    if interpreter is None:
        return jsonify({"error": "TFLite model not loaded"}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    try:
        print("Image received:", file.filename)
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((128, 128))  # match input shape of original model

        # Normalize and reshape for TFLite
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        prediction = interpreter.get_tensor(output_details[0]['index'])[0][0]

        label = "Tumor Detected" if prediction > 0.5 else "No Tumor Detected"

        print(f"Prediction: {label} ({prediction:.4f})")

        return jsonify({
            "prediction": label,
            "probability": round(float(prediction), 4)
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": f"Prediction error: {e}"}), 500

# --- Entry Point (for local dev only) ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

