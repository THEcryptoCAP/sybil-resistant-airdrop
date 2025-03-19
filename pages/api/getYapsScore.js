import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const response = await axios.get(`https://api.kaito.ai/api/v1/yaps`, {
            params: {
                username: username
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching Yaps score:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Yaps score',
            error: error.response?.data || error.message
        });
    }
}
