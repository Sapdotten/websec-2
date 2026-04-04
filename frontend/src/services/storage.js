import React from 'react'

const FAVORITES_KEY = 'elektrichki_favorites'

const emitFavoritesChange = () => {
    window.dispatchEvent(new Event('favorites:changed'))
}

export function loadFavorites() {
    try {
        const data = localStorage.getItem(FAVORITES_KEY)
        return data ? JSON.parse(data) : []
    } catch (error) {
        console.error('Load favorites error:', error)
        return []
    }
}

export function saveFavorite(station) {
    try {
        const favorites = loadFavorites()
        if (!favorites.find(s => s.code === station.code)) {
            favorites.push({
                code: station.code,
                title: station.title,
                settlement: station.settlement,
                region: station.region
            })
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
            emitFavoritesChange()
        }
        return favorites
    } catch (error) {
        console.error('Save favorite error:', error)
        return []
    }
}

export function removeFavorite(stationCode) {
    try {
        const favorites = loadFavorites().filter(s => s.code !== stationCode)
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
        emitFavoritesChange()
        return favorites
    } catch (error) {
        console.error('Remove favorite error:', error)
        return []
    }
}

export function isFavorite(stationCode) {
    const favorites = loadFavorites()
    return favorites.some(s => s.code === stationCode)
}

export function useFavorites() {
    const [favorites, setFavorites] = React.useState(loadFavorites())

    React.useEffect(() => {
        const handler = () => setFavorites(loadFavorites())
        window.addEventListener('favorites:changed', handler)
        return () => window.removeEventListener('favorites:changed', handler)
    }, [])

    return favorites
}