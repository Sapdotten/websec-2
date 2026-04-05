const express = require('express');
require('dotenv').config();

const { loadAllStations, searchStations } = require('./stations-cache');
const { fetchYandexJson } = require('./yandex-fetch');
const { calculateDistanceKm } = require('./geo-utils');

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.YANDEX_API_KEY;

if (!API_KEY) {
    console.error('YANDEX_API_KEY не задан в .env');
    process.exit(1);
}

if (!process.env.YANDEX_RASP_BASE?.trim()) {
    console.error('YANDEX_RASP_BASE не задан в .env');
    process.exit(1);
}

const ttlParsed = parseInt(process.env.STATIONS_CACHE_TTL_MS, 10);
if (!Number.isFinite(ttlParsed) || ttlParsed <= 0) {
    console.error('STATIONS_CACHE_TTL_MS должен быть положительным числом (миллисекунды) в .env');
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
                distance: calculateDistanceKm(userLat, userLon, s.latitude, s.longitude)
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

        const data = await fetchYandexJson('schedule/', params);
        res.json(data);
    } catch (error) {
        console.error('Schedule error:', error.responseData || error.message);
        res.status(500).json({
            error: error.responseData?.error?.message || error.message
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

        const data = await fetchYandexJson('search/', params);
        res.json(data);
    } catch (error) {
        console.error('Route error:', error.responseData || error.message);
        res.status(500).json({
            error: error.responseData?.error?.message || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}`);
});
