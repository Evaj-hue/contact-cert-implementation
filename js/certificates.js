/* ============================================
   CERTIFICATE MODAL SYSTEM
   For FUPIX Solutions One-Page Website
   Version: 1.1 - With Lightbox (No Redirect)
   ============================================ */

// ============================================
// CERTIFICATE DATA
// ============================================
const certificates = [
    {
        id: 1,
        title: "PAGCOR CERTIFICATE OF ACCREDITATION",
        organization: "PAGCOR",
        date: "November 2025",
        credentialId: "GCP-SB-25-036",
        description: "This certification validates expertise in designing distributed systems on AWS. Covers compute, networking, storage, and database AWS services, as well as security best practices and cost optimization strategies.",
        image: "./img/CERTIFICATE.jpg",
        featured: true
    },
    {
        id: 2,
        title: "PAGCOR CERTIFICATE OF ENROLLMENT",
        organization: "PAGCOR",
        date: "November 2025",
        credentialId: "COE No. 25-0016",
        description: "Certificate of Enrollment issued by the Philippine Amusement and Gaming Corporation (PAGCOR), confirming the holder's official registration and participation in authorized gaming operations in accordance with existing regulatory policies and guidelines.",
        image: "./img/pagcor-cert-enroll.png",
        featured: false
    },
    {
        id: 3,
        title: "MAYOR'S PERMIT FOR BUSINESS OPERATIONS",
        organization: "Quezon City Government",
        date: "January 2025",
        credentialId: "SEC 202403014134112",
        description: "Mayor's Permit issued by Quezon City Hall authorizing the lawful operation of the business, certifying compliance with local ordinances, taxation policies, and regulatory requirements of the Quezon City Government.",
        image: "./img/mayors-permit.png",
        featured: false
    },
    {
        id: 4,
        title: "SECURITIES AND EXCHANGE COMMISSION (SEC) CERTIFICATE",
        organization: "SEC PHILIPPINES",
        date: "March 2024",
        credentialId: "COMPANY REG. No. 2024030141341-12",
        description: "Certificate issued by the Securities and Exchange Commission (SEC) confirming the official registration and legal existence of the company in accordance with Philippine corporate laws and regulations.",
        image: "./img/sec.png",
        featured: false
    },
    {
        id: 5,
        title: "GLI AUSTRALIA GAME CERTIFICATION",
        organization: "GLI Australia",
        date: "June 2025",
        credentialId: "MO-120-FS7-25-01",
        description: "GLI Australia Game Certification confirming that the gaming system and software have been independently tested and verified to comply with recognized technical standards, fairness requirements, and regulatory specifications for gaming operations.",
        image: "./img/gli.png",
        featured: true
    }
];

// ============================================
// DOM ELEMENTS
// ============================================
let modalOverlay = null;
let modal = null;
let galleryView = null;
let detailView = null;
let openModalBtn = null;
let closeModalBtn = null;
let backBtn = null;
let prevBtn = null;
let nextBtn = null;
let detailImage = null;
let detailTitle = null;
let detailOrganization = null;
let detailDate = null;
let detailCredentialId = null;
let detailDescription = null;

// Lightbox element
let lightbox = null;

// Current certificate index for navigation
let currentIndex = 0;

// ============================================
// CREATE LIGHTBOX ELEMENT
// ============================================
function createLightbox() {
    // Check if lightbox already exists
    if (document.getElementById('certLightbox')) {
        lightbox = document.getElementById('certLightbox');
        return;
    }

    // Create lightbox HTML
    const lightboxHTML = `
        <div class="cert-lightbox" id="certLightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Full size certificate image">
            <div class="cert-lightbox-backdrop"></div>
            <div class="cert-lightbox-content">
                <button class="cert-lightbox-close" id="certLightboxClose" aria-label="Close full size image">
                    <i class="fas fa-times"></i>
                </button>
                <button class="cert-lightbox-nav cert-lightbox-prev" id="certLightboxPrev" aria-label="Previous image">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="cert-lightbox-image-wrapper">
                    <img src="" alt="Certificate full size" class="cert-lightbox-image" id="certLightboxImage">
                    <div class="cert-lightbox-loader">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
                <button class="cert-lightbox-nav cert-lightbox-next" id="certLightboxNext" aria-label="Next image">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="cert-lightbox-caption" id="certLightboxCaption"></div>
                <div class="cert-lightbox-counter" id="certLightboxCounter"></div>
            </div>
            <div class="cert-lightbox-hint">
                <span>Press <kbd>ESC</kbd> to close • Use <kbd>←</kbd> <kbd>→</kbd> to navigate</span>
            </div>
        </div>
    `;

    // Add to body
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Get reference
    lightbox = document.getElementById('certLightbox');

    // Add lightbox event listeners
    initLightboxEvents();
}

// ============================================
// INITIALIZE LIGHTBOX EVENTS
// ============================================
function initLightboxEvents() {
    const lightboxClose = document.getElementById('certLightboxClose');
    const lightboxPrev = document.getElementById('certLightboxPrev');
    const lightboxNext = document.getElementById('certLightboxNext');
    const lightboxBackdrop = lightbox.querySelector('.cert-lightbox-backdrop');
    const lightboxImage = document.getElementById('certLightboxImage');

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeLightbox();
        });
    }

    // Click backdrop to close
    if (lightboxBackdrop) {
        lightboxBackdrop.addEventListener('click', function(e) {
            e.preventDefault();
            closeLightbox();
        });
    }

    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            lightboxPrevious();
        });
    }

    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            lightboxNext_();
        });
    }

    // Click image to close (optional - can be changed to zoom)
    if (lightboxImage) {
        lightboxImage.addEventListener('click', function(e) {
            e.stopPropagation();
            // Optional: Close on image click
            // closeLightbox();
        });
    }
}

// ============================================
// OPEN LIGHTBOX
// ============================================
function openLightbox(index) {
    if (!lightbox) {
        createLightbox();
    }

    if (index === undefined) {
        index = currentIndex;
    }

    const cert = certificates[index];
    if (!cert) return;

    const lightboxImage = document.getElementById('certLightboxImage');
    const lightboxCaption = document.getElementById('certLightboxCaption');
    const lightboxCounter = document.getElementById('certLightboxCounter');
    const lightboxPrev = document.getElementById('certLightboxPrev');
    const lightboxNext = document.getElementById('certLightboxNext');

    // Show loading state
    lightbox.classList.add('loading');

    // Update image
    if (lightboxImage) {
        lightboxImage.onload = function() {
            lightbox.classList.remove('loading');
        };
        lightboxImage.onerror = function() {
            lightbox.classList.remove('loading');
            lightboxImage.alt = 'Failed to load image';
        };
        lightboxImage.src = cert.image;
        lightboxImage.alt = cert.title;
    }

    // Update caption
    if (lightboxCaption) {
        lightboxCaption.textContent = cert.title;
    }

    // Update counter
    if (lightboxCounter) {
        lightboxCounter.textContent = `${index + 1} / ${certificates.length}`;
    }

    // Update navigation buttons
    if (lightboxPrev) {
        lightboxPrev.disabled = index === 0;
        lightboxPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
    }
    if (lightboxNext) {
        lightboxNext.disabled = index === certificates.length - 1;
        lightboxNext.style.visibility = index === certificates.length - 1 ? 'hidden' : 'visible';
    }

    // Show lightbox
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');

    // Store current index for navigation
    lightbox.dataset.currentIndex = index;

    console.log('Lightbox opened:', cert.title);
}

// ============================================
// CLOSE LIGHTBOX
// ============================================
function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove('active');
    lightbox.classList.remove('loading');
    lightbox.setAttribute('aria-hidden', 'true');

    // Return focus to detail image
    if (detailImage) {
        detailImage.focus();
    }

    console.log('Lightbox closed');
}

// ============================================
// LIGHTBOX NAVIGATION
// ============================================
function lightboxPrevious() {
    if (!lightbox) return;

    let index = parseInt(lightbox.dataset.currentIndex) || 0;
    if (index > 0) {
        openLightbox(index - 1);
    }
}

function lightboxNext_() {
    if (!lightbox) return;

    let index = parseInt(lightbox.dataset.currentIndex) || 0;
    if (index < certificates.length - 1) {
        openLightbox(index + 1);
    }
}

// ============================================
// INITIALIZE DOM ELEMENTS
// ============================================
function initDOMElements() {
    // Modal elements
    modalOverlay = document.getElementById('certModalOverlay');
    modal = document.getElementById('certModal');
    galleryView = document.getElementById('certGalleryView');
    detailView = document.getElementById('certDetailView');

    // Buttons
    openModalBtn = document.getElementById('openCertModalBtn');
    closeModalBtn = document.getElementById('closeCertModalBtn');
    backBtn = document.getElementById('certBackBtn');
    prevBtn = document.getElementById('certPrevBtn');
    nextBtn = document.getElementById('certNextBtn');

    // Detail view elements
    detailImage = document.getElementById('certDetailImage');
    detailTitle = document.getElementById('certDetailTitle');
    detailOrganization = document.getElementById('certDetailOrganization');
    detailDate = document.getElementById('certDetailDate');
    detailCredentialId = document.getElementById('certDetailCredentialId');
    detailDescription = document.getElementById('certDetailDescription');
}

// ============================================
// INITIALIZE GALLERY
// ============================================
function initGallery() {
    if (!galleryView) {
        console.warn('Certificate gallery view not found');
        return;
    }

    // Clear existing content
    galleryView.innerHTML = '';

    // Create certificate cards
    certificates.forEach((cert, index) => {
        const card = document.createElement('div');
        card.className = `cert-card${cert.featured ? ' featured' : ''}`;
        card.dataset.index = index;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View ${cert.title} certificate`);

        card.innerHTML = `
            <img src="${cert.image}" alt="${cert.title}" loading="lazy" onerror="this.src='./img/placeholder.png'">
            <div class="cert-card-info">
                <h4>${cert.title}</h4>
                <p>${cert.organization}</p>
            </div>
        `;

        // Click event
        card.addEventListener('click', function() {
            showDetail(index);
        });

        // Keyboard accessibility (Enter and Space)
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showDetail(index);
            }
        });

        galleryView.appendChild(card);
    });
}

// ============================================
// OPEN MODAL
// ============================================
function openModal() {
    if (!modalOverlay) {
        console.warn('Modal overlay not found');
        return;
    }

    // Show modal
    modalOverlay.classList.add('active');
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    // Show gallery view
    showGallery();

    // Focus first card after animation
    setTimeout(function() {
        const firstCard = galleryView ? galleryView.querySelector('.cert-card') : null;
        if (firstCard) {
            firstCard.focus();
        }
    }, 300);

    // Update ARIA
    modalOverlay.setAttribute('aria-hidden', 'false');
    
    console.log('Certificate modal opened');
}

// ============================================
// CLOSE MODAL
// ============================================
function closeModal() {
    if (!modalOverlay) return;

    // Close lightbox first if open
    if (lightbox && lightbox.classList.contains('active')) {
        closeLightbox();
        return;
    }

    // Hide modal
    modalOverlay.classList.remove('active');
    
    // Restore background scrolling
    document.body.style.overflow = '';

    // Reset to gallery view for next open
    showGallery();

    // Return focus to trigger button
    if (openModalBtn) {
        openModalBtn.focus();
    }

    // Update ARIA
    modalOverlay.setAttribute('aria-hidden', 'true');
    
    console.log('Certificate modal closed');
}

// ============================================
// SHOW GALLERY VIEW
// ============================================
function showGallery() {
    if (!galleryView || !detailView) return;

    galleryView.classList.remove('hidden');
    detailView.classList.remove('active');
}

// ============================================
// SHOW DETAIL VIEW
// ============================================
function showDetail(index) {
    if (!galleryView || !detailView) return;
    
    // Validate index
    if (index < 0 || index >= certificates.length) {
        console.warn('Invalid certificate index:', index);
        return;
    }

    currentIndex = index;
    const cert = certificates[index];

    // Update detail view content
    if (detailImage) {
        detailImage.src = cert.image;
        detailImage.alt = cert.title;
    }
    if (detailTitle) {
        detailTitle.textContent = cert.title;
    }
    if (detailOrganization) {
        detailOrganization.textContent = cert.organization;
    }
    if (detailDate) {
        detailDate.textContent = cert.date;
    }
    if (detailCredentialId) {
        detailCredentialId.textContent = cert.credentialId;
    }
    if (detailDescription) {
        detailDescription.textContent = cert.description;
    }

    // Update navigation buttons
    updateNavButtons();

    // Switch views
    galleryView.classList.add('hidden');
    detailView.classList.add('active');

    // Focus back button for accessibility
    setTimeout(function() {
        if (backBtn) {
            backBtn.focus();
        }
    }, 100);
    
    console.log('Showing certificate detail:', cert.title);
}

// ============================================
// UPDATE NAVIGATION BUTTONS
// ============================================
function updateNavButtons() {
    if (!prevBtn || !nextBtn) return;

    // Enable/disable based on position
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === certificates.length - 1;

    // Update ARIA labels for screen readers
    if (currentIndex > 0) {
        prevBtn.setAttribute('aria-label', 'Previous: ' + certificates[currentIndex - 1].title);
    } else {
        prevBtn.setAttribute('aria-label', 'No previous certificate');
    }

    if (currentIndex < certificates.length - 1) {
        nextBtn.setAttribute('aria-label', 'Next: ' + certificates[currentIndex + 1].title);
    } else {
        nextBtn.setAttribute('aria-label', 'No next certificate');
    }
}

// ============================================
// SHOW PREVIOUS CERTIFICATE
// ============================================
function showPrevious() {
    if (currentIndex > 0) {
        showDetail(currentIndex - 1);
    }
}

// ============================================
// SHOW NEXT CERTIFICATE
// ============================================
function showNext() {
    if (currentIndex < certificates.length - 1) {
        showDetail(currentIndex + 1);
    }
}

// ============================================
// INITIALIZE EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Open modal button
    if (openModalBtn) {
        openModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openModal();
        });
    } else {
        console.warn('Open modal button not found');
    }

    // Close modal button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }

    // Close modal when clicking overlay (outside modal)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Back to gallery button
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showGallery();
        });
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showPrevious();
        });
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNext();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Click on detail image to open LIGHTBOX (not redirect!)
    if (detailImage) {
        detailImage.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(currentIndex);
        });
        
        // Make it keyboard accessible
        detailImage.setAttribute('tabindex', '0');
        detailImage.setAttribute('role', 'button');
        detailImage.setAttribute('aria-label', 'Click to view full size image');
        
        detailImage.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(currentIndex);
            }
        });
    }
}

// ============================================
// KEYBOARD HANDLING
// ============================================
function handleKeyboard(e) {
    // Handle lightbox keyboard first (higher priority)
    if (lightbox && lightbox.classList.contains('active')) {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                closeLightbox();
                return;
            case 'ArrowLeft':
                e.preventDefault();
                lightboxPrevious();
                return;
            case 'ArrowRight':
                e.preventDefault();
                lightboxNext_();
                return;
        }
        return;
    }

    // Only handle modal keyboard if modal is open
    if (!modalOverlay || !modalOverlay.classList.contains('active')) {
        return;
    }

    switch (e.key) {
        case 'Escape':
            e.preventDefault();
            if (detailView && detailView.classList.contains('active')) {
                // If in detail view, go back to gallery
                showGallery();
            } else {
                // If in gallery view, close modal
                closeModal();
            }
            break;

        case 'ArrowLeft':
            if (detailView && detailView.classList.contains('active')) {
                e.preventDefault();
                showPrevious();
            }
            break;

        case 'ArrowRight':
            if (detailView && detailView.classList.contains('active')) {
                e.preventDefault();
                showNext();
            }
            break;

        case 'Tab':
            // Focus trap within modal
            handleFocusTrap(e);
            break;
    }
}

// ============================================
// FOCUS TRAP (Accessibility)
// ============================================
function handleFocusTrap(e) {
    if (!modal) return;

    // Get all focusable elements within modal
    const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = modal.querySelectorAll(focusableSelectors);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
        // Shift + Tab: going backwards
        if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// ============================================
// TOUCH/SWIPE SUPPORT (Mobile)
// ============================================
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

function initTouchSupport() {
    // Detail view swipe
    if (detailView) {
        detailView.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        detailView.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(false);
        }, { passive: true });
    }

    // Lightbox swipe (will be initialized when lightbox is created)
}

function initLightboxTouchSupport() {
    if (!lightbox) return;

    const imageWrapper = lightbox.querySelector('.cert-lightbox-image-wrapper');
    if (!imageWrapper) return;

    imageWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    imageWrapper.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(true);
    }, { passive: true });
}

function handleSwipe(isLightbox) {
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < swipeThreshold) {
        return; // Not a significant swipe
    }

    if (isLightbox) {
        if (diff > 0) {
            lightboxNext_();
        } else {
            lightboxPrevious();
        }
    } else {
        if (diff > 0) {
            showNext();
        } else {
            showPrevious();
        }
    }
}

// ============================================
// IMAGE PRELOADING
// ============================================
function preloadImages() {
    certificates.forEach(function(cert) {
        const img = new Image();
        img.src = cert.image;
    });
}

// ============================================
// MAIN INITIALIZATION
// ============================================
function initCertificateModal() {
    console.log('Initializing certificate modal...');
    
    // Initialize DOM elements
    initDOMElements();

    // Check if required elements exist
    if (!modalOverlay) {
        console.error('Certificate modal: modalOverlay not found');
        return;
    }
    
    if (!modal) {
        console.error('Certificate modal: modal container not found');
        return;
    }
    
    if (!galleryView) {
        console.error('Certificate modal: galleryView not found');
        return;
    }

    // Create lightbox
    createLightbox();
    
    // Initialize lightbox touch support
    initLightboxTouchSupport();

    // Initialize gallery
    initGallery();

    // Initialize event listeners
    initEventListeners();

    // Initialize touch support for mobile
    initTouchSupport();

    // Preload images for smoother experience
    preloadImages();

    // Set initial ARIA state
    modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'certModalTitle');

    console.log('Certificate modal initialized successfully!');
    console.log('Total certificates:', certificates.length);
}

// ============================================
// RUN ON DOM READY
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCertificateModal);
} else {
    // DOM already loaded
    initCertificateModal();
}

// ============================================
// EXPORT FOR EXTERNAL USE (Optional)
// ============================================
window.CertificateModal = {
    open: openModal,
    close: closeModal,
    showDetail: showDetail,
    showGallery: showGallery,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox,
    certificates: certificates
};