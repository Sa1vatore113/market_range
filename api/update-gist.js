// Файл: functions/update-gist.js

// Токен будет взят из переменной окружения Netlify (process.env.GITHUB_TOKEN)
const GIST_ID = 'd69178844555b679725326d4174f0b7a'; 
const GIST_URL = `https://api.github.com/gists/${GIST_ID}`;

// Главный обработчик, который вызывается браузером
exports.handler = async (event) => {
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Метод не разрешен' };
    }

    const GIST_TOKEN = process.env.GITHUB_TOKEN;

    if (!GIST_TOKEN) {
        return { statusCode: 500, body: 'Сервер: Токен GitHub не настроен.' };
    }

    try {
        // Получаем данные, которые пришли от клиента (categories и messages)
        const { categories, messages } = JSON.parse(event.body);

        const payload = {
            description: "Обновление шаблонов сообщений (через прокси)",
            files: {
                "categories.json": { content: JSON.stringify(categories, null, 2) },
                "messages.json": { content: JSON.stringify(messages, null, 2) }
            }
        };

        // ОТПРАВКА ЗАПРОСА В GITHUB API
        const response = await fetch(GIST_URL, {
            method: 'PATCH',
            headers: {
                // Здесь используется СКРЫТЫЙ токен
                'Authorization': `token ${GIST_TOKEN}`, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Данные успешно сохранены." })
            };
        } else {
            // Если GitHub отклонил запрос
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Ошибка GitHub API", details: await response.text() })
            };
        }

    } catch (error) {
        console.error('Ошибка функции:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ошибка сервера' })
        };
    }
};
