import { useState, useEffect, useCallback } from 'react'
import { loadFavorites, FAVORITES_KEY } from '../services/storage.js'

export function useFavoritesState() {
    const [favorites, setFavorites] = useState(loadFavorites)

    const refreshFavorites = useCallback(() => {
        setFavorites(loadFavorites())
    }, [])

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== FAVORITES_KEY && e.key !== null) return
            setFavorites(loadFavorites())
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    return [favorites, refreshFavorites]
}
