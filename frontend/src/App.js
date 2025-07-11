import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message to check');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch('http://localhost:8001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (err) {
      setError('Error: Could not connect to the spam detection API. Make sure your FastAPI server is running on port 8001.');
    } finally {
      setLoading(false);
    }
  };

  const getResultDisplay = () => {
    if (prediction === null) return null;
    
    const isSpam = prediction === 1;
    return (
      <div className={`result ${isSpam ? 'spam' : 'not-spam'}`}>
        <div className="result-icon">
          {isSpam ? '🚫' : '✅'}
        </div>
        <div className="result-text">
          <strong>{isSpam ? 'SPAM DETECTED' : 'NOT SPAM'}</strong>
          <p>{isSpam ? 'This message appears to be spam.' : 'This message looks legitimate.'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🛡️ Spam Detection</h1>
          <p>Enter a message to check if it's spam or legitimate</p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label htmlFor="message">Message to Check:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here... (e.g., 'Congratulations! You've won a prize!')"
              rows="4"
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading || !message.trim()}>
            {loading ? 'Checking...' : 'Check for Spam'}
          </button>
        </form>

        {error && (
          <div className="error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {getResultDisplay()}

        <div className="examples">
          <h3>Try these examples:</h3>
          <div className="example-buttons">
            <button 
              className="example-btn"
              onClick={() => setMessage("Congratulations! You've won a $1000 gift card. Click here to claim now!")}
            >
              Spam Example
            </button>
            <button 
              className="example-btn"
              onClick={() => setMessage("Hi, how are you doing today? Let's meet for coffee sometime.")}
            >
              Normal Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
