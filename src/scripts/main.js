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

  // Gallery slider functionality
  const setupGallerySlider = () => {
    const galleryWrapper = document.querySelector('.gallery__wrapper');
    const prevButton = document.querySelector('.gallery__nav-button--prev');
    const nextButton = document.querySelector('.gallery__nav-button--next');
    const slides = document.querySelectorAll('.gallery__slide');
    
    if (!galleryWrapper || !slides.length) {
      return;
    }
    
    let currentIndex = 0;
    let startX;
    let currentX;
    const slidesToShow = getSlidesToShow();
    const totalSlides = slides.length;
    
    function getSlidesToShow() {
      if (window.innerWidth <= 576) {
        return 1;
      } else if (window.innerWidth <= 768) {
        return 2;
      } else if (window.innerWidth <= 1024) {
        return 3;
      } else {
        return 4;
      }
    }
    
    // Update slide position
    function updateSlidePosition() {
      const slideWidth = slides[0].offsetWidth;
      const gap = 20; // gap between slides in px
      const offset = currentIndex * (slideWidth + gap);
      galleryWrapper.style.transform = `translateX(-${offset}px)`;
    }
    
    // Handle navigation buttons
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlidePosition();
        }
      });
      
      nextButton.addEventListener('click', () => {
        if (currentIndex < totalSlides - slidesToShow) {
          currentIndex++;
          updateSlidePosition();
        }
      });
    }
    
    // Touch events for swipe on mobile
    galleryWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      galleryWrapper.style.transition = 'none';
    }, { passive: true });
    
    galleryWrapper.addEventListener('touchmove', (e) => {
      if (!startX) return;
      
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      const slideWidth = slides[0].offsetWidth;
      const gap = 20;
      const currentOffset = currentIndex * (slideWidth + gap);
      
      // Apply resistance if at the edges
      let newOffset = currentOffset + diff;
      if (newOffset < 0) {
        newOffset = diff / 4; // Add resistance at the beginning
      } else if (currentIndex >= totalSlides - slidesToShow) {
        newOffset = currentOffset + diff / 4; // Add resistance at the end
      }
      
      galleryWrapper.style.transform = `translateX(-${newOffset}px)`;
    }, { passive: true });
    
    galleryWrapper.addEventListener('touchend', (e) => {
      if (!startX || !currentX) {
        startX = null;
        currentX = null;
        return;
      }
      
      galleryWrapper.style.transition = 'transform 0.5s ease';
      const diff = startX - currentX;
      const threshold = 100; // Minimum swipe distance
      
      if (diff > threshold && currentIndex < totalSlides - slidesToShow) {
        currentIndex++;
      } else if (diff < -threshold && currentIndex > 0) {
        currentIndex--;
      }
      
      updateSlidePosition();
      startX = null;
      currentX = null;
    }, { passive: true });
    
    // Resize handler to adjust for different screen sizes
    window.addEventListener('resize', () => {
      const newSlidesToShow = getSlidesToShow();
      if (slidesToShow !== newSlidesToShow) {
        // Reset position if needed
        if (currentIndex > totalSlides - newSlidesToShow) {
          currentIndex = Math.max(0, totalSlides - newSlidesToShow);
        }
        updateSlidePosition();
      }
    });
    
    // Initialize slider
    updateSlidePosition();
  };

  // Teachers slider functionality
  const setupTeachersSlider = () => {
    const teachersWrapper = document.querySelector('.teachers__wrapper');
    const prevButton = document.querySelector('.teachers__nav-button--prev');
    const nextButton = document.querySelector('.teachers__nav-button--next');
    const teachers = document.querySelectorAll('.teacher');
    
    if (!teachersWrapper || !teachers.length) {
      return;
    }
    
    let currentIndex = 0;
    let startX;
    let currentX;
    const slidesToShow = getTeacherSlidesToShow();
    const totalSlides = teachers.length;
    
    function getTeacherSlidesToShow() {
      if (window.innerWidth <= 768) {
        return 1;
      } else if (window.innerWidth <= 1024) {
        return 2;
      } else {
        return 3; // Основных карточек всегда видно 3, но частично видны еще две
      }
    }
    
    // Update slide position
    function updateTeacherPosition() {
      const slideWidth = teachers[0].offsetWidth;
      const gap = 30; // gap between slides in px
      const offset = currentIndex * (slideWidth + gap);
      teachersWrapper.style.transform = `translateX(-${offset}px)`;
    }
    
    // Handle navigation buttons
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateTeacherPosition();
        }
      });
      
      nextButton.addEventListener('click', () => {
        if (currentIndex < totalSlides - slidesToShow) {
          currentIndex++;
          updateTeacherPosition();
        }
      });
    }
    
    // Touch events for swipe on mobile
    teachersWrapper.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      teachersWrapper.style.transition = 'none';
    }, { passive: true });
    
    teachersWrapper.addEventListener('touchmove', (e) => {
      if (!startX) return;
      
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      const slideWidth = teachers[0].offsetWidth;
      const gap = 30;
      const currentOffset = currentIndex * (slideWidth + gap);
      
      // Apply resistance if at the edges
      let newOffset = currentOffset + diff;
      if (newOffset < 0) {
        newOffset = diff / 4; // Add resistance at the beginning
      } else if (currentIndex >= totalSlides - slidesToShow) {
        newOffset = currentOffset + diff / 4; // Add resistance at the end
      }
      
      teachersWrapper.style.transform = `translateX(-${newOffset}px)`;
    }, { passive: true });
    
    teachersWrapper.addEventListener('touchend', (e) => {
      if (!startX || !currentX) {
        startX = null;
        currentX = null;
        return;
      }
      
      teachersWrapper.style.transition = 'transform 0.5s ease';
      const diff = startX - currentX;
      const threshold = 100; // Minimum swipe distance
      
      if (diff > threshold && currentIndex < totalSlides - slidesToShow) {
        currentIndex++;
      } else if (diff < -threshold && currentIndex > 0) {
        currentIndex--;
      }
      
      updateTeacherPosition();
      startX = null;
      currentX = null;
    }, { passive: true });
    
    // Resize handler to adjust for different screen sizes
    window.addEventListener('resize', () => {
      const newSlidesToShow = getTeacherSlidesToShow();
      if (slidesToShow !== newSlidesToShow) {
        // Reset position if needed
        if (currentIndex > totalSlides - newSlidesToShow) {
          currentIndex = Math.max(0, totalSlides - newSlidesToShow);
        }
        updateTeacherPosition();
      }
    });
    
    // Initialize slider
    updateTeacherPosition();
  };

  // Initialize functionality
  setupSmoothScroll();
  setupMobileMenu();
  setupGallerySlider();
  setupTeachersSlider();

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