#!/usr/bin/env python3
"""
Simple mock server for testing the spam detection frontend locally
This provides all the same endpoints as the real backend but with mock data
"""
import json
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import random

# Mock data storage
mock_history = []
mock_analytics = {
    "total_predictions": 0,
    "spam_count": 0,
    "ham_count": 0,
    "spam_percentage": 0.0,
    "average_confidence": 0.0,
    "average_text_length": 0.0
}

def add_cors_headers(handler):
    """Add CORS headers to allow frontend access"""
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')

def mock_prediction(text):
    """Generate a mock spam prediction"""
    # Simple mock logic: if text contains certain spam keywords, mark as spam
    spam_keywords = ['urgent', 'winner', 'free', 'limited time', 'click now', 'offer', 'discount']
    text_lower = text.lower()
    
    spam_score = 0
    for keyword in spam_keywords:
        if keyword in text_lower:
            spam_score += 1
    
    # Calculate confidence and prediction
    if spam_score >= 2:
        prediction = 1  # spam
        confidence = min(0.7 + (spam_score * 0.1), 0.95)
    else:
        prediction = 0  # not spam
        confidence = min(0.6 + (len(text) / 100) * 0.2, 0.9)
    
    return {
        "prediction": prediction,
        "confidence": confidence,
        "result": "spam" if prediction == 1 else "ham",
        "text_length": len(text),
        "word_count": len(text.split()),
        "timestamp": datetime.datetime.now().isoformat()
    }

def update_analytics():
    """Update analytics based on current history"""
    global mock_analytics
    if not mock_history:
        return
    
    total = len(mock_history)
    spam_count = sum(1 for item in mock_history if item['prediction'] == 1)
    ham_count = total - spam_count
    avg_confidence = sum(item['confidence'] for item in mock_history) / total
    avg_length = sum(item['text_length'] for item in mock_history) / total
    
    mock_analytics = {
        "total_predictions": total,
        "spam_count": spam_count,
        "ham_count": ham_count,
        "spam_percentage": (spam_count / total) * 100 if total > 0 else 0,
        "average_confidence": avg_confidence,
        "average_text_length": avg_length
    }

class MockSpamDetectionHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
        pass
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        add_cors_headers(self)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"📡 GET {path}")
        
        if path == '/':
            # Root endpoint
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"message": "Mock Spam Detection API", "status": "running"}
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/history':
            # History endpoint
            query_params = parse_qs(parsed_path.query)
            limit = int(query_params.get('limit', [10])[0])
            
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {"history": mock_history[-limit:]}
            self.wfile.write(json.dumps(response).encode())
        
        elif path == '/analytics':
            # Analytics endpoint
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(mock_analytics).encode())
        
        else:
            self.send_response(404)
            add_cors_headers(self)
            self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"📡 POST {path}")
        
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode())
        except:
            self.send_response(400)
            add_cors_headers(self)
            self.end_headers()
            return
        
        if path == '/predict':
            # Single prediction
            text = data.get('text', '')
            if not text:
                self.send_response(400)
                add_cors_headers(self)
                self.end_headers()
                return
            
            prediction = mock_prediction(text)
            prediction['text'] = text
            
            # Add to history
            mock_history.append(prediction.copy())
            update_analytics()
            
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(prediction).encode())
        
        elif path == '/predict-batch':
            # Batch prediction
            texts = data.get('texts', [])
            if not texts:
                self.send_response(400)
                add_cors_headers(self)
                self.end_headers()
                return
            
            results = []
            for text in texts:
                prediction = mock_prediction(text)
                prediction['text'] = text
                results.append(prediction)
                
                # Add to history
                mock_history.append(prediction.copy())
            
            update_analytics()
            
            response = {
                "results": results,
                "total_processed": len(results)
            }
            
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            add_cors_headers(self)
            self.end_headers()
    
    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"📡 DELETE {path}")
        
        if path == '/history':
            # Clear history
            global mock_history, mock_analytics
            mock_history = []
            mock_analytics = {
                "total_predictions": 0,
                "spam_count": 0,
                "ham_count": 0,
                "spam_percentage": 0.0,
                "average_confidence": 0.0,
                "average_text_length": 0.0
            }
            
            self.send_response(200)
            add_cors_headers(self)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"message": "History cleared"}
            self.wfile.write(json.dumps(response).encode())
        
        else:
            self.send_response(404)
            add_cors_headers(self)
            self.end_headers()

def main():
    port = 8000
    server = HTTPServer(('localhost', port), MockSpamDetectionHandler)
    
    print("🎭 Mock Spam Detection API Server")
    print("=" * 40)
    print(f"🌐 Server running at: http://localhost:{port}")
    print(f"📋 Available endpoints:")
    print(f"   GET  /              - API status")
    print(f"   POST /predict       - Single prediction")
    print(f"   POST /predict-batch - Batch prediction")
    print(f"   GET  /history       - Get prediction history")
    print(f"   GET  /analytics     - Get analytics")
    print(f"   DELETE /history     - Clear history")
    print("=" * 40)
    print("🔥 Frontend should now connect successfully!")
    print("⏹️  Press Ctrl+C to stop the server")
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        server.server_close()

if __name__ == '__main__':
    main()
