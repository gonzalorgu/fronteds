from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.svm import SVC
import cv2
import pywt
import logging
import os
from werkzeug.utils import secure_filename
import pandas as pd

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuración
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
app.config['UPLOAD_FOLDER'] = 'uploads/'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

class FaceRecognizer:
    def __init__(self):
        self.model = SVC(kernel='linear', probability=True)  # Habilitar probabilidad
        self.is_trained = False

    def train_model(self, X_train, y_train):
        self.model.fit(X_train, y_train)
        self.is_trained = True

    def predict(self, image):
        if not self.is_trained:
            raise ValueError("El modelo no está entrenado")
        features = self.extract_gabor_features(image)
        probabilities = self.model.predict_proba([features])  # Obtener probabilidades
        prediction = self.model.predict([features])
        confidence = max(probabilities[0])  # Tomamos la máxima probabilidad como confianza
        return prediction[0], confidence  # Retornamos la clase y la confianza

    def extract_gabor_features(self, image):
        features = []
        frequencies = [0.1, 0.3, 0.5]
        orientations = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]
        for frequency in frequencies:
            for orientation in orientations:
                kernel = cv2.getGaborKernel((21, 21), 5.0, orientation, frequency, 1.0, 0, ktype=cv2.CV_32F)
                filtered_img = cv2.filter2D(image, cv2.CV_32F, kernel)
                features.append(np.mean(filtered_img))
        return np.array(features)

face_recognizer = FaceRecognizer()

def generate_training_data():
    data = [
        {"image_path": "data/person1.jpg", "label": "known"},
        {"image_path": "data/person2.jpg", "label": "known"},
        {"image_path": "data/person3.jpg", "label": "unknown"},
        {"image_path": "data/person4.jpg", "label": "unknown"},
    ]
    
    df = pd.DataFrame(data)
    X, y = [], []

    for index, row in df.iterrows():
        if not os.path.exists(row['image_path']):
            logger.warning(f"⚠️ Imagen no encontrada: {row['image_path']}")
            continue

        img = cv2.imread(row['image_path'], cv2.IMREAD_GRAYSCALE)
        if img is None:
            logger.warning(f"⚠️ No se pudo cargar: {row['image_path']}")
            continue

        try:
            img = cv2.resize(img, (64, 64))
            features = face_recognizer.extract_gabor_features(img)
            X.append(features)
            y.append(row['label'])
        except Exception as e:
            logger.warning(f"⚠️ Error procesando {row['image_path']}: {e}")

    if len(X) == 0:
        logger.warning("❌ No se encontraron imágenes válidas para entrenar el modelo.")
    return np.array(X), np.array(y)

# Entrenamiento solo si hay datos válidos
try:
    X_train, y_train = generate_training_data()
    if len(X_train) > 0:
        face_recognizer.train_model(X_train, y_train)
        logger.info("✅ Modelo entrenado correctamente con datos válidos.")
    else:
        logger.warning("⚠️ No se entrenó el modelo por falta de datos válidos.")
except Exception as e:
    logger.error(f"❌ Error al entrenar el modelo: {str(e)}")

@app.route('/api/classify', methods=['POST'])
def classify_image():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No se recibió archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return jsonify({'success': False, 'message': 'No se pudo leer la imagen'}), 400
        
        img = cv2.resize(img, (64, 64))
        result, confidence = face_recognizer.predict(img)

        return jsonify({
            'success': True,
            'result': {
                'isKnown': result == 'known',
                'confidence': confidence,  # Incluir el valor de la confianza
                'message': 'Clasificación realizada exitosamente'
            }
        })
    
    except Exception as e:
        logger.error(f"Error interno: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_trained': face_recognizer.is_trained,
        'message': 'Servidor de clasificación de rostros funcionando correctamente'
    })

if __name__ == '__main__':
    logger.info("🚀 Iniciando servidor de reconocimiento facial...")
    app.run(debug=True, host='0.0.0.0', port=5000)
