/**
 * Contact Section JavaScript
 * FUPIX Solutions
 * Version: 3.0 - With Section Entry Animations (Non-Conflicting)
 */

(function() {
    'use strict';

    // ============================================
    // CHECK IF ALREADY INITIALIZED
    // ============================================
    if (window.FupixContactInitialized) {
        console.log('Contact section already initialized, skipping...');
        return;
    }
    window.FupixContactInitialized = true;

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        // Section (NEW)
        contactSection: document.getElementById('contact'),
        
        // Theme - Using class selector instead of ID
        themeToggle: document.querySelector('.theme-toggle'),
        
        // Form
        contactForm: document.getElementById('contactForm'),
        submitBtn: document.getElementById('submitBtn'),
        successMessage: document.getElementById('successMessage'),
        errorAlert: document.getElementById('errorAlert'),
        sendAnotherBtn: document.getElementById('sendAnotherBtn'),
        
        // Form Fields
        nameInput: document.getElementById('name'),
        emailInput: document.getElementById('email'),
        subjectSelect: document.getElementById('subject'),
        phoneInput: document.getElementById('phone'),
        messageInput: document.getElementById('message'),
        
        // Error Messages
        nameError: document.getElementById('nameError'),
        emailError: document.getElementById('emailError'),
        subjectError: document.getElementById('subjectError'),
        phoneError: document.getElementById('phoneError'),
        messageError: document.getElementById('messageError'),
        
        // Character Count
        charCount: document.getElementById('charCount'),
        
        // Buttons
        liveChatBtn: document.getElementById('liveChatBtn'),
        openModalBtn: document.getElementById('openModalBtn')
    };

    // ============================================
    // CONFIGURATION
    // ============================================
    const config = {
        maxMessageLength: 1000, // Reduced for compact form
        warningThreshold: 750,
        dangerThreshold: 900,
        minNameLength: 2,
        minMessageLength: 10,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneRegex: /^[\+]?[0-9\s\-\(\)]{7,20}$/,
        storageKey: 'theme-preference',
        formDataKey: 'contact-form-draft',
        apiEndpoint: '/api/contact',
        successDisplayDuration: 0,
        debounceDelay: 300
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    const Utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        sanitizeHTML(str) {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        },

        isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        isPartiallyVisible(element, threshold = 0.1) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
            return visibleHeight / rect.height >= threshold;
        },

        scrollToElement(element, offset = 0) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        },

        formatPhoneNumber(phone) {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            }
            return phone;
        }
    };

    // ============================================
    // SECTION ENTRY ANIMATIONS (NEW)
    // ============================================
    const SectionAnimator = {
        observer: null,
        hasAnimated: false,

        init() {
            if (!elements.contactSection) return;
            
            // Check for reduced motion preference
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.showAllImmediately();
                return;
            }

            this.setupObserver();
            this.checkInitialVisibility();
        },

        setupObserver() {
            const observerOptions = {
                root: null,
                rootMargin: '-10% 0px -10% 0px',
                threshold: [0, 0.1, 0.2, 0.3]
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                        this.triggerAnimations();
                    }
                });
            }, observerOptions);

            this.observer.observe(elements.contactSection);
        },

        checkInitialVisibility() {
            requestAnimationFrame(() => {
                if (Utils.isPartiallyVisible(elements.contactSection, 0.2)) {
                    this.triggerAnimations();
                }
            });
        },

        triggerAnimations() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            elements.contactSection.setAttribute('data-section-state', 'active');
            elements.contactSection.classList.add('is-visible', 'animate-in');

            if (this.observer) {
                this.observer.disconnect();
            }

            console.log('Contact section animations triggered');
        },

        showAllImmediately() {
            if (!elements.contactSection) return;
            elements.contactSection.setAttribute('data-section-state', 'active');
            elements.contactSection.classList.add('is-visible', 'animate-in', 'no-animation');
        },

        reset() {
            if (!elements.contactSection) return;
            this.hasAnimated = false;
            elements.contactSection.setAttribute('data-section-state', 'entering');
            elements.contactSection.classList.remove('is-visible', 'animate-in');

            if (this.observer) {
                this.observer.observe(elements.contactSection);
            }
        }
    };

    // ============================================
    // THEME MANAGEMENT - ONLY IF NOT ALREADY HANDLED
    // ============================================
    const ThemeManager = {
        isExternallyManaged: false,

        init() {
            // Check if theme is already managed by another script
            if (window.ThemeManager || window.themeToggleHandler || document.body.hasAttribute('data-theme-managed')) {
                this.isExternallyManaged = true;
                console.log('Theme is managed externally, skipping contact theme init');
                return;
            }

            this.loadSavedTheme();
            this.bindEvents();
        },

        loadSavedTheme() {
            if (this.isExternallyManaged) return;

            const savedTheme = localStorage.getItem(config.storageKey);
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
                this.setTheme(savedTheme);
            } else if (!prefersDark) {
                this.setTheme('light');
            } else {
                this.setTheme('dark');
            }
        },

        setTheme(theme) {
            if (this.isExternallyManaged) return;

            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
            localStorage.setItem(config.storageKey, theme);
            
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        },

        toggle() {
            if (this.isExternallyManaged) return;

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            this.setTheme(isLight ? 'dark' : 'light');
        },

        getCurrentTheme() {
            return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        },

        bindEvents() {
            if (this.isExternallyManaged) return;

            if (elements.themeToggle && !elements.themeToggle.hasAttribute('data-contact-theme-bound')) {
                elements.themeToggle.setAttribute('data-contact-theme-bound', 'true');
                
                elements.themeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggle();
                });
                
                elements.themeToggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            }

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(config.storageKey)) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    };

    // ... REST OF YOUR EXISTING CODE (FormValidator, FormHandler, etc.) ...
    // Keep all your existing FormValidator, FormHandler, Accessibility, 
    // SmoothScroll, AnimationObserver, KeyboardNav, Performance modules exactly as they are

    // ============================================
    // INITIALIZE APPLICATION (UPDATED)
    // ============================================
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initModules);
        } else {
            initModules();
        }
    }

    function initModules() {
        try {
            // NEW: Section animations first
            SectionAnimator.init();
            
            ThemeManager.init();
            FormHandler.init();
            Accessibility.init();
            SmoothScroll.init();
            AnimationObserver.init();
            KeyboardNav.init();
            Performance.init();
            
            console.log('Contact section initialized successfully');
        } catch (error) {
            console.error('Error initializing contact section:', error);
        }
    }

    init();

    // ============================================
    // EXPOSE PUBLIC API (NAMESPACED)
    // ============================================
    window.FupixContactSection = {
        ThemeManager,
        FormHandler,
        FormValidator,
        SectionAnimator,
        Utils,
        
        toggleTheme: () => ThemeManager.toggle(),
        getTheme: () => ThemeManager.getCurrentTheme(),
        resetForm: () => FormHandler.resetForm(),
        triggerAnimations: () => SectionAnimator.triggerAnimations(),
        resetAnimations: () => SectionAnimator.reset()
    };

})();