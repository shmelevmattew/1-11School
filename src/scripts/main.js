document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle functionality
  const setupMobileMenu = () => {
    const burgerButton = document.querySelector('.burger-menu');
    const closeButton = document.querySelector('.mobile-menu__close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');
    const body = document.body;

    if (!burgerButton || !closeButton || !mobileMenu) {
      return;
    }

    const openMenu = () => {
      mobileMenu.classList.add('active');
      body.classList.add('no-scroll');
      burgerButton.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('active');
      body.classList.remove('no-scroll');
      burgerButton.setAttribute('aria-expanded', 'false');
    };

    burgerButton.addEventListener('click', openMenu);
    closeButton.addEventListener('click', closeMenu);

    // Close menu when clicking on a link
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('active') &&
          !mobileMenu.contains(e.target) &&
          !burgerButton.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  };

  // Smooth scrolling for navigation links
  const setupSmoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href !== '#') {
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }
      });
    });
  };

  // Initialize functionality
  setupSmoothScroll();
  setupMobileMenu();

  // Intersection Observer for animation on scroll (for future implementation)
  const setupAnimations = () => {
    // This will be implemented when needed
  };

  // Lazy loading for images (for Lighthouse optimization)
  const setupLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      // This can be implemented with a library if needed
    }
  };

  // Form validation (for future implementation)
  const setupFormValidation = () => {
    // This will be implemented when application forms are added
  };
}); 