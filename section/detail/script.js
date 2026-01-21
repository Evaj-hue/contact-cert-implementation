console.log("Details Section Loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("Detail Section Loaded - Reference Plexus Engine Initializing...");

    const canvas = document.getElementById('plexusCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const detailSection = document.getElementById('detail');

    // ===============================
    // CONFIGURATION
    // ===============================
    const PLEXUS_COLORS = {
        dark: { r: 0, g: 248, b: 248 },   // Neon Cyan
        light: { r: 0, g: 124, b: 124 }   // Teal
    };

    const MOUSE_REPEL_RADIUS = 180; // Increased slightly for better effect

    // Helper to get current color based on HTML attribute
    function getPlexusColor() {
        return document.documentElement.getAttribute('data-theme') === 'light'
            ? PLEXUS_COLORS.light
            : PLEXUS_COLORS.dark;
    }

    // ===============================
    // VARIABLES
    // ===============================
    let w = 0, h = 0;
    let DPR = Math.max(1, window.devicePixelRatio || 1);
    let particles = [];
    let animationId;
    
    // Mouse state
    const mouse = { x: -9999, y: -9999 };

    // ===============================
    // RESIZE & INIT
    // ===============================
    function resize() {
        DPR = Math.max(1, window.devicePixelRatio || 1);
        
        // Use section dimensions
        const rect = detailSection.getBoundingClientRect();
        w = rect.width;
        h = rect.height;

        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        // Update Glow immediately
        updateGlow();
        
        // Re-init particles if array is empty or screen changed drastically
        if (particles.length === 0 || Math.abs(particles.length - Math.floor((w * h) / 12000)) > 20) {
            initParticles();
        }
    }

    function updateGlow() {
        const c = getPlexusColor();
        ctx.shadowBlur = 14;
        ctx.shadowColor = `rgb(${c.r},${c.g},${c.b})`;
    }

    function initParticles() {
        // Density: 1 particle per 11000 pixels roughly
        const base = Math.max(40, Math.floor((w * h) / 11000));
        
        particles = Array.from({ length: base }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4, // Velocity X
            vy: (Math.random() - 0.5) * 0.4, // Velocity Y
            r: 1.5 + Math.random() * 2,      // Radius
            ph: Math.random() * Math.PI * 2  // Phase for flicker
        }));
    }

    // ===============================
    // ANIMATION LOOP
    // ===============================
    function frame(t) {
        ctx.clearRect(0, 0, w, h);

        const maxDist = Math.min(220, (w + h) / 8);
        const c = getPlexusColor();

        // 1. Draw Particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Movement
            p.x += p.vx;
            p.y += p.vy;

            // Wrap screen edges
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;

            // Mouse Repel Logic
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;

            if (d2 < MOUSE_REPEL_RADIUS * MOUSE_REPEL_RADIUS) {
                const d = Math.sqrt(d2) || 0.001;
                const f = (1 - d / MOUSE_REPEL_RADIUS) * 0.9;
                p.vx += (dx / d) * f;
                p.vy += (dy / d) * f;
            }

            // Friction (Slow down after repel)
            p.vx *= 0.995;
            p.vy *= 0.995;

            // Flicker Alpha Calculation
            const alpha = 0.35 + 0.25 * Math.sin(t * 0.005 + p.ph) + (Math.random() - 0.5) * 0.06;

            // Draw Dot
            ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Draw Lines
        // Optimization: Use strokeStyle once per frame if possible, but alpha varies per line
        ctx.lineWidth = 0.6; // Sharp lines

        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < maxDist) {
                    // Line flicker matches particle phases
                    const flick = 0.5 + 0.5 * Math.sin(t * 0.005 + a.ph + b.ph);
                    const alpha = Math.max(0, (1 - d / maxDist) * 0.8 * flick);

                    if (alpha > 0.05) {
                        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha.toFixed(3)})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
        }

        animationId = requestAnimationFrame(frame);
    }

    // ===============================
    // EVENTS
    // ===============================
    
    // Mouse Move (Relative to Canvas position)
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Theme Change Observer (Update Glow Color Immediately)
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                updateGlow();
            }
        });
    });

    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    // Intersection Observer (Performance: Pause when not visible)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!animationId) {
                    resize(); // Ensure size is correct before starting
                    animationId = requestAnimationFrame(frame);
                }
            } else {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        });
    }, { threshold: 0.1 });

    observer.observe(detailSection);

    // Initial Start
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 200);
    });
    
    resize();
});