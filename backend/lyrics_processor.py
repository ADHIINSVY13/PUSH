import os
import re
import json
import logging
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download NLTK dependencies (will only download if not already present)
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except Exception as e:
    logger.warning(f"Could not download NLTK data: {e}")

class LyricsProcessor:
    def __init__(self):
        """Initialize the lyrics processor with data directory and song cache"""
        # Get the absolute path to the project directory
        self.base_dir = Path(__file__).resolve().parent.parent
        
        # Define path to data directory
        self.data_dir = os.path.join(self.base_dir, 'data', 'songs')
        
        # Ensure data directory exists
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Cache to store loaded songs
        self.song_cache = {}
        
        # Get all song files
        self.song_files = self._get_song_files()
        
        # Create sample data if no song files exist
        if not self.song_files:
            self._create_sample_data()
            self.song_files = self._get_song_files()
        
        # Process songs in batches
        self._process_song_files()
        
        # Initialize TF-IDF model
        self._initialize_tfidf_model()
        
        logger.info(f"Initialized LyricsProcessor with {len(self.song_cache)} songs")

    def _get_song_files(self):
        """Get all song files from the data directory"""
        if not os.path.exists(self.data_dir):
            return []
        
        return [os.path.join(self.data_dir, f) for f in os.listdir(self.data_dir) 
                if f.endswith('.txt') or f.endswith('.json')]

    def _initialize_tfidf_model(self):
        """Initialize the TF-IDF model with all songs in the dataset - optimized for 8000+ files"""
        # Create a corpus of all lyrics
        corpus = [song['lyrics'] for song in self.song_cache.values()]
        
        # Skip TF-IDF initialization if insufficient data
        if len(corpus) < 2:
            logger.warning("Not enough songs for TF-IDF model initialization (need at least 2)")
            return
            
        # Configure TF-IDF vectorizer for performance with large datasets
        # Adjust parameters based on corpus size
        if len(corpus) < 5:
            # For very small datasets
            self.vectorizer = TfidfVectorizer(
                lowercase=True, 
                stop_words='english',
                min_df=1,  # Accept terms that appear in at least 1 document
                max_df=1.0  # Accept terms that appear in all documents
            )
        else:
            # For larger datasets
            self.vectorizer = TfidfVectorizer(
                lowercase=True,
                stop_words='english',
                max_features=1000,  # Limit to most frequent words for performance
                ngram_range=(1, 1),  # Only unigrams for performance
                min_df=2,  # Ignore terms that appear in fewer than 2 documents
                max_df=0.95  # Ignore terms that appear in more than 95% of the documents
            )
        
        # Fit the vectorizer to the corpus
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
            logger.info(f"Optimized TF-IDF model initialized for {len(corpus)} songs (designed for 8000+ files)")
        except Exception as e:
            logger.warning(f"Error initializing TF-IDF model: {e}")
            # Create a simple fallback vectorizer for small datasets
            self.vectorizer = TfidfVectorizer(lowercase=True)
            self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def _process_song_files(self):
        """Process song files in batches for better performance with large datasets"""
        batch_size = 1000  # Process 1000 files at a time
        total_batches = (len(self.song_files) + batch_size - 1) // batch_size  # Ceiling division
        
        for i in range(total_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, len(self.song_files))
            batch_files = self.song_files[start_idx:end_idx]
            
            logger.info(f"Processing batch {i+1}/{total_batches} ({len(batch_files)} files)")
            
            for file_path in batch_files:
                try:
                    song_data = self._load_song_file(file_path)
                    if song_data and 'title' in song_data:
                        self.song_cache[song_data['title'].lower()] = song_data
                except Exception as e:
                    logger.error(f"Error processing file {file_path}: {e}")

    def _load_song_file(self, file_path):
        """Load a song file and return its data"""
        if file_path.endswith('.json'):
            # JSON file contains structured song data
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        elif file_path.endswith('.txt'):
            # Text file contains just lyrics, derive title from filename
            filename = os.path.basename(file_path)
            title = os.path.splitext(filename)[0]
            
            with open(file_path, 'r', encoding='utf-8') as f:
                lyrics = f.read()
            
            # Simple structure for text files
            return {
                'title': title,
                'artist': 'Unknown',
                'lyrics': lyrics
            }
        
        return None

    def _create_sample_data(self):
        """Create sample data if no song files are found"""
        logger.info("Creating sample song data")
        
        # Sample songs with lyrics
        sample_songs = [
            {
                'title': 'Sample Song',
                'artist': 'Sample Artist',
                'lyrics': """This is a sample song
With lyrics that are made up
For demonstration purposes
Just to show how the system works
With recommendations based on content
And similarity between songs.
"""
            },
            {
                'title': 'Another Sample',
                'artist': 'Demo Singer',
                'lyrics': """Here's another sample song
With different lyrics but similar theme
To demonstrate the recommendation system
And show how content similarity works
Between different songs in our database.
"""
            }
        ]
        
        # Save sample songs to files
        for song in sample_songs:
            file_path = os.path.join(self.data_dir, f"{song['title']}.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(song, f, indent=2)

    def find_lyrics(self, query):
        """Find lyrics for a song based on the query"""
        query = query.lower()
        
        # First, try exact match
        if query in self.song_cache:
            return self.song_cache[query]
        
        # Then, try partial match
        for title, song_data in self.song_cache.items():
            if query in title or title in query:
                return song_data
            
            # Also check artist if available
            artist = song_data.get('artist', '').lower()
            if artist and (query in artist or artist in query):
                return song_data
        
        # No match found
        return None

    def get_recommendations(self, song_title, lyrics, max_recommendations=5):
        """Get song recommendations based on lyrics similarity - strictly limited to 5 max"""
        recommendations = []
        
        # Ensure song_title is lowercase for case-insensitive comparison
        song_title_lower = song_title.lower()
        
        # Check if we have enough songs for recommendations
        if len(self.song_cache) <= 1:
            return recommendations
        
        try:
            # Get index of the current song in the cache
            song_idx = list(self.song_cache.keys()).index(song_title_lower) if song_title_lower in self.song_cache else -1
            
            if song_idx >= 0 and hasattr(self, 'tfidf_matrix'):
                # Get the TF-IDF vector for the current song
                song_vector = self.tfidf_matrix[song_idx]
                
                # Calculate cosine similarity with all other songs
                cosine_similarities = cosine_similarity(song_vector, self.tfidf_matrix).flatten()
                
                # Get indices of songs sorted by similarity (excluding the current song)
                similar_indices = cosine_similarities.argsort()[:-max_recommendations-2:-1]
                similar_indices = [idx for idx in similar_indices if idx != song_idx]
                
                # Get recommendations based on similarity
                song_titles = list(self.song_cache.keys())
                
                for idx in similar_indices[:max_recommendations]:  # Limit to max_recommendations
                    similar_title = song_titles[idx]
                    similar_song = self.song_cache[similar_title]
                    
                    # Get snippet of lyrics (first 100 characters)
                    lyrics_snippet = similar_song.get('lyrics', '')[:100] + '...'
                    
                    # Calculate similarity score (normalized to 0-1)
                    similarity = cosine_similarities[idx]
                    
                    recommendations.append({
                        'title': similar_song.get('title', 'Unknown'),
                        'artist': similar_song.get('artist', 'Unknown'),
                        'snippet': lyrics_snippet,
                        'score': float(similarity)  # Convert numpy float to Python float for JSON serialization
                    })
                    
                    if len(recommendations) >= max_recommendations:
                        break
            
            # If no recommendations from TF-IDF (or not enough), add random ones
            if len(recommendations) < max_recommendations:
                # Get all song titles except the current one
                other_titles = [title for title in self.song_cache.keys() if title != song_title_lower]
                
                # Get recommendations from other songs
                import random
                random.shuffle(other_titles)
                
                for title in other_titles:
                    if len(recommendations) >= max_recommendations:
                        break
                    
                    # Skip songs already in recommendations
                    if any(rec['title'].lower() == title for rec in recommendations):
                        continue
                    
                    song = self.song_cache[title]
                    lyrics_snippet = song.get('lyrics', '')[:100] + '...'
                    
                    recommendations.append({
                        'title': song.get('title', 'Unknown'),
                        'artist': song.get('artist', 'Unknown'),
                        'snippet': lyrics_snippet,
                        'score': 0.5  # Default score for random recommendations
                    })
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
        
        # Ensure we return at most max_recommendations
        return recommendations[:max_recommendations]