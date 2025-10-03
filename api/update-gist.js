// Файл: api/update-gist.js

// Необходим, так как вы используете fetch в Serverless Functions
import fetch from 'node-fetch'; 

// Ваш Gist ID
const GIST_ID = 'd69178844555b679725326d4174f0b7a'; 
const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;

// --- Функция для настройки CORS ---
// Решает проблему 405 Method Not Allowed
const setCorsHeaders = (res) => {
    // Установите здесь ваш домен Vercel вместо '*' для максимальной безопасности,
    // но '*' позволит вашему фронтенду работать без проблем.
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    // Разрешаем методы POST и OPTIONS (для preflight-запроса)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    // Разрешаем заголовки, необходимые для JSON-запроса с токеном
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
};

// --- Основной обработчик Vercel Serverless Function ---
export default async function handler(req, res) {
    
    // 1. Устанавливаем заголовки CORS для всех ответов
    setCorsHeaders(res); 

    // 2. Обработка CORS Preflight запроса (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Возвращаем 200 OK и завершаем
    }

    // 3. Проверка метода (должен быть POST)
    if (req.method !== 'POST') {
        return res.status(405).send('Метод не разрешен');
    }
    
    // 4. Получаем токен из переменной окружения Vercel
    const GIST_TOKEN = process.env.GITHUB_GIST_TOKEN; 

    if (!GIST_TOKEN) {
        return res.status(500).send('Сервер: Токен GitHub не настроен.');
    }

    try {
        // Vercel автоматически разбирает JSON: req.body содержит объект
        const { categories, messages } = req.body; 

        const payload = {
            description: "Обновление шаблонов сообщений (через прокси)",
            files: {
                "categories.json": { content: JSON.stringify(categories, null, 2) },
                "messages.json": { content: JSON.stringify(messages, null, 2) }
            }
        };

        // 5. Отправка запроса в GitHub API
        const response = await fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                // Здесь используется СКРЫТЫЙ токен
                'Authorization': `token ${GIST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 6. Обработка ответа
        if (response.ok) {
            // Ответ отправляется через res.status().json()
            return res.status(200).json({ message: "Данные успешно сохранены." });
        } else {
            // Если GitHub отклонил запрос (например, 401 Unauthorized)
            const errorDetails = await response.text();
            return res.status(response.status).json({
                error: "Ошибка GitHub API",
                details: errorDetails
            });
        }

    } catch (error) {
        console.error('Ошибка функции:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
}
