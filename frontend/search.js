document.addEventListener('DOMContentLoaded', function() {
    // API endpoint (adjust if needed)
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : `${window.location.protocol}//${window.location.host}/api`;
    
    // Get form elements
    const lyricsForm = document.getElementById('lyricsForm');
    const songTitleInput = document.getElementById('songTitle');
    const searchButton = document.getElementById('searchButton');
    
    // Get result containers
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusMessage = document.getElementById('statusMessage');
    const searchResults = document.getElementById('search-results');
    const songTitleHeading = document.getElementById('songTitleHeading');
    const songArtist = document.getElementById('songArtist');
    const lyricsContainer = document.getElementById('lyricsContainer');
    const recommendationsSection = document.getElementById('recommendations');
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    
    // Get action buttons
    const copyLyricsButton = document.getElementById('copyLyrics');
    const shareLyricsButton = document.getElementById('shareLyrics');
    
    // Initialize recent searches
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    updateRecentSearchesList();
    
    // Check URL parameters for search query
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam) {
        songTitleInput.value = queryParam;
        searchLyrics(queryParam);
    }
    
    // Add event listener to form
    if (lyricsForm) {
        lyricsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const songTitle = songTitleInput.value.trim();
            
            if (songTitle) {
                searchLyrics(songTitle);
            }
        });
    }
    
    // Function to search for lyrics
    function searchLyrics(songTitle) {
        // Show loading spinner
        showLoading(true);
        
        // Hide previous results and status messages
        searchResults.style.display = 'none';
        recommendationsSection.style.display = 'none';
        statusMessage.style.display = 'none';
        
        // Make the API request
        fetch(`${API_URL}/search?title=${encodeURIComponent(songTitle)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Hide loading spinner
                showLoading(false);
                
                // Check if lyrics were found
                if (data.found) {
                    // Add to recent searches
                    addToRecentSearches(songTitle);
                    
                    // Display the results
                    displayResults(data);
                } else {
                    // Show not found message
                    showStatus(`No lyrics found for "${songTitle}". Please try another search.`, 'warning');
                }
            })
            .catch(error => {
                console.error('Error fetching lyrics:', error);
                showLoading(false);
                showStatus('An error occurred while searching for lyrics. Please try again later.', 'danger');
            });
    }
    
    // Function to display search results
    function displayResults(data) {
        // Update song title and artist
        songTitleHeading.textContent = data.title || 'Unknown Title';
        songArtist.textContent = data.artist || 'Unknown Artist';
        
        // Update lyrics content with proper formatting
        lyricsContainer.textContent = data.lyrics || 'No lyrics available.';
        
        // Show search results section
        searchResults.style.display = 'block';
        
        // Display recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
            displayRecommendations(data.recommendations);
        } else {
            recommendationsSection.style.display = 'none';
        }
        
        // Scroll to results
        searchResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to display recommendations
    function displayRecommendations(recommendations) {
        // Clear previous recommendations
        recommendationsContainer.innerHTML = '';
        
        // Create recommendation cards
        recommendations.forEach(rec => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            col.innerHTML = `
                <div class="glass-card h-100 recommendation-card">
                    <div class="card-body">
                        <h4 class="card-title">${rec.title}</h4>
                        <p class="card-text">
                            <small class="text-muted">${rec.artist || 'Unknown Artist'}</small>
                        </p>
                        <p class="card-text">
                            ${rec.snippet || 'Similar lyrics to your search.'}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${Math.round(rec.score * 100)}% match</span>
                            <button class="btn btn-sm btn-outline-primary view-song-btn" data-title="${rec.title}">
                                View Lyrics
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            recommendationsContainer.appendChild(col);
        });
        
        // Add event listeners to the "View Lyrics" buttons
        document.querySelectorAll('.view-song-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const title = this.getAttribute('data-title');
                songTitleInput.value = title;
                searchLyrics(title);
            });
        });
        
        // Show recommendations section
        recommendationsSection.style.display = 'block';
    }
    
    // Function to show/hide loading spinner
    function showLoading(isLoading) {
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
        searchButton.disabled = isLoading;
        
        if (isLoading) {
            searchButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
        } else {
            searchButton.innerHTML = '<i class="fas fa-search me-1"></i> Search';
        }
    }
    
    // Function to show status messages
    function showStatus(message, type) {
        statusMessage.innerHTML = `
            <div class="alert alert-${type} animate-fade-in" role="alert">
                ${type === 'warning' ? '<i class="fas fa-exclamation-triangle me-2"></i>' : '<i class="fas fa-info-circle me-2"></i>'}
                ${message}
            </div>
        `;
        statusMessage.style.display = 'block';
    }
    
    // Function to add a search to recent searches
    function addToRecentSearches(songTitle) {
        // Don't add duplicates, move to top if exists
        const index = recentSearches.indexOf(songTitle);
        if (index > -1) {
            recentSearches.splice(index, 1);
        }
        
        // Add to the beginning of the array
        recentSearches.unshift(songTitle);
        
        // Keep only the 5 most recent searches
        if (recentSearches.length > 5) {
            recentSearches = recentSearches.slice(0, 5);
        }
        
        // Save to localStorage
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        // Update the display
        updateRecentSearchesList();
    }
    
    // Function to update the recent searches list
    function updateRecentSearchesList() {
        const recentSearchesList = document.getElementById('recentSearchesList');
        
        if (recentSearchesList) {
            if (recentSearches.length > 0) {
                recentSearchesList.innerHTML = '';
                
                recentSearches.forEach(search => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    
                    li.innerHTML = `
                        <span>${search}</span>
                        <button class="btn btn-sm btn-primary search-again-btn">
                            Search Again
                        </button>
                    `;
                    
                    recentSearchesList.appendChild(li);
                });
                
                // Add event listeners to "Search Again" buttons
                document.querySelectorAll('.search-again-btn').forEach((btn, index) => {
                    btn.addEventListener('click', function() {
                        songTitleInput.value = recentSearches[index];
                        searchLyrics(recentSearches[index]);
                    });
                });
            } else {
                recentSearchesList.innerHTML = `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>No recent searches yet.</span>
                    </li>
                `;
            }
        }
    }
    
    // Handle "Copy Lyrics" button
    if (copyLyricsButton) {
        copyLyricsButton.addEventListener('click', function() {
            const lyrics = lyricsContainer.textContent;
            const songTitle = songTitleHeading.textContent;
            const artist = songArtist.textContent;
            
            const textToCopy = `${songTitle} - ${artist}\n\n${lyrics}`;
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Show success message
                    const originalText = copyLyricsButton.innerHTML;
                    copyLyricsButton.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                    copyLyricsButton.classList.remove('btn-outline-primary');
                    copyLyricsButton.classList.add('btn-success');
                    
                    setTimeout(() => {
                        copyLyricsButton.innerHTML = originalText;
                        copyLyricsButton.classList.remove('btn-success');
                        copyLyricsButton.classList.add('btn-outline-primary');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                });
        });
    }
    
    // Handle "Share" button
    if (shareLyricsButton) {
        shareLyricsButton.addEventListener('click', function() {
            const songTitle = songTitleHeading.textContent;
            const shareUrl = `${window.location.origin}/search?q=${encodeURIComponent(songTitle)}`;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: `Lyrics for ${songTitle}`,
                    text: `Check out the lyrics for ${songTitle} on LyricVerse!`,
                    url: shareUrl
                })
                .catch(err => {
                    console.error('Share failed:', err);
                    // Fallback - copy the URL
                    copyShareUrl(shareUrl);
                });
            } else {
                // Fallback - copy the URL
                copyShareUrl(shareUrl);
            }
        });
    }
    
    // Function to copy the share URL
    function copyShareUrl(url) {
        navigator.clipboard.writeText(url)
            .then(() => {
                // Show success message
                const originalText = shareLyricsButton.innerHTML;
                shareLyricsButton.innerHTML = '<i class="fas fa-check me-1"></i> URL Copied!';
                shareLyricsButton.classList.remove('btn-outline-primary');
                shareLyricsButton.classList.add('btn-success');
                
                setTimeout(() => {
                    shareLyricsButton.innerHTML = originalText;
                    shareLyricsButton.classList.remove('btn-success');
                    shareLyricsButton.classList.add('btn-outline-primary');
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy URL: ', err);
            });
    }
});