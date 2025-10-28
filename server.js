require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

console.log("✅ server.js запущен!");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public')); // подключаем фронтенд

(async () => {
  // импортируем translate внутри async функции
  const { translate } = await import('@vitalets/google-translate-api');

  io.on('connection', (socket) => {
    console.log('🟢 Новый пользователь подключился:', socket.id);

    socket.on('chat message', async (msg) => {
      console.log('💬 Получено сообщение:', msg);

      try {
        // переводим сообщение
        const translation = await translate(msg, { to: 'ru' });
        const translated = translation.text;

        // отправляем оригинал и перевод
        io.emit('chat message', `💭 ${msg}\n🌐 Перевод: ${translated}`);
      } catch (err) {
        console.error('❌ Ошибка перевода:', err.message);
        io.emit('chat message', '❌ Ошибка перевода.');
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Пользователь отключился:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
})();
