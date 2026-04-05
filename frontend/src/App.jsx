import React, { useMemo } from 'react'
import { Tabs, Typography } from 'antd'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import SearchBar from './components/SearchBar.jsx'
import Schedule from './components/Schedule.jsx'
import RouteSearch from './components/RouteSearch.jsx'
import Favorites from './components/Favorites.jsx'
import { loadFavorites, saveFavorite, removeFavorite } from './services/storage.js'
import { useFavoritesState } from './hooks/useFavoritesState.js'
import { FavoritesRefreshContext } from './contexts/FavoritesRefreshContext.jsx'

function StationRouteWrapper() {
    const navigate = useNavigate()
    const location = useLocation()
    const station = location.state?.station

    if (!station) {
        return (
            <main className="main">
                <Typography.Text type="secondary">
                    Станция не найдена. Вернитесь назад и выберите станцию из списка.
                </Typography.Text>
            </main>
        )
    }

    return (
        <main className="main">
            <Schedule station={station} onBack={() => navigate(-1)} />
        </main>
    )
}

function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const [favorites, refreshFavorites] = useFavoritesState()

    const activeTab = useMemo(() => {
        if (location.pathname.startsWith('/route')) return 'route'
        if (location.pathname.startsWith('/favorites')) return 'favorites'
        return 'station'
    }, [location.pathname])

    const handleTabChange = (tab) => {
        navigate(tab === 'station' ? '/' : `/${tab}`)
    }

    const handleToggleFavorite = (station) => {
        const favs = loadFavorites()
        if (favs.some((favorite) => favorite.code === station.code)) {
            removeFavorite(station.code)
        } else {
            saveFavorite(station)
        }
        refreshFavorites()
    }

    return (
        <FavoritesRefreshContext.Provider value={refreshFavorites}>
        <div className="app">
            <header className="header">
                <Typography.Title level={3} className="header-title" style={{ margin: 0, textAlign: 'center' }}>
                    <img src="/loading-cat.gif" alt="" className="header-icon" />
                    Электрички
                </Typography.Title>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    centered
                    items={[
                        { key: 'station', label: 'Станция' },
                        { key: 'route', label: 'Маршрут' },
                        { key: 'favorites', label: `Избранное (${favorites.length})` },
                    ]}
                />
            </header>

            <Routes>
                <Route
                    path="/"
                    element={
                        <main className="main">
                            <SearchBar
                                onToggleFavorite={handleToggleFavorite}
                                favorites={favorites}
                            />
                        </main>
                    }
                />
                <Route path="/station/:code" element={<StationRouteWrapper />} />
                <Route
                    path="/route"
                    element={
                        <main className="main">
                            <RouteSearch />
                        </main>
                    }
                />
                <Route
                    path="/favorites"
                    element={
                        <main className="main">
                            <Favorites
                                favorites={favorites}
                                onSelectStation={(station) =>
                                    navigate(`/station/${station.code}`, { state: { station } })
                                }
                                onTabChange={handleTabChange}
                                onUpdateFavorites={refreshFavorites}
                            />
                        </main>
                    }
                />
            </Routes>
        </div>
        </FavoritesRefreshContext.Provider>
    )
}

export default App
