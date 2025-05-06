from backend.app import app  # Import the Flask app from backend/app.py

# This file is used to run the application with gunicorn
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)