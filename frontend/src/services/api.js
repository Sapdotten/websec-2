const API_BASE = String(import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')

async function requestJSON(path, errorText) {
    if (!API_BASE) {
        console.error('[api] Задайте VITE_API_BASE в frontend/.env, например http://localhost:3001/api')
        throw new Error('VITE_API_BASE не задан')
    }

    const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            let body = ''
            try {
                body = await response.text()
            } catch (readErr) {
                console.error('[api] не удалось прочитать тело ответа:', readErr)
            }
            console.error('[api]', errorText, response.status, response.statusText, body)
            throw new Error(errorText)
        }
        return response.json()
    } catch (err) {
        if (err instanceof Error && err.message === errorText) {
            throw err
        }
        console.error('[api]', errorText, err)
        throw err
    }
}

export async function searchStations(query, lat = null, lon = null, limit = undefined) {
    const params = new URLSearchParams()
    if (query) {
        params.set('query', query)
    }
    if (lat != null && lon != null) {
        params.append('lat', lat)
        params.append('lon', lon)
    }
    if (limit != null) {
        params.append('limit', String(limit))
    }

    const data = await requestJSON(`/search?${params}`, 'Ошибка поиска станций')
    return data.stations || []
}

export async function getStationSchedule(stationCode, date = null) {
    const params = new URLSearchParams({
        station: stationCode,
        transport_types: 'suburban',
    })

    if (date) params.append('date', date)

    return requestJSON(`/schedule/station?${params}`, 'Ошибка расписания станции')
}

export async function getRouteSchedule(from, to, date = null) {
    const params = new URLSearchParams({
        from,
        to,
        transport_types: 'suburban',
    })

    if (date) params.append('date', date)

    return requestJSON(`/schedule/route?${params}`, 'Ошибка расписания маршрута')
}
