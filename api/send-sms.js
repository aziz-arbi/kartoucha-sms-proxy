export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, code } = req.body || {};
    if (!phone || !code) {
        return res.status(400).json({ error: 'Phone and code are required' });
    }

    try {
        const response = await fetch(
            'https://cpaas.messagecentral.com/api/v2/message/send',  // correct base URL
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'customerId': 'C-51288F77D72D4E9',   // ← your real Customer ID
                    'authToken': 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTUxMjg4Rjc3RDcyRDRFOSIsImlhdCI6MTc3ODg3ODQyOSwiZXhwIjoxOTM2NTU4NDI5fQ.HrjpD7XrW9BnQgxocaGCaLNedgqxyIf1HqofD6Yi8YB6EF3PcifLHPJoqZIJZ50kBhyBBIUEQ_fiBPLIpOUR0Q', // ← your real Auth Token
                },
                body: JSON.stringify({
                    countryCode: 'TN',          // Tunisia
                    mobileNumber: phone,        // just the number, no country code
                    messageText: `Votre code de verification Kartoucha : ${code}`,
                    messageType: 'SMS',
                    senderId: 'KRTCH',          // your sender ID
                }),
            }
        );
        const result = await response.json();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}