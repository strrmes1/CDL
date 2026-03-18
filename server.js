const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring'); // для form-urlencoded

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // для парсинга form-urlencoded

// Эндпоинт для активации
app.post('/api/activate', async (req, res) => {
  const { uniqueCode, sessionData, notes = '' } = req.body;

  if (!uniqueCode || !sessionData) {
    return res.status(400).json({ 
      error: 'uniqueCode и sessionData обязательны' 
    });
  }

  try {
    // ТОЧНАЯ КОПИЯ запроса из post.txt
    const autosubResponse = await axios.post(
      'https://autosubai.com/submit',
      querystring.stringify({
        uniqueCode: uniqueCode,    // ← CDK ключ пользователя
        sessionData: sessionData,  // ← Session Data пользователя
        notes: notes || ''
      }),
      {
        headers: {
          // ТОЧНАЯ КОПИЯ заголовков из post.txt
          'accept': '*/*',
          'accept-language': 'en-GB,en;q=0.9,ru-RU;q=0.8,ru;q=0.7,es-ES;q=0.6,es;q=0.5,en-US;q=0.4',
          'content-type': 'application/x-www-form-urlencoded',
          'hx-current-url': 'https://autosubai.com/',
          'hx-request': 'true',
          'hx-target': 'result',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'Referer': 'https://autosubai.com/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    // Успех — возвращаем ответ от autosubai
    res.status(200).json({
      success: true,
      status: autosubResponse.status,
      data: autosubResponse.data
    });

  } catch (error) {
    console.error('Autosubai error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error || 'Ошибка активации',
      details: error.response?.data || null
    });
  }
});

// Тестовый эндпоинт
app.get('/', (req, res) => {
  res.json({ message: 'Сервер готов к активациям' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log('📋 Для фронтенда используйте POST /api/activate с полями: uniqueCode, sessionData');
});
