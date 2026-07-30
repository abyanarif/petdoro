// api/bot.js - Vercel Serverless Function for Petdoro Telegram Bot

module.exports = async (req, res) => {
    // Enable CORS & set JSON response header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'online',
            bot: 'PetdoroBot',
            app_url: 'https://petdoro.vercel.app'
        });
    }

    if (req.method === 'POST') {
        try {
            const body = req.body || {};
            const message = body.message || body.edited_message;

            if (!message) {
                return res.status(200).json({ status: 'ignored', reason: 'No message object' });
            }

            const chatId = message.chat?.id;
            const text = message.text || '';

            // Handle /start command or default initial message
            if (text.startsWith('/start') || text.startsWith('/help') || text) {
                const responsePayload = {
                    method: 'sendMessage',
                    chat_id: chatId,
                    text: '👋 Halo! Selamat datang di PetdoroBot! Selesaikan sesi fokusmu untuk merawat dan menaikkan level hewan peliharaan favoritmu. Klik tombol di bawah untuk membuka aplikasi! 🍅✨',
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '🚀 Buka Petdoro App',
                                    web_app: { url: 'https://petdoro.vercel.app' }
                                }
                            ]
                        ]
                    }
                };

                // If TELEGRAM_BOT_TOKEN environment variable is set in Vercel, also call fetch API
                const botToken = process.env.TELEGRAM_BOT_TOKEN;
                if (botToken) {
                    try {
                        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: responsePayload.text,
                                parse_mode: 'HTML',
                                reply_markup: responsePayload.reply_markup
                            })
                        });
                    } catch (err) {
                        console.error('[PetdoroBot] Error calling Telegram Bot API:', err);
                    }
                }

                // Return direct webhook response payload
                return res.status(200).json(responsePayload);
            }

            return res.status(200).json({ status: 'ok' });
        } catch (error) {
            console.error('[PetdoroBot] Webhook error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
