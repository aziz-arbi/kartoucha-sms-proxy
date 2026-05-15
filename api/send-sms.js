// api/send-sms.js
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, code } = req.body || {};
    if (!phone || !code) {
        return res.status(400).json({ error: 'Phone and code are required' });
    }

    try {
        const response = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '+216' + phone,    // Tunisian code
                message: `Votre code de verification Kartoucha : ${code}`,
                key: 'textbelt',          // free key – 1 SMS/day
            }),
        });
        const result = await response.json();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}