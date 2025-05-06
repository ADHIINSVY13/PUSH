document.addEventListener('DOMContentLoaded', function() {
    // Initialize audio context for guitar sounds
    let audioContext;
    let gainNode;
    let currentVolume = 0.5; // Default volume (50%)
    
    // Guitar SVG element
    const guitarSvg = document.getElementById('guitar-svg');
    const stringSelect = document.getElementById('string-select');
    const volumeControl = document.getElementById('volume-control');
    const volumeValue = document.getElementById('volume-value');
    const playChordButton = document.getElementById('play-chord');
    const playScaleButton = document.getElementById('play-scale');
    
    // Guitar string frequencies (standard tuning)
    const stringFrequencies = [
        329.63, // E4 (1st string)
        246.94, // B3 (2nd string)
        196.00, // G3 (3rd string)
        146.83, // D3 (4th string)
        110.00, // A2 (5th string)
        82.41   // E2 (6th string)
    ];
    
    // Initialize audio when user interacts with the page
    function initAudio() {
        try {
            // Create audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain node for volume control
            gainNode = audioContext.createGain();
            gainNode.gain.value = currentVolume;
            gainNode.connect(audioContext.destination);
            
            console.log('Audio initialized successfully');
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }
    
    // Calculate frequency for a given string and fret
    function calculateFrequency(baseFrequency, fretNumber) {
        return baseFrequency * Math.pow(2, fretNumber / 12);
    }
    
    // Play a note with the given frequency
    function playNote(frequency, duration = 0.5) {
        if (!audioContext) {
            initAudio();
        }
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        
        // Connect oscillator to gain node
        oscillator.connect(gainNode);
        
        // Start and stop the oscillator
        const now = audioContext.currentTime;
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        // Create slight decay effect
        const attackTime = 0.01;
        const decayTime = duration - attackTime;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(currentVolume, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        return oscillator;
    }
    
    // Make the SVG guitar interactive
    if (guitarSvg) {
        // Load SVG content and make it interactive
        guitarSvg.addEventListener('load', function() {
            // Get the SVG document
            const svgDoc = guitarSvg.contentDocument || guitarSvg;
            
            // Get all fret lines
            const fretLines = svgDoc.querySelectorAll('line[x1][x2]');
            
            // Set up click events for frets
            fretLines.forEach((fretLine, index) => {
                if (index >= 7) return; // Only use the first 7 fret lines
                
                fretLine.style.cursor = 'pointer';
                
                fretLine.addEventListener('click', function() {
                    // Calculate which fret was clicked (index + 1 because index 0 is the first fret)
                    const fretNumber = index + 1;
                    
                    // Get current string index
                    const stringIndex = parseInt(stringSelect.value);
                    
                    // Calculate note frequency
                    const baseFrequency = stringFrequencies[stringIndex];
                    const noteFrequency = calculateFrequency(baseFrequency, fretNumber);
                    
                    // Play the note
                    playNote(noteFrequency);
                    
                    // Add visual feedback
                    fretLine.classList.add('string-pluck');
                    setTimeout(() => {
                        fretLine.classList.remove('string-pluck');
                    }, 500);
                });
                
                // Add hover effect
                fretLine.addEventListener('mouseover', function() {
                    this.style.stroke = 'var(--bs-primary)';
                    this.style.strokeWidth = '3';
                });
                
                fretLine.addEventListener('mouseout', function() {
                    this.style.stroke = '#E0E0E0';
                    this.style.strokeWidth = '2';
                });
            });
            
            // Also make strings interactive
            const stringLines = svgDoc.querySelectorAll('line[y1][y2]');
            
            stringLines.forEach((stringLine, index) => {
                if (index >= 5) return; // Only process the 5 strings (we have 5 horizontal lines)
                
                stringLine.style.cursor = 'pointer';
                
                stringLine.addEventListener('click', function() {
                    // Play the open string note
                    const stringIndex = index % 5; // Map to the appropriate string (0-5)
                    playNote(stringFrequencies[stringIndex]);
                    
                    // Add visual feedback
                    stringLine.classList.add('string-pluck');
                    setTimeout(() => {
                        stringLine.classList.remove('string-pluck');
                    }, 500);
                });
                
                // Add hover effect
                stringLine.addEventListener('mouseover', function() {
                    this.style.stroke = 'var(--bs-primary)';
                    this.style.strokeWidth = '2.5';
                });
                
                stringLine.addEventListener('mouseout', function() {
                    this.style.stroke = '#E0E0E0';
                    this.style.strokeWidth = '1.5';
                });
            });
        });
        
        // For direct SVG in the page (not using an image)
        guitarSvg.addEventListener('click', function(e) {
            if (!audioContext) {
                initAudio();
            }
            
            // Handle clicks on the SVG directly
            const rect = guitarSvg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Determine which string was clicked by y position
            const stringHeight = rect.height / 6;
            const stringIndex = Math.floor(y / stringHeight);
            
            // Determine which fret was clicked by x position
            const fretboardWidth = rect.width * 0.7; // Rough estimate of fretboard width
            const fretboardStart = rect.width * 0.15; // Rough estimate of where fretboard starts
            const fretNumber = Math.floor((x - fretboardStart) / (fretboardWidth / 7));
            
            if (stringIndex >= 0 && stringIndex < 6 && fretNumber >= 0 && fretNumber < 7) {
                // Calculate note frequency
                const baseFrequency = stringFrequencies[stringIndex];
                const noteFrequency = calculateFrequency(baseFrequency, fretNumber);
                
                // Play the note
                playNote(noteFrequency);
            }
        });
    }
    
    // Handle volume control
    if (volumeControl) {
        volumeControl.addEventListener('input', function() {
            currentVolume = this.value / 100;
            volumeValue.textContent = `${this.value}%`;
            
            if (gainNode) {
                gainNode.gain.value = currentVolume;
            }
        });
    }
    
    // Play a chord
    if (playChordButton) {
        playChordButton.addEventListener('click', function() {
            if (!audioContext) {
                initAudio();
            }
            
            // Play a simple chord (C major: C, E, G)
            const chordFrequencies = [261.63, 329.63, 392.00];
            
            chordFrequencies.forEach((freq, index) => {
                setTimeout(() => {
                    playNote(freq, 1.5);
                }, index * 50);
            });
        });
    }
    
    // Play a scale
    if (playScaleButton) {
        playScaleButton.addEventListener('click', function() {
            if (!audioContext) {
                initAudio();
            }
            
            // Play a C major scale
            const scaleFrequencies = [
                261.63, // C4
                293.66, // D4
                329.63, // E4
                349.23, // F4
                392.00, // G4
                440.00, // A4
                493.88, // B4
                523.25  // C5
            ];
            
            scaleFrequencies.forEach((freq, index) => {
                setTimeout(() => {
                    playNote(freq, 0.3);
                }, index * 300);
            });
        });
    }
    
    // Initialize click on page to set up audio context (needed due to browser autoplay policies)
    document.body.addEventListener('click', function() {
        if (!audioContext) {
            initAudio();
        }
    }, { once: true });
});