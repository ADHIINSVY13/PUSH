import os
import json
import time
import csv
from datetime import datetime
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from backend.lyrics_processor import LyricsProcessor

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for API endpoints

# Get the absolute path to the project directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize the lyrics processor
lyrics_processor = LyricsProcessor()

# Define paths for frontend files
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

# Define path for search log
SEARCH_LOG_PATH = os.path.join(BASE_DIR, 'data', 'search_log.csv')

# Ensure data directory exists
os.makedirs(os.path.dirname(SEARCH_LOG_PATH), exist_ok=True)

# Create search log file if it doesn't exist
if not os.path.exists(SEARCH_LOG_PATH):
    with open(SEARCH_LOG_PATH, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['timestamp', 'query'])


# Log search query to CSV file with timestamp
def log_search_query(query):
    """Log search query to CSV file with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    with open(SEARCH_LOG_PATH, 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([timestamp, query])


@app.route('/api/search', methods=['GET'])
def search_lyrics():
    """Search for lyrics by song title and return lyrics with recommendations"""
    song_title = request.args.get('title', '')
    
    if not song_title:
        return jsonify({'error': 'No song title provided', 'found': False}), 400
    
    # Log the search query
    log_search_query(song_title)
    
    # Find the lyrics
    result = lyrics_processor.find_lyrics(song_title)
    
    if not result:
        return jsonify({'found': False}), 404
    
    # Get song title, artist, and lyrics
    title = result.get('title', 'Unknown')
    artist = result.get('artist', 'Unknown')
    lyrics = result.get('lyrics', 'No lyrics found.')
    
    # Get recommendations (maximum 5)
    recommendations = lyrics_processor.get_recommendations(title, lyrics)
    
    # Format the response
    response = {
        'found': True,
        'title': title,
        'artist': artist,
        'lyrics': lyrics,
        'recommendations': recommendations
    }
    
    return jsonify(response)


@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Get trending songs based on search log"""
    trending_songs = []
    
    try:
        # Check if search log exists
        if os.path.exists(SEARCH_LOG_PATH):
            # Read search log and count occurrences
            query_counts = {}
            
            with open(SEARCH_LOG_PATH, 'r') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                
                for row in reader:
                    if len(row) >= 2:  # Ensure row has timestamp and query
                        query = row[1].strip()
                        
                        if query:
                            if query in query_counts:
                                query_counts[query] += 1
                            else:
                                query_counts[query] = 1
            
            # Sort by count (descending)
            sorted_queries = sorted(query_counts.items(), key=lambda x: x[1], reverse=True)
            
            # Take top 10 or less
            top_queries = sorted_queries[:10]
            
            # Format as response
            for query, count in top_queries:
                trending_songs.append({
                    'title': query,
                    'count': count
                })
                
    except Exception as e:
        app.logger.error(f"Error getting trending songs: {e}")
    
    return jsonify({'trending': trending_songs})


# Serve static files from the frontend directory
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the frontend directory"""
    # Map routes to HTML files for the multi-page application
    if path in ['search', 'team', 'contact', 'trending', 'artists', 'guitar']:
        path = f"{path}.html"
    
    # Check if the file exists
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    
    # If not found, return the index.html for client-side routing
    return send_from_directory(FRONTEND_DIR, 'index.html')


# Additional routes for specific pages (for clarity)
@app.route('/search')
def search_page():
    """Serve the search page"""
    return send_from_directory(FRONTEND_DIR, 'search.html')


@app.route('/trending')
def trending_page():
    """Serve the trending page"""
    return send_from_directory(FRONTEND_DIR, 'trending.html')


@app.route('/artists')
def artists_page():
    """Serve the artists page"""
    return send_from_directory(FRONTEND_DIR, 'artists.html')


@app.route('/team')
def team_page():
    """Serve the team page"""
    return send_from_directory(FRONTEND_DIR, 'team.html')


@app.route('/contact')
def contact_page():
    """Serve the contact page"""
    return send_from_directory(FRONTEND_DIR, 'contact.html')


@app.route('/guitar')
def guitar_page():
    """Serve the guitar interactive page"""
    return send_from_directory(FRONTEND_DIR, 'guitar.html')


# Error handling
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(FRONTEND_DIR, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)