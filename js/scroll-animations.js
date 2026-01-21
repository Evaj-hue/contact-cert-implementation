/* ============================================
   SCROLL ANIMATION CONTROLLER - OPTIMIZED
   Version: 2.1 - Performance Focused
   ============================================ */

class ScrollAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.2,
            rootMargin: options.rootMargin || '0px 0px -10% 0px',
            once: options.once !== undefined ? options.once : true
        };
        
        this.elementObserver = null;
        this.sectionObserver = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) {
            this.fallback();
            return;
        }

        this.initElementObserver();
        this.initSectionObserver();
        this.observe();
        
        // Optimize scroll performance
        this.initScrollOptimization();
    }

    /* ============================================
       SCROLL OPTIMIZATION
       ============================================ */
    initScrollOptimization() {
        const scrollContainer = document.querySelector('.scroll-container') || window;
        
        const scrollHandler = () => {
            if (!this.isScrolling) {
                document.body.classList.add('is-scrolling');
                this.isScrolling = true;
            }
            
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
                this.isScrolling = false;
            }, 100);
        };

        scrollContainer.addEventListener('scroll', scrollHandler, { passive: true });
    }

    /* ============================================
       ELEMENT OBSERVER
       ============================================ */
    initElementObserver() {
        this.elementObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Use requestAnimationFrame for smooth animation trigger
                        requestAnimationFrame(() => {
                            entry.target.classList.add('is-visible');
                        });
                        
                        // Check for connectors
                        this.checkConnectorVisibility(entry.target);
                        
                        if (this.options.once) {
                            this.elementObserver.unobserve(entry.target);
                        }
                    } else if (!this.options.once) {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );
    }

    /* ============================================
       SECTION OBSERVER (Optimized)
       ============================================ */
    initSectionObserver() {
        // Use fewer threshold points for better performance
        this.sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const section = entry.target;
                    const rect = entry.boundingClientRect;
                    const viewportHeight = window.innerHeight;
                    
                    // Calculate position relative to viewport
                    const topVisible = rect.top < viewportHeight * 0.7;
                    const bottomVisible = rect.bottom > viewportHeight * 0.3;
                    const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
                    const isMostlyVisible = entry.intersectionRatio > 0.5;

                    if (entry.isIntersecting) {
                        if (isMostlyVisible || isFullyVisible) {
                            this.setSectionState(section, 'active');
                        } else if (rect.top > viewportHeight * 0.5) {
                            this.setSectionState(section, 'entering');
                        } else {
                            this.setSectionState(section, 'exiting');
                        }
                    } else {
                        if (rect.top >= viewportHeight) {
                            this.setSectionState(section, 'entering');
                        } else if (rect.bottom <= 0) {
                            this.setSectionState(section, 'exiting');
                        }
                    }
                });
            },
            {
                threshold: [0, 0.3, 0.5, 0.7, 1],
                rootMargin: '-5% 0px -5% 0px'
            }
        );

        // Observe all sections that need state tracking
        document.querySelectorAll('.gridbox-section, #featured, #detail').forEach(section => {
            this.sectionObserver.observe(section);
            
            // Set initial state based on position
            const rect = section.getBoundingClientRect();
            if (rect.top >= window.innerHeight) {
                section.setAttribute('data-section-state', 'entering');
            } else if (rect.bottom <= 0) {
                section.setAttribute('data-section-state', 'exiting');
            } else {
                section.setAttribute('data-section-state', 'active');
            }
        });
    }

    setSectionState(section, state) {
        const currentState = section.getAttribute('data-section-state');
        if (currentState !== state) {
            requestAnimationFrame(() => {
                section.setAttribute('data-section-state', state);
            });
        }
    }

    /* ============================================
       CONNECTOR VISIBILITY
       ============================================ */
    checkConnectorVisibility(element) {
        const honeycombLayout = element.closest('.honeycomb-layout');
        if (!honeycombLayout || honeycombLayout.classList.contains('connectors-visible')) return;

        const visibleItems = honeycombLayout.querySelectorAll('.service-item.is-visible');
        
        if (visibleItems.length >= 2) {
            requestAnimationFrame(() => {
                honeycombLayout.classList.add('connectors-visible');
            }); 
        }
    }

    /* ============================================
       OBSERVE ELEMENTS
       ============================================ */
    observe() {
        document.querySelectorAll('[data-animate]').forEach(el => {
            this.elementObserver.observe(el);
        });
    }

    /* ============================================
       FALLBACK
       ============================================ */
    fallback() {
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('is-visible');
        });
        document.querySelectorAll('.gridbox-section, #featured, #detail').forEach(section => {
            section.setAttribute('data-section-state', 'active');
        });
        document.querySelectorAll('.honeycomb-layout').forEach(layout => {
            layout.classList.add('connectors-visible');
        });
    }

    refresh() {
        this.observe();
    }

    destroy() {
        if (this.elementObserver) this.elementObserver.disconnect();
        if (this.sectionObserver) this.sectionObserver.disconnect();
        clearTimeout(this.scrollTimeout);
    }
}

/* ============================================
   INITIALIZE
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other scripts to initialize
    requestAnimationFrame(() => {
        window.scrollAnimator = new ScrollAnimator({
            threshold: 0.15,
            rootMargin: '0px 0px -15% 0px',
            once: true
        });
    });
});