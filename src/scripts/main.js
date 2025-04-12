document.addEventListener('DOMContentLoaded', () => {
  // Add header scroll behavior
  const setupHeaderScroll = () => {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;

      // Only hide header when scrolling down more than 10px and past 100px from top
      if (scrollDelta > 10 && scrollY > 100) {
        header.classList.add('header--hidden');
      } 
      // Show header when scrolling up or at top
      else if (scrollDelta < -10 || scrollY <= 100) {
        header.classList.remove('header--hidden');
      }

      lastScrollY = scrollY;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateHeader();
        });
        ticking = true;
      }
    }, { passive: true });

    // Show header when reaching top or bottom of page
    window.addEventListener('scrollend', () => {
      if (window.scrollY <= 100 || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        header.classList.remove('header--hidden');
      }
    }, { passive: true });
  };

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
    function updateTeacherPosition() {
      const slideWidth = teachers[0].offsetWidth;
      const gap = 20; // уменьшаем отступ между слайдами
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
      const gap = 20;
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

  // Emoji Animation
  const setupEmojiAnimations = () => {
    // Green emoji animation (waving hand)
    const greenEmoji = document.querySelector('.promo__emoji--green');
    if (greenEmoji) {
      const frames = ['(￣▽￣)ノ', '(￣▽￣)/', '(￣▽￣)〆', '(￣▽￣)ノ', '(￣▽￣)〆'];
      let currentFrame = 0;
      
      setInterval(function() {
        greenEmoji.textContent = frames[currentFrame];
        currentFrame = (currentFrame + 1) % frames.length;
      }, 300);
    }

    // Blue emoji animation (blinking)
    const blueEmoji = document.querySelector('.promo__emoji--blue');
    if (blueEmoji) {
      const blinkFrames = ['(✯◡✯)', '(✯ᴗ✯)', '(✯◡✯)'];
      let blinkFrame = 0;
      
      setInterval(function() {
        blueEmoji.textContent = blinkFrames[blinkFrame];
        blinkFrame = (blinkFrame + 1) % blinkFrames.length;
      }, 500);
    }

    // Kawaii emoji animation
    const kawaiiEmoji = document.querySelector('.feature__kawaii');
    if (kawaiiEmoji) {
      const kawaiiFrames = ['(*^.^*)', '(*^_^*)', '(*^ω^*)', '(*^.^*)'];
      let kawaiiFrame = 0;
      
      setInterval(function() {
        kawaiiEmoji.textContent = kawaiiFrames[kawaiiFrame];
        kawaiiFrame = (kawaiiFrame + 1) % kawaiiFrames.length;
      }, 700);
    }

    // Cool emoji animation
    const coolEmoji = document.querySelector('.feature__cool-emoji');
    if (coolEmoji) {
      const coolFrames = ['(⌐■_■)', '(⌐■ᴥ■)', '(⌐■_■)'];
      let coolFrame = 0;
      
      setInterval(function() {
        coolEmoji.textContent = coolFrames[coolFrame];
        coolFrame = (coolFrame + 1) % coolFrames.length;
      }, 800);
    }
    
    // Pricing top emoji animation
    const pricingTopEmoji = document.querySelector('.pricing__emoji-top .pricing__emoji-image');
    if (pricingTopEmoji) {
      const pricingTopFrames = ['(ノ*°▽°*)', '(ノ*°ω°*)', '(ノ*°▽°*)', '(ノ*°∀°*)'];
      let pricingTopFrame = 0;
      
      setInterval(function() {
        pricingTopEmoji.textContent = pricingTopFrames[pricingTopFrame];
        pricingTopFrame = (pricingTopFrame + 1) % pricingTopFrames.length;
      }, 600);
    }
    
    // Pricing bottom emoji animation
    const pricingBottomEmoji = document.querySelector('.pricing__emoji-bottom .pricing__emoji-image');
    if (pricingBottomEmoji) {
      const pricingBottomFrames = ['ヽ(>∀<☆)ノ', 'ヽ(>ω<☆)ノ', 'ヽ(>∀<☆)ノ', 'ヽ(>▽<☆)ノ'];
      let pricingBottomFrame = 0;
      
      setInterval(function() {
        pricingBottomEmoji.textContent = pricingBottomFrames[pricingBottomFrame];
        pricingBottomFrame = (pricingBottomFrame + 1) % pricingBottomFrames.length;
      }, 700);
    }
  };

  // Gallery popup functionality
  const setupGalleryPopup = () => {
    const body = document.body;
    
    // Create popup elements
    const popup = document.createElement('div');
    popup.className = 'popup';
    
    const popupImage = document.createElement('img');
    popupImage.className = 'popup__image';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'popup__close';
    closeButton.innerHTML = '×';
    
    popup.appendChild(popupImage);
    popup.appendChild(closeButton);
    body.appendChild(popup);
    
    // Add click handlers to gallery images
    const galleryImages = document.querySelectorAll('.gallery__image');
    galleryImages.forEach(image => {
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => {
        popupImage.src = image.src;
        popup.classList.add('active');
        body.classList.add('no-scroll');
      });
    });
    
    // Close popup on button click
    closeButton.addEventListener('click', () => {
      popup.classList.remove('active');
      body.classList.remove('no-scroll');
    });
    
    // Close popup on background click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('active');
        body.classList.remove('no-scroll');
      }
    });
    
    // Close popup on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('active')) {
        popup.classList.remove('active');
        body.classList.remove('no-scroll');
      }
    });
  };

  // Teachers popup functionality
  const setupTeachersPopup = () => {
    const body = document.body;
    
    // Create popup elements
    const popup = document.createElement('div');
    popup.className = 'teacher-popup';
    
    const popupContent = document.createElement('div');
    popupContent.className = 'teacher-popup__content';
    
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'teacher-popup__image-wrapper';
    
    const popupImage = document.createElement('img');
    popupImage.className = 'teacher-popup__image';
    
    const popupInfo = document.createElement('div');
    popupInfo.className = 'teacher-popup__info';
    
    const popupName = document.createElement('h3');
    popupName.className = 'teacher-popup__name';
    
    const popupPosition = document.createElement('div');
    popupPosition.className = 'teacher-popup__position';
    
    const popupQuote = document.createElement('div');
    popupQuote.className = 'teacher-popup__quote';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'teacher-popup__close';
    closeButton.innerHTML = '×';
    
    imageWrapper.appendChild(popupImage);
    popupInfo.appendChild(popupName);
    popupInfo.appendChild(popupPosition);
    popupInfo.appendChild(popupQuote);
    
    popupContent.appendChild(imageWrapper);
    popupContent.appendChild(popupInfo);
    popupContent.appendChild(closeButton);
    
    popup.appendChild(popupContent);
    body.appendChild(popup);
    
    // Add click handlers to teacher cards
    const teacherCards = document.querySelectorAll('.teacher');
    teacherCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        const image = card.querySelector('.teacher__image');
        const name = card.querySelector('.teacher__name');
        const position = card.querySelector('.teacher__position');
        const quote = card.querySelector('.teacher__quote');
        
        if (image && name && position && quote) {
          popupImage.src = image.src;
          popupName.textContent = name.textContent;
          popupPosition.textContent = position.textContent;
          popupQuote.textContent = quote.textContent;
          popup.classList.add('active');
          body.classList.add('no-scroll');
        }
      });
    });
    
    // Close popup on button click
    closeButton.addEventListener('click', () => {
      popup.classList.remove('active');
      body.classList.remove('no-scroll');
    });
    
    // Close popup on background click
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('active');
        body.classList.remove('no-scroll');
      }
    });
    
    // Close popup on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('active')) {
        popup.classList.remove('active');
        body.classList.remove('no-scroll');
      }
    });
  };

  // Scroll animations for elements
  const setupScrollAnimations = () => {
    // Общие элементы для вертикальной анимации
    const animatedElements = document.querySelectorAll(
      '.hero__content, .hero__image-container, .feature, .mission__content, .mission-feature, ' +
      '.cta__buttons, .section-title, .gallery__slide, .teacher-card, ' + 
      '.prices__card, .contact-form, .about-item, .program__content'
    );
    
    // Находим элементы, которые нужно анимировать с левой стороны
    const leftElements = document.querySelectorAll(
      '.hero__content, .mission__content, .feature:nth-child(odd)'
    );
    
    // Находим элементы, которые нужно анимировать с правой стороны
    const rightElements = document.querySelectorAll(
      '.hero__image-container, .feature:nth-child(even)'
    );
    
    // Находим элементы сетки
    const gridElements = document.querySelectorAll(
      '.gallery__slide, .teacher-card, .prices__card'
    );
    
    // Элементы с поворотом
    const rotateElements = document.querySelectorAll(
      '.feature__star'
    );
    
    // Элементы с простым появлением
    const fadeElements = document.querySelectorAll(
      '.section-title, .contact-form'
    );
    
    // Элементы, анимируемые снизу вверх
    const bottomElements = document.querySelectorAll(
      '.cta__buttons, .mission-action'
    );
    
    // Элементы эмодзи
    const emojiElements = document.querySelectorAll(
      '.hero__emoji, .feature__cool-emoji, .feature__kawaii'
    );
    
    // Элементы для раздела "Что вас ждёт"
    const benefitElements = document.querySelectorAll('.benefit');
    const benefitIcons = document.querySelectorAll('.benefit__icon');

    // Options for the Intersection Observer
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.1 // element is considered visible when 10% is visible
    };

    const animateElement = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Once animated, no need to observe anymore
          observer.unobserve(entry.target);
        }
      });
    };

    // Create observer
    const observer = new IntersectionObserver(animateElement, observerOptions);

    // Observe each element with standard animation
    animatedElements.forEach(element => {
      // Проверяем, не добавлен ли уже специальный класс анимации
      if (!element.classList.contains('from-left') && 
          !element.classList.contains('from-right') &&
          !element.classList.contains('rotate') &&
          !element.classList.contains('fade-in') &&
          !element.classList.contains('from-bottom')) {
        element.classList.add('animate-on-scroll');
      }
      observer.observe(element);
    });
    
    // Добавляем классы для горизонтальной анимации (слева)
    leftElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'from-left');
      observer.observe(element);
    });
    
    // Добавляем классы для горизонтальной анимации (справа)
    rightElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'from-right');
      observer.observe(element);
    });
    
    // Добавляем классы для элементов сетки
    gridElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'grid-item');
      observer.observe(element);
    });
    
    // Добавляем анимацию поворота
    rotateElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'rotate');
      observer.observe(element);
    });
    
    // Добавляем простое появление
    fadeElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'fade-in');
      observer.observe(element);
    });
    
    // Добавляем анимацию снизу вверх
    bottomElements.forEach(element => {
      element.classList.add('animate-on-scroll', 'from-bottom');
      observer.observe(element);
    });
    
    // Добавляем анимацию для эмодзи
    emojiElements.forEach(element => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
    
    // Добавляем анимацию для элементов "Что вас ждёт" с задержкой
    benefitElements.forEach((element) => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
    
    // Добавляем анимацию для иконок в блоках "Что вас ждёт"
    benefitIcons.forEach((icon, index) => {
      icon.classList.add('animate-on-scroll');
      observer.observe(icon);
    });
    
    // Функция для мгновенной анимации всех начально видимых элементов при загрузке
    const animateInitialElements = () => {
      // Отключаем наблюдатель временно, чтобы он не мешал анимировать элементы
      observer.disconnect();

      const preloadElements = document.querySelectorAll('.animate-on-scroll');
      
      // Анимируем все видимые элементы с минимальной задержкой
      preloadElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        // Проверяем, видим ли элемент в текущем viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Обходим transition-delay через добавление класса no-delay
          element.classList.add('no-delay');
          // Запускаем анимацию
          element.classList.add('animated');
        }
      });
      
      // Восстанавливаем наблюдатель для элементов, которые не были анимированы
      preloadElements.forEach((element) => {
        if (!element.classList.contains('animated')) {
          observer.observe(element);
        }
      });
    };

    // Запускаем анимацию сразу при загрузке DOM
    animateInitialElements();
    
    // И для надежности также после полной загрузки страницы 
    if (document.readyState === 'complete') {
      // Если страница уже загружена
      animateInitialElements();
    } else {
      // Запускаем снова после загрузки страницы
      window.addEventListener('load', animateInitialElements);
    }
    
    // Также проверяем еще раз спустя небольшое время
    setTimeout(animateInitialElements, 100);
  };

  // Initialize all functionality
  setupHeaderScroll();
  setupMobileMenu();
  setupSmoothScroll();
  setupGallerySlider();
  setupTeachersSlider();
  setupEmojiAnimations();
  setupGalleryPopup();
  setupTeachersPopup();
  
  // Initialize scroll animations
  setupScrollAnimations();

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