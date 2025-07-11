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
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  // API base URL - update this to your Render URL
  const API_BASE = 'https://spamdetectionapp-1.onrender.com';

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      setConnectionStatus('checking');
      const response = await fetch(`${API_BASE}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        setConnectionStatus('connected');
        fetchHistory();
        fetchAnalytics();
      } else if (response.status === 404) {
        setConnectionStatus('disconnected');
        setError('🚨 Server deployment issue detected! The Render service appears to be down or not deployed. This usually happens when: 1) The service hasn\'t been deployed yet, 2) There was a deployment failure, or 3) The service is sleeping and needs to be awakened. Please contact the administrator or try again in a few minutes.');
      } else {
        setConnectionStatus('disconnected');
        setError(`Server responded with error ${response.status}. Please try again in a few moments.`);
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        setError('🌐 Network connection failed. The server may be starting up (this can take 30-60 seconds on Render) or there may be a connectivity issue. Please check your internet connection and try again.');
      } else {
        setError('Cannot connect to server. Please try again later.');
      }
      console.error('Connection error:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?limit=10`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      if (connectionStatus === 'connected') {
        setError('Failed to load history data.');
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      if (connectionStatus === 'connected') {
        setError('Failed to load analytics data.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Please enter a message to check');
      return;
    }

    if (connectionStatus !== 'connected') {
      setError('Not connected to server. Please wait for connection or refresh the page.');
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
          'Accept': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setPrediction(data);
      fetchHistory();
      fetchAnalytics();
    } catch (err) {
      console.error('Prediction error:', err);
      setError(`Error: ${err.message}. Please check your connection and try again.`);
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
          <h1>AI Spam Detection</h1>
          <p>AI-powered message analysis with advanced features</p>
          {connectionStatus === 'checking' && (
            <div className="connection-status checking">
              <span>🔄</span> Connecting to server... <small>(API: {API_BASE})</small>
            </div>
          )}
          {connectionStatus === 'disconnected' && (
            <div className="connection-status disconnected">
              <span>⚠️</span> Server disconnected <small>(API: {API_BASE})</small>
              <button onClick={checkServerConnection} className="retry-btn">
                🔄 Retry Connection
              </button>
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="connection-status connected">
              <span>✅</span> Connected to server <small>(API: {API_BASE})</small>
            </div>
          )}
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
            {connectionStatus === 'disconnected' && (
              <div className="deployment-status">
                <h3>🚨 Deployment Status</h3>
                <div className="status-card error">
                  <h4>Server Connection Failed</h4>
                  <p><strong>API Endpoint:</strong> {API_BASE}</p>
                  <p><strong>Issue:</strong> The Render deployment appears to be down or not responding.</p>
                  
                  <h5>Possible Causes:</h5>
                  <ul>
                    <li>🛌 <strong>Service Sleeping:</strong> Render free tier services sleep after 15 minutes of inactivity</li>
                    <li>⚠️ <strong>Deployment Failed:</strong> Recent code changes may have caused deployment issues</li>
                    <li>🔧 <strong>Service Not Deployed:</strong> The service may need to be manually deployed</li>
                    <li>📦 <strong>Dependency Issues:</strong> Missing packages or environment problems</li>
                  </ul>
                  
                  <h5>Troubleshooting Steps:</h5>
                  <ol>
                    <li>Wait 60-90 seconds for the service to wake up, then click "Retry Connection"</li>
                    <li>Check the Render dashboard for deployment logs and errors</li>
                    <li>Verify all dependencies are listed in requirements.txt</li>
                    <li>Ensure the start command is correctly configured</li>
                    <li>Check for any recent code changes that might have broken the deployment</li>
                  </ol>
                  
                  <button onClick={checkServerConnection} className="retry-btn large">
                    🔄 Retry Connection
                  </button>
                </div>
              </div>
            )}
            
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
