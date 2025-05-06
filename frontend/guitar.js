document.addEventListener('DOMContentLoaded', function() {
    // Set up the audio context
    let audioContext = null;
    
    // Initialize audio context on user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Function to play a note
    function playNote(frequency, duration = 0.5) {
        if (!audioContext) initAudio();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
        
        // Visual effect for the string
        return oscillator;
    }
    
    // Set up guitar string event listeners
    const guitarStrings = document.querySelectorAll('.guitar-string');
    
    guitarStrings.forEach(string => {
        string.addEventListener('click', function() {
            const frequency = parseFloat(this.getAttribute('data-frequency'));
            
            // Play the note
            playNote(frequency);
            
            // Add animation class
            this.classList.add('plucked');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                this.classList.remove('plucked');
            }, 500);
        });
    });
    
    // Initialize audio on first user interaction with the page
    document.body.addEventListener('click', initAudio, { once: true });
});