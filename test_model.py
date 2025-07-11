#!/usr/bin/env python3
import joblib
import numpy as np

try:
    # Load the models
    vectorizer = joblib.load("count_vectorizer.pkl")
    model = joblib.load("logistic_regression_model.pkl")
    
    print("Models loaded successfully")
    print(f"Model type: {type(model)}")
    print(f"Vectorizer type: {type(vectorizer)}")
    
    # Test with a simple message
    test_text = "Hello world"
    print(f"\nTesting with: '{test_text}'")
    
    # Transform the text
    X = vectorizer.transform([test_text])
    print(f"Transformed shape: {X.shape}")
    
    # Make prediction
    prediction = model.predict(X)
    print(f"Raw prediction: {prediction}")
    print(f"Prediction type: {type(prediction[0])}")
    print(f"Prediction value: {prediction[0]}")
    
    # Get probabilities
    probabilities = model.predict_proba(X)[0]
    print(f"Probabilities: {probabilities}")
    
    # Convert prediction to int
    pred_int = int(prediction[0])
    print(f"Prediction as int: {pred_int}")
    
    result = "spam" if pred_int == 1 else "ham"
    print(f"Result: {result}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
