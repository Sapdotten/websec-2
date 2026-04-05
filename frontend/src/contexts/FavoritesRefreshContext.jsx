import { createContext, useContext } from 'react'

export const FavoritesRefreshContext = createContext(null)

export function useFavoritesRefresh() {
    const refresh = useContext(FavoritesRefreshContext)
    if (typeof refresh !== 'function') {
        throw new Error('useFavoritesRefresh: нет Provider')
    }
    return refresh
}
