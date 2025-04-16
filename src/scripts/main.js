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
    let slidesToShow = getSlidesToShow();
    const totalSlides = slides.length;
    
    function getSlidesToShow() {
      if (window.innerWidth <= 576) {
        return 1;
      } else if (window.innerWidth <= 768) {
        return 2;
      } else if (window.innerWidth <= 1024) {
        return 2;
      } else {
        return 3;
      }
    }
    
    // Update slide position
    function updateSlidePosition() {
      const slideWidth = slides[0].offsetWidth;
      const gap = 30; // match the CSS gap value
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
        } else {
          // Return to first slide when reaching the end
          currentIndex = 0;
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
      const gap = 30;
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
        slidesToShow = newSlidesToShow;
        // Reset position if needed
        if (currentIndex > totalSlides - slidesToShow) {
          currentIndex = Math.max(0, totalSlides - slidesToShow);
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
    let slidesToShow = getTeacherSlidesToShow();
    const totalSlides = teachers.length;
    
    function getTeacherSlidesToShow() {
      if (window.innerWidth <= 576) {
        return 1;
      } else if (window.innerWidth <= 768) {
        return 2;
      } else if (window.innerWidth <= 1024) {
        return 2;
      } else {
        return 3;
      }
    }
    
    // Update slide position
    function updateTeacherPosition() {
      const slideWidth = teachers[0].offsetWidth;
      const gap = 30; // match the CSS gap value in teachers__wrapper
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
        } else {
          // Return to first slide when reaching the end
          currentIndex = 0;
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
        slidesToShow = newSlidesToShow;
        // Reset position if needed
        if (currentIndex > totalSlides - slidesToShow) {
          currentIndex = Math.max(0, totalSlides - slidesToShow);
        }
        updateTeacherPosition();
      }
    });
    
    // Initialize slider
    updateTeacherPosition();
  };

  // Emoji Animation
  const setupEmojiAnimations = () => {
    // This function is deliberately emptied to remove all emoji animations
    // No animations will be applied to emojis
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

  // Footer emoji mobile layout
  function handleFooterEmojiLayout() {
    const footerEmojis = document.querySelectorAll('.footer__emoji:not(.footer__emoji-container .footer__emoji)');
    const emojiContainer = document.querySelector('.footer__emoji-container');
    
    if (!emojiContainer) return;
    
    // Начальные тексты для каждого типа эмодзи
    const initialEmojis = {
      'sleeping': '(＿ ＿*) Z z z',
      'eating': '(っ˘ڡ˘ς)',
      'happy': '(ノ*°▽°*)',
      'cool': '(⌐■_■)'
    };
    
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        // Clear container first to prevent duplicates on resize
        emojiContainer.innerHTML = '';
        
        // Clone original emojis to container on mobile
        footerEmojis.forEach(emoji => {
          // Сохраняем оригинальный текст эмодзи
          let emojiType = '';
          if (emoji.classList.contains('footer__emoji--sleeping')) {
            emojiType = 'sleeping';
          } else if (emoji.classList.contains('footer__emoji--eating')) {
            emojiType = 'eating';
          } else if (emoji.classList.contains('footer__emoji--happy')) {
            emojiType = 'happy';
          } else if (emoji.classList.contains('footer__emoji--cool')) {
            emojiType = 'cool';
          }
          
          const clone = emoji.cloneNode(true);
          // Восстанавливаем текст эмодзи, если он был изменен
          if (emojiType && initialEmojis[emojiType] && (!emoji.textContent || emoji.textContent.trim() === '')) {
            clone.textContent = initialEmojis[emojiType];
          }
          
          emojiContainer.appendChild(clone);
          emoji.style.display = 'none';
        });
      } else {
        // Show original emojis on desktop
        footerEmojis.forEach(emoji => {
          // Восстанавливаем текст эмодзи, если он был изменен
          let emojiType = '';
          if (emoji.classList.contains('footer__emoji--sleeping')) {
            emojiType = 'sleeping';
          } else if (emoji.classList.contains('footer__emoji--eating')) {
            emojiType = 'eating';
          } else if (emoji.classList.contains('footer__emoji--happy')) {
            emojiType = 'happy';
          } else if (emoji.classList.contains('footer__emoji--cool')) {
            emojiType = 'cool';
          }
          
          if (emojiType && initialEmojis[emojiType] && (!emoji.textContent || emoji.textContent.trim() === '')) {
            emoji.textContent = initialEmojis[emojiType];
          }
          
          emoji.style.display = 'block';
        });
        
        emojiContainer.innerHTML = '';
      }
    };
    
    // Run on load and resize with debounce for better performance
    checkScreenSize();
    
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScreenSize, 150);
    });
  }

  // Footer emoji click interaction
  function setupFooterEmojiInteraction() {
    // Emoji click interaction disabled
    // Function left empty to prevent emoji changes on click
  }
  document.querySelector('input[type="tel"]').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D+/g, "");
  });
  // Modal functionality
  function setupModalWindow() {
    const modal = document.getElementById('applicationModal');
    const modalContent = modal.querySelector('.modal__content');
    const closeButton = modal.querySelector('.modal__close');
    const form = document.getElementById('applicationForm');
    const formElements = form.querySelector('.modal__form');
    const successMessage = modal.querySelector('.modal__success');
    
    // Кнопки для открытия модального окна
    const applyButtons = document.querySelectorAll('[href="#apply"]');
    const tourButtons = document.querySelectorAll('[href="#tour"]');
    
    // Настройка маски для телефона
    const phoneInput = document.getElementById('phoneInput');
    
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
          if (value[0] === '7' || value[0] === '8') {
            value = value.substring(1);
          }
          
          let formattedValue = '+7';
          
          if (value.length > 0) {
            formattedValue += ' (' + value.substring(0, 3);
          }
          
          if (value.length > 3) {
            formattedValue += ') ' + value.substring(3, 6);
          }
          
          if (value.length > 6) {
            formattedValue += '-' + value.substring(6, 8);
          }
          
          if (value.length > 8) {
            formattedValue += '-' + value.substring(8, 10);
          }
          
          e.target.value = formattedValue;
        }
      });
    }
    
    // Открытие модального окна
    function openModal(type) {
      document.body.classList.add('no-scroll');
      modal.classList.add('active');
      
    }
    
    // Закрытие модального окна
    function closeModal() {
      document.body.classList.remove('no-scroll');
      modal.classList.remove('active');
      setTimeout(() => {
        form.reset();
        successMessage.style.display = 'none';
        formElements.style.display = 'flex';
      }, 300);
    }
    function successMessagee() {
      modalContent.style.display = 'none';
      successMessage.style.display = 'block';
    }
    // Обработчики событий для кнопок
    applyButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('apply');
      });
    });
    
    tourButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('tour');
      });
    });
    
    // Закрытие по клику на крестик
    closeButton.addEventListener('click', closeModal);
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Предотвращение закрытия при клике на контент
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const formDataObj = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      try {
        // Определяем базовый URL в зависимости от окружения
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? `http://${window.location.hostname}:3000` // Локальный сервер
          : ''; // Если на продакшене, используем относительный URL
        
        // Показываем индикатор загрузки
        const submitButton = form.querySelector('.modal__submit');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Отправка...';
        submitButton.disabled = true;
        
        // Отправка данных на сервер
        const response = await fetch(`${baseUrl}/api/submit-application`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataObj)
        });
        
        // Возвращаем кнопку в исходное состояние
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        if (response.ok) {
          // Показываем сообщение об успехе
      
          successMessagee()
          
          // Закрываем модальное окно через 3 секунды
          setTimeout(closeModal, 3000);
        } else {
          console.error('Ошибка при отправке формы:');
          alert( 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
        }
      } catch (error) {
        console.error('Ошибка отправки данных:', error);
        alert('Не удалось отправить заявку. Пожалуйста, проверьте соединение с интернетом и попробуйте еще раз.', error);
      }
    });
  }

  // Copy to clipboard and toast functionality
  const setupCopyToClipboard = () => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    // Function to show toast
    const showToast = (message) => {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2000);
    };

    // Function to copy text to clipboard
    const copyToClipboard = async (text, successMessage) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage);
      } catch (err) {
        showToast('Не удалось скопировать');
      }
    };

    // Setup phone copy
    const phoneLink = document.querySelector('.footer__phone-link');
    if (phoneLink) {
      phoneLink.addEventListener('click', (e) => {
        e.preventDefault();
        const phoneNumber = phoneLink.textContent.trim();
        copyToClipboard(phoneNumber, 'Номер скопирован');
      });
    }

    // Setup address copy
    const address = document.querySelector('.footer__address');
    if (address) {
      address.addEventListener('click', () => {
        const addressText = address.textContent.trim();
        copyToClipboard(addressText, 'Адрес скопирован');
      });
    }
  };

  // Initialize all functionality
  setupHeaderScroll();
  setupMobileMenu();
  setupSmoothScroll();
  setupGallerySlider();
  setupTeachersSlider();
  setupGalleryPopup();
  setupTeachersPopup();
  setupScrollAnimations();
  // setupEmojiAnimations(); // Disabled emoji animations
  
  // Initialize footer emoji layout
  handleFooterEmojiLayout();
  
  // Initialize footer emoji interaction
  // setupFooterEmojiInteraction(); // Disabled emoji interactions
  
  // Initialize modal window
  setupModalWindow();
  
  // Initialize parallax effects
  setupParallaxEffects();

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

  // Initialize parallax effects
  function setupParallaxEffects() {
    const missionSection = document.querySelector('.mission');
    const missionTitle = document.querySelector('.mission__title');
    const missionDescription = document.querySelector('.mission__description');

    if (!missionSection || !missionTitle || !missionDescription) return;

    // Add parallax class to elements
    missionTitle.classList.add('mission__parallax');
    missionDescription.classList.add('mission__parallax');

    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const sectionTop = missionSection.offsetTop;
          const sectionHeight = missionSection.offsetHeight;
          const windowHeight = window.innerHeight;
          
          // Start parallax only after the section is fully visible
          if (scrolled >= sectionTop && scrolled <= sectionTop + sectionHeight - 700) {
            const startPoint = sectionTop;
            const relativeScroll = (scrolled - startPoint) * 0.15;
            
            missionTitle.style.transform = `translateY(${relativeScroll * 7}px)`;
            missionDescription.style.transform = `translateY(${relativeScroll * 7}px)`;
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }

  // Initialize copy to clipboard functionality
  setupCopyToClipboard();
}); 

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация бесконечной прокрутки для team__photos
  const container = document.querySelector('.team__photos');
  if (!container) return;

  // Создаем обертку для фотографий
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.gap = '20px';
  wrapper.style.transition = 'none'; // Убираем transition для более плавной анимации
  
  // Перемещаем все фотографии в обертку
  const photos = Array.from(container.children);
  photos.forEach(photo => wrapper.appendChild(photo));
  
  // Клонируем фотографии для бесконечной прокрутки (создаем два набора)
  photos.forEach(photo => {
    const clone = photo.cloneNode(true);
    wrapper.appendChild(clone);
  });
  
  // Добавляем обертку в контейнер
  container.appendChild(wrapper);
  
  // Устанавливаем начальные стили для контейнера
  container.style.overflowX = 'hidden';
  
  let scrollPosition = 0;
  const speed = 0.5; // Уменьшаем скорость для более плавного эффекта
  let animationFrameId = null;
  let isPaused = false;
  let firstSetWidth = 0;

  // Вычисляем ширину одного набора фотографий после загрузки всех изображений
  Promise.all(Array.from(container.getElementsByTagName('img'))
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => {
      img.onload = img.onerror = resolve;
    })))
    .then(() => {
      firstSetWidth = photos.reduce((width, photo) => {
        return width + photo.offsetWidth + 20; // 20px - это gap
      }, 0);
      
      // Запускаем анимацию только после загрузки всех изображений
      animate();
    });

  function animate() {
    if (!isPaused) {
      scrollPosition -= speed;
      
      // Если прокрутили на ширину первого набора фотографий, начинаем сначала
      if (Math.abs(scrollPosition) >= firstSetWidth) {
        scrollPosition = 0;
      }

      wrapper.style.transform = `translateX(${scrollPosition}px)`;
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  // Обработчики событий для паузы при наведении
  container.addEventListener('mouseenter', () => {
    isPaused = true;
  });

  container.addEventListener('mouseleave', () => {
    isPaused = false;
  });

  // Обработчик изменения размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      firstSetWidth = photos.reduce((width, photo) => {
        return width + photo.offsetWidth + 20;
      }, 0);
      
      // Сбрасываем позицию прокрутки при изменении размера окна
      scrollPosition = 0;
      wrapper.style.transform = `translateX(${scrollPosition}px)`;
    }, 250);
  });

  // Очистка при размонтировании
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}); 