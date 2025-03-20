import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Remove @ symbol if present and trim whitespace
    const cleanUsername = username.replace('@', '').trim();

    try {
        const response = await axios.get(`https://api.kaito.ai/api/v1/yaps`, {
            params: {
                username: cleanUsername
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        // If no data is returned, handle it gracefully
        if (!response.data) {
            return res.status(404).json({
                message: 'No Yaps score found for this username',
                yaps_all: 0,
                yaps_l24h: 0,
                yaps_l7d: 0,
                yaps_l30d: 0
            });
        }

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching Yaps score:', error.response?.data || error.message);
        
        // Handle specific error cases
        if (error.response?.status === 404) {
            return res.status(200).json({
                message: 'User not found',
                yaps_all: 0,
                yaps_l24h: 0,
                yaps_l7d: 0,
                yaps_l30d: 0
            });
        }

        return res.status(error.response?.status || 500).json({
            message: 'Failed to fetch Yaps score',
            error: error.response?.data || error.message
        });
    }
}
