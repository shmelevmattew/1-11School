const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_CONTENT_PATH = path.join(__dirname, 'data', 'site-content.json');
const GALLERY_UPLOADS_DIR = path.join(__dirname, '..', 'src', 'images', 'gallery-admin');
const EDITABLE_FIELDS = [
  'heroTitleHtml',
  'heroInfoLine1',
  'heroInfoLine2',
  'ctaPrimaryText',
  'ctaSecondaryText',
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
  'pricingDiscountDescriptionHtml'
];
const DEFAULT_SITE_CONTENT = {
  heroTitleHtml: 'Школа полного  <br> цикла 1–11 классы',
  heroInfoLine1: 'Открыт набор на 2025–2026 учебный год.',
  heroInfoLine2: 'Количество мест ограничено',
  ctaPrimaryText: 'Записаться на экскурсию',
  ctaSecondaryText: 'Написать нам',
  footerTitleHtml: 'Звоните, если <br>остались вопросы',
  footerPhoneText: '+7 812 407 12 22',
  footerPhoneHref: 'tel:+78124071222',
  footerAddressLine1Html: 'п. Кузьмоловский, ЖК «Небо», ул.&nbsp;Светлая, д.&nbsp;1',
  footerAddressLine2: 'info@school1-11.ru',
  pricingMainTitle: 'Школьный абонемент полного дня',
  pricingMainPrice: '900 000 ₽',
  pricingMainPeriod: 'за учебный год',
  pricingMainDescriptionHtml: 'Ваш ребенок будет находиться в&nbsp;школе с&nbsp;понедельника по&nbsp;пятницу в&nbsp;течение всего учебного года (сентябрь — май).',
  pricingDiscountTitle: 'Семейная скидка 10%',
  pricingDiscountDescriptionHtml: 'если в&nbsp;школе учатся двое и&nbsp;более детей',
  galleryImages: [
    'src/images/gallery1.webp',
    'src/images/gallery3.webp',
    'src/images/gallery4.webp',
    'src/images/gallery5.webp',
    'src/images/gallery12.webp',
    'src/images/gallery14.webp',
    'src/images/gallery15.webp',
    'src/images/gallery16.webp'
  ]
};

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fsSync.mkdirSync(GALLERY_UPLOADS_DIR, { recursive: true });
    cb(null, GALLERY_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const safeExtension = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension) ? extension : '.jpg';
    cb(null, `gallery-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExtension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error('Поддерживаются только JPG, PNG и WEBP'));
      return;
    }
    cb(null, true);
  }
});

async function ensureSiteContentFile() {
  try {
    await fs.access(SITE_CONTENT_PATH);
  } catch (error) {
    await fs.mkdir(path.dirname(SITE_CONTENT_PATH), { recursive: true });
    await fs.writeFile(SITE_CONTENT_PATH, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf8');
  }
}

async function readSiteContent() {
  await ensureSiteContentFile();
  const rawContent = await fs.readFile(SITE_CONTENT_PATH, 'utf8');
  const parsedContent = JSON.parse(rawContent);
  return { ...DEFAULT_SITE_CONTENT, ...parsedContent };
}

async function writeSiteContent(content) {
  await fs.mkdir(path.dirname(SITE_CONTENT_PATH), { recursive: true });
  await fs.writeFile(SITE_CONTENT_PATH, JSON.stringify(content, null, 2), 'utf8');
}

function buildValidatedContent(inputContent) {
  const validatedContent = {};
  for (const key of EDITABLE_FIELDS) {
    const value = inputContent[key];
    validatedContent[key] = typeof value === 'string' ? value.trim() : DEFAULT_SITE_CONTENT[key];
  }

  const incomingGallery = inputContent.galleryImages;
  if (Array.isArray(incomingGallery)) {
    validatedContent.galleryImages = incomingGallery
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.startsWith('src/images/'))
      .slice(0, 60);
  } else {
    validatedContent.galleryImages = DEFAULT_SITE_CONTENT.galleryImages;
  }

  return validatedContent;
}

function extractAdminPassword(req) {
  const authHeader = req.headers.authorization || '';
  const tokenFromBearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  const tokenFromHeader = typeof req.headers['x-admin-password'] === 'string' ? req.headers['x-admin-password'] : '';
  return tokenFromBearer || tokenFromHeader;
}

function requireAdminAuth(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(503).json({
      success: false,
      error: 'ADMIN_PASSWORD не настроен на сервере'
    });
  }

  const providedPassword = extractAdminPassword(req);
  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({
      success: false,
      error: 'Неверный пароль администратора'
    });
  }

  next();
}

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS ? process.env.TELEGRAM_CHAT_IDS.split(',') : [];

if (!TELEGRAM_TOKEN || TELEGRAM_TOKEN === 'your_telegram_bot_token') {
  console.warn('⚠️ TELEGRAM_TOKEN не настроен или имеет значение по умолчанию. Отправка в Telegram будет отключена.');
}

if (TELEGRAM_CHAT_IDS.length === 0) {
  console.warn('⚠️ TELEGRAM_CHAT_IDS не настроены. Отправка в Telegram будет отключена.');
}

const bot = TELEGRAM_TOKEN && TELEGRAM_TOKEN !== 'your_telegram_bot_token'
  ? new TelegramBot(TELEGRAM_TOKEN, { polling: false })
  : null;

app.get('/api/site-content', async (req, res) => {
  try {
    const content = await readSiteContent();
    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error('Ошибка чтения контента сайта:', error);
    res.status(500).json({ success: false, error: 'Не удалось загрузить контент сайта' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.body && typeof req.body.password === 'string' ? req.body.password : '';

  if (!adminPassword) {
    return res.status(503).json({ success: false, error: 'ADMIN_PASSWORD не настроен на сервере' });
  }

  if (!providedPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ success: false, error: 'Неверный пароль' });
  }

  res.status(200).json({ success: true });
});

app.put('/api/admin/site-content', requireAdminAuth, async (req, res) => {
  try {
    const incomingContent = req.body && typeof req.body === 'object' ? req.body : {};
    const validatedContent = buildValidatedContent(incomingContent);
    await writeSiteContent(validatedContent);
    res.status(200).json({ success: true, content: validatedContent });
  } catch (error) {
    console.error('Ошибка сохранения контента сайта:', error);
    res.status(500).json({ success: false, error: 'Не удалось сохранить контент сайта' });
  }
});

app.post('/api/admin/gallery-upload', requireAdminAuth, (req, res) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, error: error.message || 'Ошибка загрузки файла' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Файл не был передан' });
    }

    const imagePath = `src/images/gallery-admin/${req.file.filename}`;
    res.status(200).json({ success: true, imagePath });
  });
});

app.post('/api/submit-application', async (req, res) => {
  console.log('Получен запрос на отправку заявки:', req.body);

  try {
    const { name, phone, message } = req.body;

    if (!name || !phone) {
      console.log('Ошибка: отсутствуют обязательные поля');
      return res.status(400).json({ success: false, error: 'Имя и телефон обязательны' });
    }

    const telegramMessage =
      `📝 *Новая заявка с сайта "Школа 1-11"*\n\n` +
      `👤 *Имя:* ${name}\n` +
      `📱 *Телефон:* ${phone}\n` +
      `💬 *Сообщение:* ${message || 'Не указано'}`;

    console.log('Отправка сообщения в Telegram...');

    try {
      if (bot && TELEGRAM_CHAT_IDS.length > 0) {
        // Отправка сообщения всем пользователям
        for (let chatId of TELEGRAM_CHAT_IDS) {
          await bot.sendMessage(chatId, telegramMessage, { parse_mode: 'Markdown' });
        }
        console.log('Сообщение успешно отправлено в Telegram всем пользователям');
      } else {
        console.log('Отправка в Telegram отключена');
      }

      res.status(200).json({ success: true });
    } catch (telegramError) {
      console.error('Ошибка при отправке сообщения в Telegram:', telegramError);
      res.status(500).json({
        success: false,
        error: 'Ошибка при отправке сообщения в Telegram',
        details: telegramError.message
      });
    }
  } catch (error) {
    console.error('Общая ошибка при обработке заявки:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      details: error.message
    });
  }
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
