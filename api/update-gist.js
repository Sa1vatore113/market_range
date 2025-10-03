export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обрабатываем preflight запрос
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { categories, messages } = req.body;
        const GIST_ID = 'd69178844555b679725326d4174f0b7a';
        
        // Используем токен из переменных окружения Vercel
        const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;

        if (!GITHUB_TOKEN) {
            throw new Error('GITHUB_GIST_TOKEN not configured');
        }

        // Обновляем оба файла в Gist
        const files = {
            'categories.json': {
                content: JSON.stringify(categories, null, 2)
            },
            'messages.json': {
                content: JSON.stringify(messages, null, 2)
            }
        };

        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: files,
                description: 'Updated message templates'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Error updating gist:', error);
        return res.status(500).json({ 
            error: 'Failed to update gist',
            details: error.message 
        });
    }
}
