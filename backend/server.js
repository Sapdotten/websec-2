const express = require('express');
const axios = require('axios');
require('dotenv').config();

const { loadAllStations, searchStations } = require('./stations-cache');

const app = express();
const PORT = process.env.PORT || 3001;
const YANDEX_BASE = 'https://api.rasp.yandex.net/v3.0';
const API_KEY = process.env.YANDEX_API_KEY;

if (!API_KEY) {
    console.error('YANDEX_API_KEY не задан в .env');
    process.exit(1);
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

loadAllStations(API_KEY).catch(err => {
    console.error('Не удалось загрузить кэш станций:', err.message);
});

app.get('/api/search', async (req, res) => {
    try {
        const { query, lat, lon, limit } = req.query;

        await loadAllStations(API_KEY);

        const parsedLimit = parseInt(limit, 10);
        const maxResults = Math.min(
            Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20,
            500
        );

        const results = searchStations(query?.trim() || '', maxResults);

        let stations = results;
        if (lat && lon) {
            const userLat = parseFloat(lat);
            const userLon = parseFloat(lon);

            stations = results.map(s => ({
                ...s,
                distance: calculateDistance(userLat, userLon, s.latitude, s.longitude)
            })).sort((a, b) => a.distance - b.distance);
        }

        res.json({ stations });
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/schedule/station', async (req, res) => {
    try {
        const { station, date, direction } = req.query;

        const params = {
            apikey: API_KEY,
            station: station,
            transport_types: 'suburban',
            lang: 'ru_RU'
        };

        if (date) params.date = date;
        if (direction && direction !== 'all') params.direction = direction;

        const response = await axios.get(`${YANDEX_BASE}/schedule/`, { params });
        res.json(response.data);
    } catch (error) {
        console.error('Schedule error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message || error.message
        });
    }
});

app.get('/api/schedule/route', async (req, res) => {
    try {
        const { from, to, date } = req.query;

        const params = {
            apikey: API_KEY,
            from: from,
            to: to,
            transport_types: 'suburban',
            lang: 'ru_RU',
            format: 'json'
        };

        if (date) params.date = date;

        const response = await axios.get(`${YANDEX_BASE}/search/`, { params });

        res.json(response.data);
    } catch (error) {
        console.error('Route error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message || error.message
        });
    }
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

app.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}`);
});
