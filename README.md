# spamDetectionApp
A simple, full-stack spam detection application using FastAPI (Python) for the backend and React for the frontend.

# Features
Machine Learning Spam Detection: Uses a trained logistic regression model and count vectorizer to classify messages as spam or not spam.
REST API: FastAPI backend exposes a /predict endpoint for real-time predictions.
Modern Frontend: React-based UI for easy message input and result display.
CORS Enabled: Seamless communication between frontend and backend during development.
Easy to Run Locally: Just install dependencies and start both servers.

# How It Works
User enters a message in the React app.
The app sends the message to the FastAPI /predict endpoint.
The backend preprocesses the text, runs the model, and returns the prediction.
The frontend displays whether the message is spam or legitimate.

# Getting Started
## Backend

Install dependencies:
pip install fastapi uvicorn scikit-learn joblib
Run the server:
uvicorn main:app --reload --port 8001
## Frontend

Navigate to the frontend folder.
Install dependencies:
npm install
Start the React app:
npm start
Open http://localhost:3000 in your browser.
