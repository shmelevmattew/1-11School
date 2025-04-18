const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));


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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
