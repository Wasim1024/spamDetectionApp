import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [batchMessages, setBatchMessages] = useState(['']);
  const [prediction, setPrediction] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  
  // API base URL - update this to your Render URL
  const API_BASE = 'https://spamdetectionapp-1.onrender.com'; // Change to your Render URL when deployed

  useEffect(() => {
    fetchHistory();
    fetchAnalytics();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?limit=10`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`);
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

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
      const response = await fetch(`${API_BASE}/predict`, {
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
      setPrediction(data);
      fetchHistory();
      fetchAnalytics();
    } catch (err) {
      setError('Error: Could not connect to the spam detection API. Make sure your API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    
    const validMessages = batchMessages.filter(msg => msg.trim());
    if (validMessages.length === 0) {
      setError('Please enter at least one message to check');
      return;
    }

    setLoading(true);
    setError('');
    setBatchResults(null);

    try {
      const response = await fetch(`${API_BASE}/predict-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts: validMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get batch predictions');
      }

      const data = await response.json();
      setBatchResults(data);
      fetchHistory();
      fetchAnalytics();
    } catch (err) {
      setError('Error: Could not connect to the spam detection API.');
    } finally {
      setLoading(false);
    }
  };

  const addBatchMessage = () => {
    setBatchMessages([...batchMessages, '']);
  };

  const updateBatchMessage = (index, value) => {
    const newMessages = [...batchMessages];
    newMessages[index] = value;
    setBatchMessages(newMessages);
  };

  const removeBatchMessage = (index) => {
    if (batchMessages.length > 1) {
      const newMessages = batchMessages.filter((_, i) => i !== index);
      setBatchMessages(newMessages);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE' });
      setHistory([]);
      setAnalytics(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const exportResults = () => {
    const dataToExport = {
      history: history,
      analytics: analytics,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `spam-detection-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getResultDisplay = (result) => {
    if (!result) return null;
    
    const isSpam = result.prediction === 1;
    const confidencePercent = (result.confidence * 100).toFixed(1);
    
    return (
      <div className={`result ${isSpam ? 'spam' : 'not-spam'}`}>
        <div className="result-icon">
          {isSpam ? '🚫' : '✅'}
        </div>
        <div className="result-text">
          <strong>{isSpam ? 'SPAM DETECTED' : 'NOT SPAM'}</strong>
          <p>{isSpam ? 'This message appears to be spam.' : 'This message looks legitimate.'}</p>
          <div className="result-details">
            <span className="confidence">Confidence: {confidencePercent}%</span>
            <span className="stats">Length: {result.text_length} chars | Words: {result.word_count}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <header className="header">
          <h1>🛡️ Enhanced Spam Detection</h1>
          <p>AI-powered message analysis with advanced features</p>
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            Single Message
          </button>
          <button 
            className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            Batch Analysis
          </button>
          <button 
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'single' && (
          <div className="tab-content">
            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <label htmlFor="message">Message to Check:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows="4"
                  disabled={loading}
                />
                <div className="text-stats">
                  Characters: {message.length} | Words: {message.split(/\s+/).filter(w => w).length}
                </div>
              </div>

              <button type="submit" disabled={loading || !message.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Message'}
              </button>
            </form>

            {getResultDisplay(prediction)}

            <div className="examples">
              <h3>Try these examples:</h3>
              <div className="example-buttons">
                <button 
                  className="example-btn"
                  onClick={() => setMessage("URGENT! You've won $10,000! Click this link immediately to claim your prize before it expires!")}
                >
                  Spam Example
                </button>
                <button 
                  className="example-btn"
                  onClick={() => setMessage("Hi there! Hope you're having a great day. Would you like to grab coffee this weekend?")}
                >
                  Normal Example
                </button>
                <button 
                  className="example-btn"
                  onClick={() => setMessage("LIMITED TIME OFFER! Buy now and get 90% discount! No credit check required!")}
                >
                  Marketing Spam
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="tab-content">
            <form onSubmit={handleBatchSubmit} className="form">
              <div className="batch-inputs">
                <label>Messages to Analyze:</label>
                {batchMessages.map((msg, index) => (
                  <div key={index} className="batch-input-row">
                    <textarea
                      value={msg}
                      onChange={(e) => updateBatchMessage(index, e.target.value)}
                      placeholder={`Message ${index + 1}...`}
                      rows="2"
                      disabled={loading}
                    />
                    {batchMessages.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeBatchMessage(index)}
                        className="remove-btn"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addBatchMessage} className="add-btn">
                  ➕ Add Message
                </button>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Analyzing Batch...' : `Analyze ${batchMessages.filter(m => m.trim()).length} Messages`}
              </button>
            </form>

            {batchResults && (
              <div className="batch-results">
                <h3>Batch Results ({batchResults.total_processed} messages)</h3>
                {batchResults.results.map((result, index) => (
                  <div key={index} className="batch-result-item">
                    <div className="batch-result-header">
                      <strong>Message {index + 1}</strong>
                      <span className={`badge ${result.prediction === 1 ? 'spam' : 'ham'}`}>
                        {result.result.toUpperCase()} ({(result.confidence * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <p className="batch-result-text">{result.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            {analytics && analytics.total_predictions > 0 ? (
              <div className="analytics">
                <h3>Analytics Dashboard</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>Total Predictions</h4>
                    <p className="stat-number">{analytics.total_predictions}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Spam Detected</h4>
                    <p className="stat-number spam-color">{analytics.spam_count}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Legitimate Messages</h4>
                    <p className="stat-number ham-color">{analytics.ham_count}</p>
                  </div>
                  <div className="stat-card">
                    <h4>Spam Rate</h4>
                    <p className="stat-number">{analytics.spam_percentage.toFixed(1)}%</p>
                  </div>
                  <div className="stat-card">
                    <h4>Avg Confidence</h4>
                    <p className="stat-number">{(analytics.average_confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div className="stat-card">
                    <h4>Avg Text Length</h4>
                    <p className="stat-number">{analytics.average_text_length.toFixed(0)} chars</p>
                  </div>
                </div>
                <button onClick={exportResults} className="export-btn">
                  📥 Export Results
                </button>
              </div>
            ) : (
              <div className="no-data">
                <p>No analytics data available. Make some predictions first!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="history-header">
              <h3>Prediction History</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="clear-btn">
                  🗑️ Clear History
                </button>
              )}
            </div>
            {history.length > 0 ? (
              <div className="history-list">
                {history.slice().reverse().map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header-row">
                      <span className={`badge ${item.prediction === 1 ? 'spam' : 'ham'}`}>
                        {item.result.toUpperCase()}
                      </span>
                      <span className="timestamp">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="history-text">{item.text}</p>
                    <div className="history-stats">
                      Confidence: {(item.confidence * 100).toFixed(1)}% | 
                      Length: {item.text_length} chars | 
                      Words: {item.word_count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No predictions made yet. Start analyzing messages!</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error">
            <span>⚠️</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
