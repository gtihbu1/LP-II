import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from google.cloud import datastore
import pyrebase

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/your-service-account-key.json')  # Replace with your credentials file path
firebase_admin.initialize_app(cred)

# Initialize Pyrebase (for client-side auth operations)
firebase_config = {
    "apiKey": "your-api-key",
    "authDomain": "your-project-id.firebaseapp.com",
    "databaseURL": "https://your-project-id.firebaseio.com",
    "projectId": "your-project-id",
    "storageBucket": "your-project-id.appspot.com",
    "messagingSenderId": "your-messaging-sender-id",
    "appId": "your-app-id"
}
firebase = pyrebase.initialize_app(firebase_config)

# Initialize Datastore client
datastore_client = datastore.Client()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('signup.html')
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    # Check if user is in session
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Get user data from Datastore
    key = datastore_client.key('User', session['user_id'])
    user = datastore_client.get(key)
    
    if not user:
        session.clear()
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', user=user)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password']
    display_name = data.get('displayName', '')
    
    try:
        # Create the user in Firebase
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        
        # Store user data in Datastore
        key = datastore_client.key('User', user.uid)
        entity = datastore.Entity(key=key)
        entity.update({
            'email': email,
            'displayName': display_name,
            'created': datastore.datetime.datetime.now(),
            'lastLogin': None
        })
        datastore_client.put(entity)
        
        # Send email verification
        # Note: In Firebase Admin SDK, you'd typically have to implement this with a custom token
        # and the client-side Firebase SDK
        
        return jsonify({
            'success': True, 
            'message': 'User created successfully', 
            'uid': user.uid
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password']
    
    try:
        # Sign in with email and password (using Pyrebase)
        user = firebase.auth().sign_in_with_email_and_password(email, password)
        # Get user info
        user_info = auth.get_user_by_email(email)
        
        # Update last login time in Datastore
        key = datastore_client.key('User', user_info.uid)
        user_entity = datastore_client.get(key)
        
        if user_entity:
            user_entity['lastLogin'] = datastore.datetime.datetime.now()
            datastore_client.put(user_entity)
        
        # Set user session
        session['user_id'] = user_info.uid
        
        return jsonify({
            'success': True, 
            'message': 'Login successful', 
            'uid': user_info.uid
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/verify-token', methods=['POST'])
def verify_token():
    data = request.get_json()
    
    if not data or 'idToken' not in data:
        return jsonify({'success': False, 'message': 'No token provided'}), 400
    
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(data['idToken'])
        uid = decoded_token['uid']
        
        # Get user data from Datastore
        key = datastore_client.key('User', uid)
        user = datastore_client.get(key)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Set user session
        session['user_id'] = uid
        
        return jsonify({
            'success': True, 
            'message': 'Token verified', 
            'user': {
                'uid': uid,
                'email': user['email'],
                'displayName': user.get('displayName', '')
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 401

@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401
    
    data = request.get_json()
    uid = session['user_id']
    
    try:
        # Update user in Firebase if needed
        update_args = {}
        if 'displayName' in data:
            update_args['display_name'] = data['displayName']
        
        if update_args:
            auth.update_user(uid, **update_args)
        
        # Update user in Datastore
        key = datastore_client.key('User', uid)
        user = datastore_client.get(key)
        
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if 'displayName' in data:
            user['displayName'] = data['displayName']
        
        datastore_client.put(user)
        
        return jsonify({
            'success': True, 
            'message': 'Profile updated successfully'
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)