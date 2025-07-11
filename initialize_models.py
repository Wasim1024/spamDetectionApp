#!/usr/bin/env python3
"""
Model initialization for production deployment
Creates models dynamically if they don't exist or are incompatible
"""
import os
import joblib
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import numpy as np

def create_spam_detection_models():
    """Create spam detection models from scratch"""
    print("Creating spam detection models from scratch...")
    
    # Enhanced training data for better performance
    training_data = [
        # Spam messages
        ("URGENT! You have won $1000000! Click here now to claim your prize!", "spam"),
        ("LIMITED TIME OFFER! Buy now and get 90% discount! No credit check required!", "spam"),
        ("FREE MONEY! Click this link immediately! Act now before it expires!", "spam"),
        ("CONGRATULATIONS! You are the 1000th visitor! Claim your iPhone now!", "spam"),
        ("MAKE $5000 WEEKLY! Work from home! No experience needed!", "spam"),
        ("URGENT: Your account will be suspended! Click here to verify immediately!", "spam"),
        ("WIN BIG! Casino online! 200% bonus! Play now!", "spam"),
        ("WEIGHT LOSS MIRACLE! Lose 30 pounds in 10 days! Order now!", "spam"),
        ("CHEAP VIAGRA! CIALIS! No prescription needed! Buy online now!", "spam"),
        ("DEBT CONSOLIDATION! Reduce payments by 80%! Call now!", "spam"),
        ("GET RICH QUICK! Investment opportunity! 500% returns guaranteed!", "spam"),
        ("HOT SINGLES in your area want to meet you! Click here!", "spam"),
        ("AMAZING DEAL! Designer watches 95% off! Limited stock!", "spam"),
        ("CREDIT REPAIR! Bad credit? No problem! Instant approval!", "spam"),
        ("MILLION DOLLAR LOTTERY! You won! Send details to claim!", "spam"),
        ("FREE GIFT CARD! $500 Amazon voucher! Claim now!", "spam"),
        ("URGENT SECURITY ALERT! Click to secure your account!", "spam"),
        ("LOSE WEIGHT FAST! No diet, no exercise! Buy pills now!", "spam"),
        ("WORK FROM HOME! $200 per hour! No experience! Start today!", "spam"),
        ("CLICK HERE TO CLAIM YOUR PRIZE! Limited time offer!", "spam"),
        
        # Ham (legitimate) messages
        ("Hi there! Hope you're having a great day. Would you like to grab coffee this weekend?", "ham"),
        ("Thank you for your email. I'll get back to you by tomorrow morning.", "ham"),
        ("The meeting has been rescheduled to 3 PM. Please confirm your attendance.", "ham"),
        ("Happy birthday! Hope you have a wonderful celebration today.", "ham"),
        ("Could you please send me the report when you have a moment?", "ham"),
        ("The weather is beautiful today. Perfect for a walk in the park.", "ham"),
        ("I really enjoyed our conversation yesterday. Let's continue it soon.", "ham"),
        ("The new restaurant downtown has excellent reviews. Want to try it?", "ham"),
        ("Please remember to submit your timesheet by Friday.", "ham"),
        ("Thank you for the recommendation. I'll definitely check it out.", "ham"),
        ("The project deadline has been extended by one week.", "ham"),
        ("I hope you feel better soon. Take care of yourself.", "ham"),
        ("The book you mentioned sounds interesting. I'll look for it.", "ham"),
        ("Thanks for helping me with the presentation yesterday.", "ham"),
        ("The traffic was terrible this morning. I barely made it on time.", "ham"),
        ("Would you like to join us for lunch at 12:30?", "ham"),
        ("The conference was very informative. I learned a lot.", "ham"),
        ("Please let me know if you need any assistance with the project.", "ham"),
        ("I appreciate your patience while we resolve this issue.", "ham"),
        ("The team meeting went well. We made good progress.", "ham"),
        ("How was your vacation? I'd love to hear about it.", "ham"),
        ("The quarterly report is due next Monday.", "ham"),
        ("I'll be out of office tomorrow for a doctor's appointment.", "ham"),
        ("Could we reschedule our call to next week?", "ham"),
        ("The presentation slides look great. Well done!", "ham"),
    ]
    
    # Convert to DataFrame
    df = pd.DataFrame(training_data, columns=['text', 'label'])
    
    # Split the data
    X = df['text']
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Create and fit the vectorizer
    vectorizer = CountVectorizer(stop_words='english', max_features=5000, lowercase=True)
    X_train_vectorized = vectorizer.fit_transform(X_train)
    
    # Train the model
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train_vectorized, y_train)
    
    # Test the model
    test_messages = [
        "URGENT! Free money! Click now!",
        "Hello, how are you today?",
    ]
    
    print("Testing new models:")
    for msg in test_messages:
        X_msg = vectorizer.transform([msg])
        prediction = model.predict(X_msg)[0]
        probability = model.predict_proba(X_msg)[0]
        confidence = max(probability)
        
        print(f"  '{msg}' -> {prediction} (confidence: {confidence:.3f})")
    
    return vectorizer, model

def initialize_models():
    """Initialize models, creating them if needed"""
    vectorizer_file = "count_vectorizer.pkl"
    model_file = "logistic_regression_model.pkl"
    
    try:
        # Try to load existing models
        vectorizer = joblib.load(vectorizer_file)
        model = joblib.load(model_file)
        
        # Test the models
        test_text = "URGENT! Free money!"
        X = vectorizer.transform([test_text])
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        confidence = float(probabilities.max())
        
        # Check if we get valid results
        if isinstance(prediction, str) and confidence > 0:
            print("✅ Existing models loaded and working correctly")
            return vectorizer, model
        else:
            print("⚠️ Existing models not working properly, recreating...")
            raise Exception("Models not working")
            
    except Exception as e:
        print(f"⚠️ Could not load existing models: {e}")
        print("🔧 Creating new models...")
        
        # Create new models
        vectorizer, model = create_spam_detection_models()
        
        # Save the new models
        joblib.dump(vectorizer, vectorizer_file)
        joblib.dump(model, model_file)
        print(f"✅ New models saved: {vectorizer_file}, {model_file}")
        
        return vectorizer, model

if __name__ == "__main__":
    vectorizer, model = initialize_models()
    print("Model initialization complete!")
