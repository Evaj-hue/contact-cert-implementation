document.addEventListener('DOMContentLoaded', () => {
    console.log("Home Section Loaded - Particle System Initializing...");

    // =========================
    // ELEMENT REFERENCES
    // =========================
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) {
        console.error("Particle canvas not found!");
        return;
    }

    const ctx = canvas.getContext('2d');
    const homeSection = document.getElementById('home');
    const scrollContainer = document.querySelector('.scroll-container');
    const nextSection = document.getElementById('detail'); // Section 2

    let width, height;
    let particles = [];
    let animationId;

    // =========================
    // STATE FLAGS
    // =========================
    let isReadyToScroll = false;
    let currentState = 'assembling';
    let isTransitioning = false;

    // =========================
    // THEME-AWARE COLORS
    // =========================
    const COLORS = {
        dark: '0, 248, 248',
        light: '0, 124, 124'
    };

    function getCurrentColor() {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'light' ? COLORS.light : COLORS.dark;
    }

    // =========================
    // LOGO SWITCHING FUNCTION
    // =========================
    function updateLogoVisibility() {
        const theme = document.documentElement.getAttribute('data-theme');
        const logoDark = document.querySelector('.logo-dark');
        const logoLight = document.querySelector('.logo-light');
        
        if (theme === 'light') {
            if (logoDark) logoDark.style.display = 'none';
            if (logoLight) logoLight.style.display = 'block';
        } else {
            if (logoDark) logoDark.style.display = 'block';
            if (logoLight) logoLight.style.display = 'none';
        }
    }

    // =========================
    // CONFIGURATION
    // =========================
    const CONFIG = {
        textMain: "FUPIX",
        textSub: "SOLUTIONS",
        particleGap: 3,
        connectionDist: 22,
        assembleDelay: 1500,
        logoDelay: 2000,
        scrollIndicatorDelay: 3500,
        disperseDuration: 1500,
        reassembleDuration: 1800
    };

    // =========================
    // RESIZE HANDLER
    // =========================
    function resize() {
        width = canvas.width = homeSection.offsetWidth;
        height = canvas.height = homeSection.offsetHeight;
    }

    // =========================
    // GET TEXT COORDINATES
    // =========================
    function getTextCoordinates() {
        const coordinates = [];
        const textTarget = document.getElementById('textTarget');
        
        if (!textTarget) {
            console.error("Text target not found!");
            return coordinates;
        }

        const targetRect = textTarget.getBoundingClientRect();
        const homeRect = homeSection.getBoundingClientRect();

        const relativeRight = targetRect.right - homeRect.left - 20;
        const relativeY = targetRect.top - homeRect.top + targetRect.height / 2;

        const fontSizeMain = Math.max(Math.min(width * 0.15, 250), 60);
        const fontSizeSub = fontSizeMain * 0.35;

        ctx.fillStyle = 'white';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        ctx.font = `900 ${fontSizeMain}px "Orbitron", "Segoe UI", sans-serif`;
        ctx.fillText(CONFIG.textMain, relativeRight, relativeY - 20);

        ctx.font = `700 ${fontSizeSub}px "Rajdhani", "Segoe UI", sans-serif`;
        ctx.fillText(CONFIG.textSub, relativeRight, relativeY + fontSizeMain * 0.5);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y += CONFIG.particleGap) {
            for (let x = 0; x < width; x += CONFIG.particleGap) {
                const index = (y * width + x) * 4 + 3;
                if (data[index] > 128) {
                    coordinates.push({ x, y });
                }
            }
        }

        ctx.clearRect(0, 0, width, height);
        console.log(`Generated ${coordinates.length} particle coordinates`);
        return coordinates;
    }

    // =========================
    // PARTICLE CLASS
    // =========================
    class Particle {
        constructor(targetX, targetY) {
            this.targetX = targetX;
            this.targetY = targetY;

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 500 + 500;
            this.x = targetX + Math.cos(angle) * dist;
            this.y = targetY + Math.sin(angle) * dist;

            this.scatteredX = this.x;
            this.scatteredY = this.y;

            this.vx = 0;
            this.vy = 0;

            this.friction = 0.92;
            this.ease = 0.04 + Math.random() * 0.04;

            this.size = Math.random() * 2 + 1;
            this.baseSize = this.size;

            this.activeDelay = Math.random() * CONFIG.assembleDelay;
            this.startTime = Date.now();
            this.isActive = false;

            this.disperseAngle = Math.random() * Math.PI * 2;
            this.disperseSpeed = 10 + Math.random() * 20;
            this.disperseSpeedBase = this.disperseSpeed;
        }

        update() {
            switch (currentState) {
                case 'dispersing':
                case 'dispersed':
                    this.x += Math.cos(this.disperseAngle) * this.disperseSpeed;
                    this.y += Math.sin(this.disperseAngle) * this.disperseSpeed;
                    this.disperseSpeed *= 0.98;
                    break;

                case 'assembling':
                    if (!this.isActive) {
                        if (Date.now() - this.startTime > this.activeDelay) {
                            this.isActive = true;
                        } else {
                            return;
                        }
                    }
                    this.moveToTarget();
                    break;

                case 'reassembling':
                    this.moveToTarget();
                    break;

                case 'assembled':
                    this.x = this.targetX + Math.sin(Date.now() * 0.001 + this.targetX * 0.01) * 0.3;
                    this.y = this.targetY + Math.cos(Date.now() * 0.001 + this.targetY * 0.01) * 0.3;
                    break;
            }
        }

        moveToTarget() {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;

            this.vx += dx * this.ease;
            this.vy += dy * this.ease;

            this.vx *= this.friction;
            this.vy *= this.friction;

            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            const color = getCurrentColor();
            ctx.fillStyle = `rgba(${color}, 1)`;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        resetForReassembly() {
            this.disperseSpeed = this.disperseSpeedBase;
            this.isActive = true;
            this.vx = 0;
            this.vy = 0;
        }
    }

    // =========================
    // DRAW CONNECTIONS
    // =========================
    function drawConnections() {
        if (currentState === 'dispersing' || currentState === 'dispersed') return;

        const neighborsToCheck = 20;
        const color = getCurrentColor();

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            
            if (!p1.isActive && currentState === 'assembling') continue;

            p1.draw();

            for (let j = i + 1; j < Math.min(particles.length, i + neighborsToCheck); j++) {
                const p2 = particles[j];
                
                if (!p2.isActive && currentState === 'assembling') continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                const connDistSq = CONFIG.connectionDist * CONFIG.connectionDist;

                if (distSq < connDistSq) {
                    const alpha = 1 - (distSq / connDistSq);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ${alpha * 0.5})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    // =========================
    // SCROLL CONTROL FUNCTIONS
    // =========================
    function disableScroll() {
        scrollContainer.style.overflow = 'hidden';
        scrollContainer.style.scrollSnapType = 'none';
    }

    function enableScroll() {
        scrollContainer.style.overflow = 'auto';
        scrollContainer.style.scrollSnapType = 'y mandatory';
    }

    function scrollToSection(section) {
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // =========================
    // HELPER: Get Current Section Index
    // =========================
    function getCurrentSectionIndex() {
        const scrollTop = scrollContainer.scrollTop;
        const viewportHeight = window.innerHeight;
        return Math.round(scrollTop / viewportHeight);
    }

    // =========================
    // HELPER: Check if EXACTLY in Section 1 (Home)
    // =========================
    function isInHomeSection() {
        const sectionIndex = getCurrentSectionIndex();
        return sectionIndex === 0;
    }

    // =========================
    // HELPER: Check if EXACTLY in Section 2 (Detail)
    // =========================
    function isInSection2Only() {
        const sectionIndex = getCurrentSectionIndex();
        return sectionIndex === 1;
    }

    // =========================
    // DISPERSION WITH DELAYED SCROLL (Going to Section 2)
    // =========================
    function triggerDispersionAndScroll() {
        if (!isReadyToScroll || isTransitioning || currentState === 'dispersing' || currentState === 'dispersed') {
            return;
        }

        console.log("Triggering dispersion...");
        isTransitioning = true;
        currentState = 'dispersing';

        // Hide UI elements
        homeSection.classList.add('ui-hidden');
        homeSection.classList.remove('scroll-ready');
        homeSection.classList.remove('logo-visible');

        // Disable scroll during animation
        disableScroll();

        // Wait for dispersion to complete, then scroll
        setTimeout(() => {
            currentState = 'dispersed';
            
            // Now scroll to section 2
            enableScroll();
            scrollToSection(nextSection);
            
            // Reset transition flag after scroll completes
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
            
        }, CONFIG.disperseDuration);
    }

    // =========================
    // REASSEMBLY WITH DELAYED SCROLL (Coming back to Section 1)
    // =========================
    function triggerReassemblyAndScroll() {
        if (isTransitioning || currentState === 'assembling' || currentState === 'assembled' || currentState === 'reassembling') {
            return;
        }

        console.log("Triggering reassembly...");
        isTransitioning = true;

        // Disable scroll during animation
        disableScroll();

        // First scroll to home section
        scrollToSection(homeSection);

        // Small delay to let scroll start, then begin reassembly
        setTimeout(() => {
            currentState = 'reassembling';
            homeSection.classList.remove('ui-hidden');

            // Reset particles for reassembly animation
            particles.forEach(p => p.resetForReassembly());

            // Wait for reassembly to complete
            setTimeout(() => {
                currentState = 'assembled';
                homeSection.classList.add('logo-visible');
                homeSection.classList.add('scroll-ready');
                
                // Re-enable scroll
                enableScroll();
                isTransitioning = false;
                
                console.log("Reassembly complete");
            }, CONFIG.reassembleDuration);
            
        }, 300);
    }

    // =========================
    // INITIALIZE PARTICLES
    // =========================
    function init() {
        particles = [];
        const coords = getTextCoordinates();

        const step = coords.length > 5000 ? 2 : 1;

        for (let i = 0; i < coords.length; i += step) {
            particles.push(new Particle(coords[i].x, coords[i].y));
        }

        currentState = 'assembling';
        isReadyToScroll = false;

        setTimeout(() => {
            homeSection.classList.add('logo-visible');
        }, CONFIG.logoDelay);

        setTimeout(() => {
            isReadyToScroll = true;
            currentState = 'assembled';
            homeSection.classList.add('scroll-ready');
            console.log("Ready for scroll interaction");
        }, CONFIG.scrollIndicatorDelay);
    }

    // =========================
    // ANIMATION LOOP
    // =========================
    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            if (currentState === 'dispersing' || currentState === 'dispersed') {
                p.draw();
            }
        });

        drawConnections();

        animationId = requestAnimationFrame(animate);
    }

    // =========================
    // WHEEL EVENT (Scroll Up/Down)
    // Only intercept between Section 1 and Section 2
    // =========================
    scrollContainer.addEventListener('wheel', (e) => {
        // SCROLLING DOWN from Home Section (Section 1 -> Section 2)
        if (isInHomeSection() && e.deltaY > 0 && currentState === 'assembled' && !isTransitioning) {
            e.preventDefault();
            triggerDispersionAndScroll();
            return;
        }
        
        // SCROLLING UP from Section 2 ONLY back to Home (Section 2 -> Section 1)
        if (isInSection2Only() && e.deltaY < 0 && currentState === 'dispersed' && !isTransitioning) {
            e.preventDefault();
            triggerReassemblyAndScroll();
            return;
        }
        
        // ALL OTHER SCROLLING - Let it happen normally (do nothing)
    }, { passive: false });

    // =========================
    // TOUCH EVENTS (For Mobile)
    // Only intercept between Section 1 and Section 2
    // =========================
    let touchStartY = 0;
    
    scrollContainer.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    scrollContainer.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        
        // SWIPING UP (Scroll Down) from Home Section (Section 1 -> Section 2)
        if (isInHomeSection() && deltaY > 30 && currentState === 'assembled' && !isTransitioning) {
            e.preventDefault();
            triggerDispersionAndScroll();
            touchStartY = touchY; // Reset to prevent multiple triggers
            return;
        }
        
        // SWIPING DOWN (Scroll Up) from Section 2 ONLY back to Home (Section 2 -> Section 1)
        if (isInSection2Only() && deltaY < -30 && currentState === 'dispersed' && !isTransitioning) {
            e.preventDefault();
            triggerReassemblyAndScroll();
            touchStartY = touchY; // Reset to prevent multiple triggers
            return;
        }
        
        // ALL OTHER SWIPING - Let it happen normally (do nothing)
    }, { passive: false });

    // =========================
    // KEYBOARD EVENTS
    // Only intercept between Section 1 and Section 2
    // =========================
    document.addEventListener('keydown', (e) => {
        // ARROW DOWN / SPACE / PAGE DOWN from Home Section (Section 1 -> Section 2)
        if (isInHomeSection() && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') && 
            currentState === 'assembled' && !isTransitioning) {
            e.preventDefault();
            triggerDispersionAndScroll();
            return;
        }
        
        // ARROW UP / PAGE UP from Section 2 ONLY back to Home (Section 2 -> Section 1)
        if (isInSection2Only() && (e.key === 'ArrowUp' || e.key === 'PageUp') && 
            currentState === 'dispersed' && !isTransitioning) {
            e.preventDefault();
            triggerReassemblyAndScroll();
            return;
        }
        
        // ALL OTHER KEYBOARD - Let it happen normally (do nothing)
    });

    // =========================
    // THEME CHANGE LISTENER
    // =========================
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                console.log("Theme changed, updating colors and logo");
                updateLogoVisibility();
            }
        });
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // =========================
    // START EVERYTHING
    // =========================
    function startParticleSystem() {
        resize();
        init();
        animate();
        updateLogoVisibility();
        console.log("Particle system started!");
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            setTimeout(startParticleSystem, 100);
        });
    } else {
        setTimeout(startParticleSystem, 500);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentState !== 'dispersed' && currentState !== 'dispersing') {
                resize();
                init();
            }
        }, 300);
    });
});