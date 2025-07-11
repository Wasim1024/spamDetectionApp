#!/usr/bin/env python3
"""
Retrain the spam detection model with current scikit-learn version
"""
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Create sample spam detection data
# In a real scenario, you'd load this from a dataset
sample_data = [
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
]

print("Creating new spam detection model...")

# Convert to DataFrame
df = pd.DataFrame(sample_data, columns=['text', 'label'])
print(f"Dataset size: {len(df)} messages")
print(f"Spam messages: {len(df[df.label == 'spam'])}")
print(f"Ham messages: {len(df[df.label == 'ham'])}")

# Split the data
X = df['text']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Create and fit the vectorizer
vectorizer = CountVectorizer(stop_words='english', max_features=5000, lowercase=True)
X_train_vectorized = vectorizer.fit_transform(X_train)
X_test_vectorized = vectorizer.transform(X_test)

print(f"Vocabulary size: {len(vectorizer.vocabulary_)}")

# Train the model
model = LogisticRegression(random_state=42, max_iter=1000)
model.fit(X_train_vectorized, y_train)

# Test the model
y_pred = model.predict(X_test_vectorized)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"Accuracy: {accuracy:.3f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Test with sample messages
test_messages = [
    "Hello, how are you doing today?",
    "URGENT! You have won $1000000! Click here now!",
    "Thank you for your email, I'll respond soon.",
    "FREE MONEY! Act now before it expires!"
]

print("\nTesting with sample messages:")
for msg in test_messages:
    X_msg = vectorizer.transform([msg])
    prediction = model.predict(X_msg)[0]
    probability = model.predict_proba(X_msg)[0]
    confidence = max(probability)
    
    print(f"Message: {msg[:50]}...")
    print(f"Prediction: {prediction} (confidence: {confidence:.3f})")
    print()

# Save the models
print("Saving models...")
joblib.dump(vectorizer, 'count_vectorizer.pkl')
joblib.dump(model, 'logistic_regression_model.pkl')

print("✅ New models saved successfully!")
print("✅ Models are now compatible with current scikit-learn version")
