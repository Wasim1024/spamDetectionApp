# Spam Detection App

A full-stack spam detection application using FastAPI (Python) for the backend and React for the frontend.

## Features

- **Machine Learning Spam Detection**: Uses a trained logistic regression model and count vectorizer to classify messages as spam or not spam
- **FastAPI Backend**: High-performance API with automatic documentation
- **React Frontend**: Modern, responsive user interface
- **CORS Enabled**: Seamless communication between frontend and backend during development
- **Easy to Run Locally**: Just install dependencies and start both servers

## How It Works

1. User enters a message in the React app
2. The app sends the message to the FastAPI `/predict` endpoint
3. The backend preprocesses the text, runs the model, and returns the prediction
4. The frontend displays whether the message is spam or legitimate

## API Endpoints

- `GET /`: Welcome message and API status
- `GET /health`: Health check endpoint
- `POST /predict`: Spam detection prediction
  - Request body: `{"text": "your message here"}`
  - Response: `{"prediction": 0|1, "result": "spam|ham", "confidence": 0.95, "text": "input text"}`

## Getting Started

### Backend

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

3. Access the API documentation at: `http://localhost:8000/docs`

### Frontend

1. Navigate to the frontend folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in your browser

## Deployment on Render

### Prerequisites
- GitHub account
- Render account (free tier available)

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/spamDetectionApp.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: spam-detection-api
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `./start.sh`
   - Click "Create Web Service"

3. **Your API will be available at**: `https://your-service-name.onrender.com`

### Testing the Deployed API

```bash
# Health check
curl https://your-service-name.onrender.com/health

# Spam prediction
curl -X POST "https://your-service-name.onrender.com/predict" \
     -H "Content-Type: application/json" \
     -d '{"text": "Congratulations! You have won $1000. Click here to claim your prize!"}'
```

## Frontend Deployment

The React frontend can be deployed separately on Render or other platforms like Netlify/Vercel.

## Model Information

- **Vectorizer**: Count Vectorizer for text feature extraction
- **Model**: Logistic Regression for binary classification
- **Output**: 0 (ham/not spam), 1 (spam)

## Technologies Used

- **Backend**: FastAPI, Python, scikit-learn, joblib
- **Frontend**: React, JavaScript
- **Deployment**: Render
- **ML**: Logistic Regression, Count Vectorizer
