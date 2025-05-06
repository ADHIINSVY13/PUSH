document.addEventListener('DOMContentLoaded', function() {
    // Simple animations and interactions for the home page
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    
    // Add a small random delay to each animated element for a more natural look
    animatedElements.forEach(element => {
        if (!element.classList.contains('delay-1') && 
            !element.classList.contains('delay-2') && 
            !element.classList.contains('delay-3') && 
            !element.classList.contains('delay-4') && 
            !element.classList.contains('delay-5')) {
            
            const randomDelay = Math.random() * 0.5; // Random delay between 0 and 0.5 seconds
            element.style.animationDelay = `${randomDelay}s`;
        }
    });
    
    // Hero image interaction
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        heroImage.addEventListener('mouseover', function() {
            this.style.transform = 'rotate(0) scale(1.05)';
            this.style.opacity = '1';
        });
        
        heroImage.addEventListener('mouseout', function() {
            this.style.transform = 'rotate(5deg)';
            this.style.opacity = '0.7';
        });
    }
    
    // Glass card hover effects enhancement
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
        card.addEventListener('mouseover', function() {
            this.style.boxShadow = '0 15px 45px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseout', function() {
            this.style.boxShadow = 'var(--glass-shadow)';
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for navbar
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Check if the guitar SVG exists, if not, we should create it dynamically
    if (!document.querySelector('img[src="guitar.svg"]')) {
        console.log('Guitar SVG not found, consider creating one dynamically');
        // This would be a place to create the SVG if needed
    }
});