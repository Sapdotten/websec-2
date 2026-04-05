const fs = require('fs').promises;
const path = require('path');
const { fetchYandexJson } = require('./yandex-fetch');

const CACHE_FILE = path.join(__dirname, 'stations-cache.json');

let stationsCache = null;

function getCacheTtlMs() {
  return parseInt(process.env.STATIONS_CACHE_TTL_MS, 10);
}

function parseCacheFile(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (Array.isArray(parsed)) {
    return { fetchedAt: 0, stations: parsed };
  }
  if (parsed && Array.isArray(parsed.stations)) {
    const t = Date.parse(parsed.fetchedAt);
    return {
      fetchedAt: Number.isFinite(t) ? t : 0,
      stations: parsed.stations,
    };
  }
  return null;
}

const NON_RAIL_TRANSPORT = new Set([
  'plane',
  'bus',
  'water',
  'helicopter',
  'Самолёт',
  'Автобус',
  'Водный',
  'Вертолёт',
]);

function isRailwayStationForCache(station) {
  const code = station.codes?.yandex_code;
  const lat = Number(station.latitude);
  const lon = Number(station.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  if (!code || !hasCoords) return false;

  const t = station.transport_type;
  if (t == null || t === '') return true;
  if (NON_RAIL_TRANSPORT.has(t)) return false;

  return true;
}

async function loadAllStations(apikey) {
  if (stationsCache) return stationsCache;

  const ttlMs = getCacheTtlMs();

  try {
    const fileData = await fs.readFile(CACHE_FILE, 'utf8');
    const parsed = parseCacheFile(fileData);
    if (parsed && parsed.stations.length > 0) {
      const age = Date.now() - parsed.fetchedAt;
      if (parsed.fetchedAt > 0 && age <= ttlMs) {
        stationsCache = parsed.stations;
        return stationsCache;
      }
    }
  } catch (err) {
  }

  try {
    const data = await fetchYandexJson('stations_list/', {
      apikey,
      lang: 'ru_RU',
      format: 'json',
    });

    stationsCache = [];

    if (data.countries) {
      for (const country of data.countries) {
        if (country.regions) {
          for (const region of country.regions) {
            if (region.settlements) {
              for (const settlement of region.settlements) {
                if (settlement.stations) {
                  for (const station of settlement.stations) {
                    if (!isRailwayStationForCache(station)) continue;

                    stationsCache.push({
                      title: station.title,
                      code: station.codes.yandex_code,
                      settlement: settlement.title || '',
                      region: region.title || '',
                      country: country.title || '',
                      latitude: station.latitude,
                      longitude: station.longitude,
                      direction: station.direction || '',
                      transport: station.transport_type,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    if (stationsCache.length > 0) {
      const payload = {
        fetchedAt: new Date().toISOString(),
        stations: stationsCache,
      };
      await fs.writeFile(CACHE_FILE, JSON.stringify(payload));
    }

    return stationsCache;
  } catch (error) {
    console.error('Ошибка:', error.message);
    if (error.status) {
      console.error('Status:', error.status);
    }
    if (error.responseData) {
      console.error('Data:', JSON.stringify(error.responseData).slice(0, 200));
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
