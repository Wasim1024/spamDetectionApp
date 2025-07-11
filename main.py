
from fastapi import FastAPI
import joblib
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Spam Detection API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your vectorizer and model
try:
    vectorizer = joblib.load("count_vectorizer.pkl")
    model = joblib.load("logistic_regression_model.pkl")
    print("Models loaded successfully")
except Exception as e:
    print(f"Error loading models: {e}")

class InputData(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Spam Detection API is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/predict")
def predict(data: InputData):
    try:
        # Transform the input text using the vectorizer
        X = vectorizer.transform([data.text])
        prediction = model.predict(X)
        probability = model.predict_proba(X)[0].max()
        
        result = "spam" if prediction[0] == 1 else "ham"
        
        return {
            "prediction": int(prediction[0]),
            "result": result,
            "confidence": float(probability),
            "text": data.text
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": str(e)}