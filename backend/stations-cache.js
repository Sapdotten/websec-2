const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'stations-cache.json');
let stationsCache = null;

async function loadAllStations(apikey) {
  if (stationsCache) return stationsCache;

  try {
    const fileData = await fs.readFile(CACHE_FILE, 'utf8');
    stationsCache = JSON.parse(fileData);
    return stationsCache;
  } catch (err) {
  }

  try {
    const response = await axios.get('https://api.rasp.yandex.net/v3.0/stations_list/', {
      params: { apikey, lang: 'ru_RU', format: 'json' },
      timeout: 180000
    });

    stationsCache = [];
    let total = 0, filtered = 0;

    if (response.data.countries) {
      for (const country of response.data.countries) {
        if (country.regions) {
          for (const region of country.regions) {
            if (region.settlements) {
              for (const settlement of region.settlements) {
                if (settlement.stations) {
                  for (const station of settlement.stations) {
                    total++;

                    const code = station.codes?.yandex_code;
                    const hasCoords = station.latitude && station.longitude;
                    const isRailway = Boolean(code) && hasCoords;

                    if (isRailway) {
                      filtered++;
                      stationsCache.push({
                        title: station.title,
                        code,
                        settlement: settlement.title || '',
                        region: region.title || '',
                        country: country.title || '',
                        latitude: station.latitude,
                        longitude: station.longitude,
                        direction: station.direction || '',
                        transport: station.transport_type
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (stationsCache.length > 0) {
      await fs.writeFile(CACHE_FILE, JSON.stringify(stationsCache));
    }

    return stationsCache;
  } catch (error) {
    console.error('Ошибка:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data).slice(0, 200));
    }
    throw error;
  }
}

function searchStations(query, limit = 20) {
  if (!stationsCache) return [];

  let results;

  if (!query?.trim()) {
    results = stationsCache.filter(s => s.latitude && s.longitude);
  } else {
    const q = query.toLowerCase().trim();
    results = stationsCache.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.settlement?.toLowerCase().includes(q) ||
      s.region?.toLowerCase().includes(q)
    ).filter(s => s.latitude && s.longitude);
  }

  return results
    .slice(0, limit);
}
function getStationByCode(code) {
  if (!stationsCache) return null;
  return stationsCache.find(s => s.code === code);
}

module.exports = { loadAllStations, searchStations, getStationByCode };