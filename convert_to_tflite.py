import tensorflow as tf

# Load your existing Keras model
model = tf.keras.models.load_model("model.keras")  # make sure it's in the same folder

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the converted model
with open("model.tflite", "wb") as f:
    f.write(tflite_model)

print("✅ Successfully converted to model.tflite")
