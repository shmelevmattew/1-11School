document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'siteAdminPassword';
  const fieldNames = [
    'heroTitleHtml',
    'heroInfoLine1',
    'heroInfoLine2',
    'ctaPrimaryText',
    'ctaSecondaryText',
    'featuresSecurityTitleHtml',
    'featuresSecurityText',
    'featuresConceptTitleHtml',
    'featuresConceptTextHtml',
    'missionTitle',
    'missionText1Html',
    'missionText2',
    'missionPoolMessage',
    'missionFeature1Title',
    'missionFeature1TextHtml',
    'missionFeature2Title',
    'missionFeature2TextHtml',
    'missionFeature3Title',
    'missionFeature3TextHtml',
    'missionFeature4Title',
    'missionFeature4TextHtml',
    'missionActionButtonText',
    'promoTitleHtml',
    'promoTextHtml',
    'galleryTitle',
    'benefitsTitle',
    'benefit1Text',
    'benefit2Text',
    'benefit3Text',
    'benefit4Text',
    'benefit5Text',
    'benefit6Text',
    'benefit7Text',
    'benefit8Text',
    'benefit9Text',
    'benefit10Text',
    'benefit11Text',
    'benefit12Text',
    'footerTitleHtml',
    'footerPhoneText',
    'footerPhoneHref',
    'footerAddressLine1Html',
    'footerAddressLine2',
    'pricingMainTitle',
    'pricingMainPrice',
    'pricingMainPeriod',
    'pricingMainDescriptionHtml',
    'pricingDiscountTitle',
    'pricingDiscountDescriptionHtml',
    'pricingPartialTitle',
    'pricingPartialPrice',
    'pricingPartialPeriod',
    'pricingPartialDescriptionHtml',
    'pricingClubTitle',
    'pricingClubPrice',
    'pricingClubPeriod',
    'pricingClubDescriptionHtml',
    'pricingCtaText'
  ];
  let galleryImages = [];

  const authCard = document.getElementById('authCard');
  const editorCard = document.getElementById('editorCard');
  const loginForm = document.getElementById('loginForm');
  const contentForm = document.getElementById('contentForm');
  const galleryUploadInput = document.getElementById('galleryUploadInput');
  const uploadGalleryButton = document.getElementById('uploadGalleryButton');
  const galleryImagesList = document.getElementById('galleryImagesList');
  const logoutButton = document.getElementById('logoutButton');
  const authStatus = document.getElementById('authStatus');
  const saveStatus = document.getElementById('saveStatus');

  const setStatus = (element, message, type) => {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('admin-status--error', 'admin-status--success');
    if (type === 'error') {
      element.classList.add('admin-status--error');
    }
    if (type === 'success') {
      element.classList.add('admin-status--success');
    }
  };

  const setAuthView = (isAuthenticated) => {
    if (!authCard || !editorCard) return;
    authCard.classList.toggle('admin-card--hidden', isAuthenticated);
    editorCard.classList.toggle('admin-card--hidden', !isAuthenticated);
  };

  const getPassword = () => sessionStorage.getItem(STORAGE_KEY) || '';

  const collectFormContent = () => {
    const content = {};
    fieldNames.forEach((name) => {
      const input = document.getElementById(name);
      content[name] = input ? input.value : '';
    });
    content.galleryImages = galleryImages;
    return content;
  };

  const renderGalleryList = () => {
    if (!galleryImagesList) return;
    galleryImagesList.innerHTML = '';

    if (galleryImages.length === 0) {
      galleryImagesList.textContent = 'Фото пока не добавлены.';
      return;
    }

    galleryImages.forEach((imagePath, index) => {
      const item = document.createElement('div');
      item.className = 'admin-gallery-item';

      const preview = document.createElement('img');
      preview.className = 'admin-gallery-preview';
      preview.src = imagePath;
      preview.alt = `Фото ${index + 1}`;

      const path = document.createElement('div');
      path.className = 'admin-gallery-path';
      path.textContent = imagePath;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'admin-button admin-button--ghost';
      removeButton.textContent = 'Удалить';
      removeButton.addEventListener('click', () => {
        galleryImages = galleryImages.filter((_, imageIndex) => imageIndex !== index);
        renderGalleryList();
      });

      item.appendChild(preview);
      item.appendChild(path);
      item.appendChild(removeButton);
      galleryImagesList.appendChild(item);
    });
  };

  const fillFormContent = (content) => {
    fieldNames.forEach((name) => {
      const input = document.getElementById(name);
      if (input && typeof content[name] === 'string') {
        input.value = content[name];
      }
    });
    galleryImages = Array.isArray(content.galleryImages) ? content.galleryImages.filter((item) => typeof item === 'string') : [];
    renderGalleryList();
  };

  const loadContent = async () => {
    const response = await fetch('/api/site-content');
    const result = await response.json();
    if (!response.ok || !result.success || !result.content) {
      throw new Error(result.error || 'Не удалось загрузить контент');
    }
    fillFormContent(result.content);
  };

  const login = async (password) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Ошибка авторизации');
    }
  };

  const uploadGalleryImage = async (file) => {
    const password = getPassword();
    if (!password) {
      throw new Error('Сессия истекла, войдите снова.');
    }

    const payload = new FormData();
    payload.append('image', file);

    const response = await fetch('/api/admin/gallery-upload', {
      method: 'POST',
      headers: {
        'x-admin-password': password
      },
      body: payload
    });

    const result = await response.json();
    if (!response.ok || !result.success || !result.imagePath) {
      throw new Error(result.error || 'Не удалось загрузить фото');
    }

    return result.imagePath;
  };

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!password) {
      setStatus(authStatus, 'Введите пароль.', 'error');
      return;
    }

    try {
      setStatus(authStatus, 'Проверяем пароль...', null);
      await login(password);
      sessionStorage.setItem(STORAGE_KEY, password);
      await loadContent();
      setAuthView(true);
      setStatus(saveStatus, 'Контент загружен.', 'success');
      setStatus(authStatus, '', null);
      if (passwordInput) {
        passwordInput.value = '';
      }
    } catch (error) {
      setStatus(authStatus, error.message, 'error');
    }
  });

  contentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = getPassword();
    if (!password) {
      setStatus(saveStatus, 'Сессия истекла, войдите снова.', 'error');
      setAuthView(false);
      return;
    }

    try {
      setStatus(saveStatus, 'Сохраняем...', null);
      const response = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(collectFormContent())
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Не удалось сохранить данные');
      }

      setStatus(saveStatus, 'Изменения сохранены.', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    }
  });

  uploadGalleryButton.addEventListener('click', async () => {
    if (!galleryUploadInput || !galleryUploadInput.files || galleryUploadInput.files.length === 0) {
      setStatus(saveStatus, 'Выберите хотя бы один файл.', 'error');
      return;
    }

    const files = Array.from(galleryUploadInput.files);

    try {
      setStatus(saveStatus, 'Загружаем фото...', null);
      for (const file of files) {
        const imagePath = await uploadGalleryImage(file);
        galleryImages.push(imagePath);
      }
      renderGalleryList();
      galleryUploadInput.value = '';
      setStatus(saveStatus, 'Фото загружены. Нажмите "Сохранить изменения".', 'success');
    } catch (error) {
      setStatus(saveStatus, error.message, 'error');
    }
  });

  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthView(false);
    setStatus(authStatus, 'Вы вышли из админ-панели.', 'success');
    setStatus(saveStatus, '', null);
    galleryImages = [];
    renderGalleryList();
  });

  (async () => {
    const existingPassword = getPassword();
    if (!existingPassword) {
      setAuthView(false);
      return;
    }

    try {
      await login(existingPassword);
      await loadContent();
      setAuthView(true);
      setStatus(saveStatus, 'Контент загружен.', 'success');
    } catch (error) {
      sessionStorage.removeItem(STORAGE_KEY);
      setAuthView(false);
      setStatus(authStatus, 'Сессия завершена. Войдите снова.', 'error');
    }
  })();
});
