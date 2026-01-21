document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const storageKey = 'nexus-gaming-theme';

    const currentTheme = localStorage.getItem(storageKey);
    if (currentTheme) root.setAttribute('data-theme', currentTheme);

    toggleBtn.addEventListener('click', () => {
        const activeTheme = root.getAttribute('data-theme');
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem(storageKey, newTheme);
    });

    // 2. Active Navigation Highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.style.color = 'var(--muted)';
                    link.style.textShadow = 'none';
                });
                const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                if(activeLink) {
                    activeLink.style.color = 'var(--neon)';
                    activeLink.style.textShadow = '0 0 10px var(--btn-glow)';
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

      /* -----------------------------------------------
       3. AUTO HIDE/SHOW NAVBAR ON SCROLL
    ----------------------------------------------- */
    const navbar = document.querySelector('.navbar');
    const scrollContainer = document.querySelector('.scroll-container');
    let lastScrollTop = 0;

    // We attach the event to scrollContainer because that's where the overflow is
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;

        // Logic: 
        // 1. If scrollTop > lastScrollTop -> We are going Down -> Hide
        // 2. If scrollTop < lastScrollTop -> We are going Up -> Show
        // 3. Prevent hiding if we are at the very top (scrollTop <= 0)
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling Down
            navbar.classList.add('nav-hidden');
        } else {
            // Scrolling Up
            navbar.classList.remove('nav-hidden');
        }

        // Update the last position for the next check
        lastScrollTop = scrollTop;
    });

});