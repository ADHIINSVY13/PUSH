document.addEventListener('DOMContentLoaded', function() {
    // Handle alphabet filter clicks
    const letterFilters = document.querySelectorAll('.letter-filter');
    const artistCards = document.querySelectorAll('.artist-card');
    
    letterFilters.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button state
            letterFilters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const selectedLetter = this.getAttribute('data-letter');
            
            // Filter artist cards
            artistCards.forEach(card => {
                if (selectedLetter === 'all') {
                    card.style.display = '';
                } else {
                    const artistLetter = card.getAttribute('data-letter');
                    card.style.display = (artistLetter === selectedLetter) ? '' : 'none';
                }
            });
            
            // Update load more button visibility
            updateLoadMoreButton();
        });
    });
    
    // Handle artist search
    const searchInput = document.getElementById('artist-search-input');
    const searchButton = document.getElementById('artist-search-button');
    const searchStatus = document.getElementById('search-status');
    
    function searchArtists() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // Reset to show all artists
            letterFilters.forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-letter="all"]').classList.add('active');
            
            artistCards.forEach(card => {
                card.style.display = '';
            });
            
            searchStatus.innerHTML = '';
            return;
        }
        
        // Hide letter filters active state
        letterFilters.forEach(btn => btn.classList.remove('active'));
        
        // Filter artists by search term
        let matchCount = 0;
        
        artistCards.forEach(card => {
            const artistName = card.querySelector('.card-title').textContent.toLowerCase();
            
            if (artistName.includes(searchTerm)) {
                card.style.display = '';
                matchCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Update search status
        if (matchCount === 0) {
            searchStatus.innerHTML = `
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    No artists found matching "${searchInput.value}". Try another search term.
                </div>
            `;
        } else {
            searchStatus.innerHTML = `
                <div class="alert alert-success mt-3">
                    <i class="fas fa-check-circle me-2"></i>
                    Found ${matchCount} artist${matchCount === 1 ? '' : 's'} matching "${searchInput.value}".
                </div>
            `;
        }
        
        // Update load more button visibility
        updateLoadMoreButton();
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', searchArtists);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchArtists();
                e.preventDefault();
            }
        });
    }
    
    // Load more artists functionality (simulated)
    const loadMoreBtn = document.getElementById('load-more-btn');
    let artistsLoaded = true; // Initial state is all artists loaded
    
    function updateLoadMoreButton() {
        // In a real application, this would check if there are more artists to load
        // For this demo, we'll just simulate the button state
        const visibleArtists = Array.from(artistCards).filter(card => card.style.display !== 'none');
        
        if (visibleArtists.length === 0) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = artistsLoaded ? 'none' : 'inline-block';
        }
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more artists
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading...';
            
            setTimeout(() => {
                // This would normally be an API call to load more artists
                // For this demo, we'll just hide the button after clicking
                this.innerHTML = '<i class="fas fa-check me-2"></i> All Artists Loaded';
                setTimeout(() => {
                    artistsLoaded = true;
                    updateLoadMoreButton();
                }, 1000);
            }, 1500);
        });
    }
    
    // Initialize
    updateLoadMoreButton();
    
    // Add hover effects to artist cards
    artistCards.forEach(card => {
        card.addEventListener('mouseover', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-bounce');
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseout', function() {
            const icon = this.querySelector('i');
            icon.classList.remove('fa-bounce');
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add hover effects to featured artist cards
    const featuredArtistCards = document.querySelectorAll('.featured-artist-card');
    
    featuredArtistCards.forEach(card => {
        card.addEventListener('mouseover', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-bounce');
        });
        
        card.addEventListener('mouseout', function() {
            const icon = this.querySelector('i');
            icon.classList.remove('fa-bounce');
        });
    });
});