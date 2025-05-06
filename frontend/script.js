document.addEventListener('DOMContentLoaded', function() {
    // API endpoint (adjust if needed)
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : `https://${window.location.hostname}/api`;
    
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchInputMain = document.getElementById('search-input-main');
    const searchButtonMain = document.getElementById('search-button-main');
    const searchStatus = document.getElementById('search-status');
    const resultsSection = document.getElementById('results-section');
    const songTitle = document.getElementById('song-title');
    const lyricsDisplay = document.getElementById('lyrics-display');
    const recommendationsList = document.getElementById('recommendations-list');
    const noRecommendations = document.getElementById('no-recommendations');
    
    // Event listeners
    searchButton.addEventListener('click', searchLyrics);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLyrics();
        }
    });
    
    // Add event listeners for main search input and button
    if (searchButtonMain) {
        searchButtonMain.addEventListener('click', function() {
            if (searchInputMain && searchInputMain.value.trim()) {
                searchInput.value = searchInputMain.value.trim();
                searchLyrics();
                // Scroll to search results
                document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    if (searchInputMain) {
        searchInputMain.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (searchInputMain.value.trim()) {
                    searchInput.value = searchInputMain.value.trim();
                    searchLyrics();
                    // Scroll to search results
                    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    // Function to search lyrics
    function searchLyrics() {
        const query = searchInput.value.trim();
        
        if (!query) {
            showStatus('Please enter a song title', 'warning');
            return;
        }
        
        // Show loading status
        showStatus('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...', 'info');
        
        // Make API request
        fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Clear status
                searchStatus.innerHTML = '';
                
                if (data.lyrics) {
                    // Display results
                    displayResults(data);
                } else {
                    // No lyrics found
                    showStatus(`No lyrics found for "${query}"`, 'danger');
                    resultsSection.classList.add('d-none');
                }
            })
            .catch(error => {
                console.error('Error fetching lyrics:', error);
                showStatus('Error fetching lyrics. Please try again.', 'danger');
                resultsSection.classList.add('d-none');
            });
    }
    
    // Function to display search results
    function displayResults(data) {
        // Display song title and lyrics
        songTitle.textContent = data.song_title;
        lyricsDisplay.textContent = data.lyrics;
        
        // Display recommendations
        displayRecommendations(data.recommendations);
        
        // Show results section
        resultsSection.classList.remove('d-none');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to display recommendations
    function displayRecommendations(recommendations) {
        // Clear previous recommendations
        recommendationsList.innerHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            // Show recommendations
            noRecommendations.classList.add('d-none');
            
            recommendations.forEach(song => {
                const li = document.createElement('li');
                li.className = 'list-group-item recommendation-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <span>${song}</span>
                    <i class="fas fa-search"></i>
                `;
                
                // Add click event to search for this song
                li.addEventListener('click', () => {
                    searchInput.value = song;
                    searchLyrics();
                });
                
                recommendationsList.appendChild(li);
            });
        } else {
            // No recommendations available
            noRecommendations.classList.remove('d-none');
        }
    }
    
    // Function to show status message
    function showStatus(message, type) {
        searchStatus.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
});
