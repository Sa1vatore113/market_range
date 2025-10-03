// Файл: api/update-gist.js (новая папка и название)

// *** 1. Переименовать переменную окружения (Рекомендуется) ***
// Мы используем GITHUB_GIST_TOKEN, как договаривались ранее
const GIST_ID = 'd69178844555b679725326d4174f0b7a';
const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;

// *** 2. Обновленный экспорт для Vercel (req и res) ***
export default async function handler(req, res) {

    // В Vercel метод уже находится в req.method
    if (req.method !== 'POST') {
        // Ответ отправляется через res
        return res.status(405).send('Метод не разрешен');
    }

    // *** 3. Используйте новое имя переменной (Если вы его настроили на Vercel) ***
    const GIST_TOKEN = process.env.GITHUB_GIST_TOKEN; // ИЛИ process.env.GITHUB_TOKEN, если вы используете старое имя

    if (!GIST_TOKEN) {
        return res.status(500).send('Сервер: Токен GitHub не настроен.');
    }

    try {
        // В Vercel тело запроса (JSON) уже разобрано и находится в req.body
        const { categories, messages } = req.body;

        const payload = {
            description: "Обновление шаблонов сообщений (через прокси)",
            files: {
                "categories.json": { content: JSON.stringify(categories, null, 2) },
                "messages.json": { content: JSON.stringify(messages, null, 2) }
            }
        };

        // ОТПРАВКА ЗАПРОСА В GITHUB API (Остается без изменений)
        const response = await fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GIST_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Ответ отправляется через res.status().json()
            return res.status(200).json({ message: "Данные успешно сохранены." });
        } else {
            // Если GitHub отклонил запрос
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
