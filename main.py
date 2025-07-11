
from fastapi import FastAPI
import joblib
import os
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import datetime
import numpy as np

app = FastAPI(title="Spam Detection API", version="2.0.0", description="Enhanced Spam Detection with Analytics")

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

# In-memory storage for analytics (in production, use a database)
prediction_history = []

class InputData(BaseModel):
    text: str

class BatchInputData(BaseModel):
    texts: List[str]

class PredictionResponse(BaseModel):
    prediction: int
    result: str
    confidence: float
    text: str
    timestamp: str
    text_length: int
    word_count: int

@app.get("/")
def read_root():
    return {"message": "Enhanced Spam Detection API is running!", "status": "healthy", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: InputData):
    try:
        # Transform the input text using the vectorizer
        X = vectorizer.transform([data.text])
        prediction = model.predict(X)
        probabilities = model.predict_proba(X)[0]
        confidence = float(probabilities.max())
        
        # Handle both string and numeric predictions
        if isinstance(prediction[0], str):
            result = prediction[0]
            prediction_num = 1 if result == "spam" else 0
        else:
            prediction_num = int(prediction[0])
            result = "spam" if prediction_num == 1 else "ham"
        
        # Additional text analytics
        text_length = len(data.text)
        word_count = len(data.text.split())
        
        response = {
            "prediction": prediction_num,
            "result": result,
            "confidence": confidence,
            "text": data.text,
            "timestamp": datetime.datetime.now().isoformat(),
            "text_length": text_length,
            "word_count": word_count
        }
        
        # Store in history
        prediction_history.append(response.copy())
        
        return response
    except Exception as e:
        print(f"Prediction error: {e}")
        # Return a proper response structure even for errors
        return PredictionResponse(
            prediction=0,
            result="error",
            confidence=0.0,
            text=data.text,
            timestamp=datetime.datetime.now().isoformat(),
            text_length=len(data.text),
            word_count=len(data.text.split())
        )

@app.post("/predict-batch")
def predict_batch(data: BatchInputData):
    try:
        results = []
        for text in data.texts:
            X = vectorizer.transform([text])
            prediction = model.predict(X)
            probabilities = model.predict_proba(X)[0]
            confidence = float(probabilities.max())
            
            # Handle both string and numeric predictions
            if isinstance(prediction[0], str):
                result = prediction[0]
                prediction_num = 1 if result == "spam" else 0
            else:
                prediction_num = int(prediction[0])
                result = "spam" if prediction_num == 1 else "ham"
            
            result_data = {
                "prediction": prediction_num,
                "result": result,
                "confidence": confidence,
                "text": text,
                "timestamp": datetime.datetime.now().isoformat(),
                "text_length": len(text),
                "word_count": len(text.split())
            }
            
            results.append(result_data)
            prediction_history.append(result_data.copy())
        
        return {"results": results, "total_processed": len(results)}
    except Exception as e:
        print(f"Batch prediction error: {e}")
        return {"error": str(e)}

@app.get("/analytics")
def get_analytics():
    if not prediction_history:
        return {"message": "No predictions made yet"}
    
    total_predictions = len(prediction_history)
    spam_count = sum(1 for p in prediction_history if p["prediction"] == 1)
    ham_count = total_predictions - spam_count
    
    avg_confidence = np.mean([p["confidence"] for p in prediction_history])
    avg_text_length = np.mean([p["text_length"] for p in prediction_history])
    avg_word_count = np.mean([p["word_count"] for p in prediction_history])
    
    return {
        "total_predictions": total_predictions,
        "spam_count": spam_count,
        "ham_count": ham_count,
        "spam_percentage": (spam_count / total_predictions * 100) if total_predictions > 0 else 0,
        "average_confidence": float(avg_confidence),
        "average_text_length": float(avg_text_length),
        "average_word_count": float(avg_word_count),
        "recent_predictions": prediction_history[-10:]  # Last 10 predictions
    }

@app.get("/history")
def get_history(limit: int = 50):
    return {"history": prediction_history[-limit:], "total_count": len(prediction_history)}

@app.delete("/history")
def clear_history():
    global prediction_history
    count = len(prediction_history)
    prediction_history = []
    return {"message": f"Cleared {count} predictions from history"}