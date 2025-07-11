
from fastapi import FastAPI
import joblib  # or pickle, depending on your model
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your vectorizer and model (use relative paths)
vectorizer = joblib.load("count_vectorizer.pkl")
model = joblib.load("logistic_regression_model.pkl")

class InputData(BaseModel):
    text: str



@app.post("/predict")
def predict(data: InputData):
    try:
        # Transform the input text using the vectorizer
        X = vectorizer.transform([data.text])
        prediction = model.predict(X)
        return {"prediction": int(prediction[0])}
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": str(e)}