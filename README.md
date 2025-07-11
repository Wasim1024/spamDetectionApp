# Enhanced Spam Detection App

A full-stack spam detection application using FastAPI (Python) for the backend and React for the frontend with advanced features and modern UI.

## Features

- **Machine Learning Spam Detection**: Uses a trained logistic regression model and count vectorizer to classify messages as spam or not spam
- **Enhanced FastAPI Backend**: High-performance API with automatic documentation and analytics
- **Modern React Frontend**: Beautiful, responsive UI with dark mode and tabbed interface
- **Analytics Dashboard**: Real-time statistics, charts, and prediction insights
- **Batch Processing**: Analyze multiple messages simultaneously
- **History Management**: Track all predictions with timestamps and export to CSV
- **Dark Mode**: Toggle between light and dark themes
- **CORS Enabled**: Seamless communication between frontend and backend
- **Easy Deployment**: Ready for production deployment on Render

## How It Works

1. User enters a message in the enhanced React app
2. The app sends the message to the FastAPI `/predict` endpoint
3. The backend preprocesses the text, runs the ML model, and returns detailed predictions
4. The frontend displays results with confidence scores, analytics, and insights
5. All predictions are stored in history with export capabilities

## API Endpoints

- `GET /`: Welcome message and API status
- `GET /health`: Health check endpoint
- `POST /predict`: Enhanced spam detection with detailed analytics
  - Request body: `{"text": "your message here"}`
  - Response: `{"prediction": 0|1, "result": "spam|ham", "confidence": 0.95, "text": "input text", "timestamp": "2025-07-12T...", "text_length": 35, "word_count": 7}`
- `POST /predict-batch`: Batch processing for multiple messages
  - Request body: `{"texts": ["message1", "message2", ...]}`
  - Response: `{"results": [...], "total_processed": 2}`
- `GET /analytics`: Get prediction statistics and insights
- `GET /history`: Retrieve prediction history with optional limit
- `DELETE /history`: Clear all prediction history

## Getting Started

### Prerequisites
- Python 3.8+ (tested with Python 3.13)
- Node.js 14+ and npm
- Git

### Backend

1. Create and activate virtual environment:
   ```bash
   python -m venv clean_venv
   source clean_venv/bin/activate  # On Windows: clean_venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8003 --reload
   ```

4. Access the API documentation at: `http://localhost:8003/docs`

### Frontend

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

4. Open `http://localhost:3000` in your browser

## Deployment to Render

### Backend Deployment

1. **Create a new Web Service** on Render:
   - Connect your GitHub repository
   - Root Directory: `/` (leave empty)
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Environment Variables** (if needed):
   - Add any required environment variables in Render dashboard

3. **Deploy**: Render will automatically deploy your backend

### Frontend Deployment

1. **Create a new Static Site** on Render:
   - Connect your GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

2. **Update API URL**: After backend is deployed, update the `API_BASE` URL in `frontend/src/App.js`:
   ```javascript
   const API_BASE = 'https://your-backend-url.onrender.com';
   ```

3. **Redeploy**: Push changes to trigger frontend redeploy

### Post-Deployment Steps

1. Test all endpoints using the deployed backend URL
2. Verify frontend can connect to backend API
3. Test all features: single prediction, batch processing, analytics, dark mode
4. Monitor logs in Render dashboard for any issues

## Model Information

- **Vectorizer**: Count Vectorizer for text feature extraction (7,469 features)
- **Model**: Logistic Regression for binary classification
- **Labels**: String-based ('ham'/'spam') with numeric conversion (0/1)
- **Output**: 0 (ham/not spam), 1 (spam) with confidence scores
- **Performance**: Provides probability scores for prediction confidence

## Enhanced Features

### Analytics Dashboard
- Total predictions count
- Spam vs Ham ratio with percentages
- Average confidence scores
- Text analytics (length, word count)
- Recent predictions overview

### User Interface
- **Tabbed Interface**: Single prediction, batch processing, analytics, history
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live statistics and instant feedback
- **Export Functionality**: Download history as CSV

### Batch Processing
- Analyze multiple messages at once
- Bulk import and processing
- Comprehensive results with individual confidence scores

## Technologies Used

- **Backend**: FastAPI 2.0.0, Python 3.13, scikit-learn, joblib, uvicorn
- **Frontend**: React 18, JavaScript ES6+, CSS3 with CSS Variables
- **ML**: Logistic Regression, Count Vectorizer, NumPy
- **Deployment**: Render (Backend: Web Service, Frontend: Static Site)
- **Development**: Hot reload, CORS enabled, comprehensive error handling

## Project Structure
```
spamDetectionApp/
├── main.py                    # Enhanced FastAPI backend
├── requirements.txt           # Python dependencies
├── count_vectorizer.pkl       # ML vectorizer model
├── logistic_regression_model.pkl # ML prediction model
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Enhanced styling
│   │   └── index.js          # React entry point
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```
