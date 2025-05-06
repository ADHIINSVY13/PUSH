document.addEventListener('DOMContentLoaded', function() {
    // API endpoint (adjust if needed)
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api'
        : `${window.location.protocol}//${window.location.host}/api`;
    
    // Load trending data when the page loads
    loadTrendingData();
    
    // Function to load trending data from the API
    function loadTrendingData() {
        fetch(`${API_URL}/trending`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayTrendingData(data);
            })
            .catch(error => {
                console.error('Error fetching trending data:', error);
                showErrorMessage();
            });
    }
    
    // Function to display trending data
    function displayTrendingData(data) {
        const tableBody = document.getElementById('trending-table-body');
        
        // Clear loading placeholder
        tableBody.innerHTML = '';
        
        // Check if we have trending data
        if (data.trending && data.trending.length > 0) {
            // Create sample artist data (in a real app, this would come from the API)
            const artists = [
                'The Melodics',
                'Rhythm Collective',
                'Echo Chamber',
                'Harmonic Resonance',
                'Sonic Waves'
            ];
            
            // Generate the table rows
            data.trending.forEach((song, index) => {
                // Select a random artist for the demo
                const artist = artists[Math.floor(Math.random() * artists.length)];
                
                const row = document.createElement('tr');
                row.className = 'animate-fade-in';
                row.style.animationDelay = `${0.1 * index}s`;
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${song.title}</td>
                    <td>${artist}</td>
                    <td>${song.count}</td>
                    <td>
                        <a href="/search?q=${encodeURIComponent(song.title)}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-search"></i>
                        </a>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        } else {
            // Show no data message
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <i class="fas fa-info-circle fa-2x mb-3 text-info"></i>
                        <p>No trending data available at the moment.</p>
                    </td>
                </tr>
            `;
        }
    }
    
    // Function to show error message
    function showErrorMessage() {
        const tableBody = document.getElementById('trending-table-body');
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3 text-warning"></i>
                    <p>Unable to load trending data. Please try again later.</p>
                    <button class="btn btn-primary mt-3" id="retry-button">
                        <i class="fas fa-sync-alt me-2"></i> Retry
                    </button>
                </td>
            </tr>
        `;
        
        // Add event listener to retry button
        document.getElementById('retry-button').addEventListener('click', loadTrendingData);
    }
    
    // Search functionality for trending table
    const searchInput = document.getElementById('searchTrending');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        // Search when button is clicked
        searchButton.addEventListener('click', function() {
            filterTrendingTable();
        });
        
        // Search when Enter key is pressed
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterTrendingTable();
            }
        });
        
        // Also filter as user types (with slight delay)
        let debounceTimer;
        searchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterTrendingTable, 300);
        });
    }
    
    // Function to filter the trending table
    function filterTrendingTable() {
        const searchText = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#trending-table-body tr:not(.placeholder-row)');
        
        rows.forEach(row => {
            const songName = row.children[1].textContent.toLowerCase();
            const artistName = row.children[2].textContent.toLowerCase();
            
            if (songName.includes(searchText) || artistName.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Category card hover effects
    const categoryCards = document.querySelectorAll('.trending-category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('mouseover', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-beat');
        });
        
        card.addEventListener('mouseout', function() {
            const icon = this.querySelector('i');
            icon.classList.remove('fa-beat');
        });
    });
});