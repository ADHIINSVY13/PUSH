document.addEventListener('DOMContentLoaded', function() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    const submitFormButton = document.getElementById('submitForm');
    const formStatus = document.getElementById('formStatus');
    
    if (submitFormButton) {
        submitFormButton.addEventListener('click', function() {
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            const newsletter = document.getElementById('newsletter').checked;
            
            // Simple validation
            if (!name || !email || !message) {
                showFormStatus('Please fill out all required fields.', 'danger');
                return;
            }
            
            // Email validation using regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormStatus('Please enter a valid email address.', 'danger');
                return;
            }
            
            // Simulate form submission
            showFormStatus('Sending your message...', 'info');
            
            // This would normally be an API call to a backend endpoint
            // Since we're focusing on frontend for this demo, we'll use a timeout to simulate the API call
            setTimeout(function() {
                // Clear form
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('subject').value = '';
                document.getElementById('message').value = '';
                document.getElementById('newsletter').checked = false;
                
                // Show success message
                showFormStatus('Your message has been sent successfully! We\'ll get back to you soon.', 'success');
            }, 1500);
        });
    }
    
    // Function to show form status
    function showFormStatus(message, type) {
        formStatus.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        
        // Hide the status message after 5 seconds if it's a success message
        if (type === 'success') {
            setTimeout(function() {
                formStatus.innerHTML = '';
            }, 5000);
        }
    }
    
    // Accordion animation enhancement
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add a slight delay for smooth animations
            setTimeout(() => {
                window.scrollTo({
                    top: this.offsetTop - 100,
                    behavior: 'smooth'
                });
            }, 300);
        });
    });
    
    // Enhance contact icons on hover
    const contactIcons = document.querySelectorAll('.contact-icon i');
    
    contactIcons.forEach(icon => {
        icon.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        icon.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add smooth animations to contact items
    const contactItems = document.querySelectorAll('.contact-item');
    
    contactItems.forEach((item, index) => {
        item.style.animationDelay = `${0.2 * index}s`;
        item.classList.add('animate-fade-in');
    });
});