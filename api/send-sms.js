export default async function handler(req, res) {
    // Only POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let { phone, code } = req.body || {};
    if (!phone || !code) {
        return res.status(400).json({ error: 'Phone and code are required' });
    }

    // Sanitise phone: remove all non-digit characters
    phone = phone.replace(/\D/g, '');
    if (phone.length < 8) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Log the request (visible in Vercel Function Logs)
    console.log(`Sending SMS to ${phone} with code ${code}`);

    try {
        const response = await fetch(
            'https://cpaas.messagecentral.com/api/v2/message/send',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'customerId': process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
                    'authToken': process.env.MESSAGE_CENTRAL_AUTH_TOKEN,
                },
                body: JSON.stringify({
                    countryCode: 'TN',
                    mobileNumber: phone,                           // only digits
                    messageText: `Votre code de verification Kartoucha : ${code}`,
                    messageType: 'SMS',
                    senderId: 'KRTCH',                             // must be approved in MC dashboard
                }),
            }
        );

        const text = await response.text();
        console.log('Message Central raw response:', text);

        // If the response is HTML, the request failed
        if (text.startsWith('<html') || text.startsWith('<HTML')) {
            return res.status(502).json({
                error: 'SMS provider returned HTML',
                detail: text.substring(0, 200),
            });
        }

        // Try to parse as JSON
        try {
            const result = JSON.parse(text);
            return res.status(200).json(result);
        } catch (e) {
            return res.status(502).json({
                error: 'Invalid JSON from SMS provider',
                detail: text,
            });
        }
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ error: error.message });
    }
}