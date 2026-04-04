const API_BASE = '/api'

async function requestJSON(path, errorText) {
    const response = await fetch(`${API_BASE}${path}`)
    if (!response.ok) {
        throw new Error(errorText)
    }
    return response.json()
}

export async function searchStations(query, lat = null, lon = null, limit = undefined) {
    const params = new URLSearchParams()
    if (query != null && query !== '') {
        params.set('query', query)
    }
    if (lat != null && lon != null) {
        params.append('lat', lat)
        params.append('lon', lon)
    }
    if (limit != null) {
        params.append('limit', String(limit))
    }

    const data = await requestJSON(`/search?${params}`, 'Station search error')
    return data.stations || []
}

export async function getStationSchedule(stationCode, date = null) {
    const params = new URLSearchParams({
        station: stationCode,
        transport_types: 'suburban'
    })

    if (date) params.append('date', date)

    return requestJSON(`/schedule/station?${params}`, 'Station schedule error')
}

export async function getRouteSchedule(from, to, date = null) {
    const params = new URLSearchParams({
        from,
        to,
        transport_types: 'suburban'
    })

    if (date) params.append('date', date)

    return requestJSON(`/schedule/route?${params}`, 'Route schedule error')
}
