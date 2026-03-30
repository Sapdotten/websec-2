import React, { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar.jsx'
import Schedule from './components/Schedule.jsx'
import RouteSearch from './components/RouteSearch.jsx'
import Favorites from './components/Favorites.jsx'
import { loadFavorites, saveFavorite, removeFavorite } from './services/storage.js'

function App() {
    const [activeTab, setActiveTab] = useState('station')
    const [selectedStation, setSelectedStation] = useState(null)
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        const updateFavorites = () => setFavorites(loadFavorites())
        updateFavorites()

        window.addEventListener('favorites:changed', updateFavorites)
        return () => window.removeEventListener('favorites:changed', updateFavorites)
    }, [])

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab !== 'station') {
            setSelectedStation(null)
        }
    }
    const handleToggleFavorite = (station) => {
        const favs = loadFavorites()
        if (favs.some((favorite) => favorite.code === station.code)) {
            removeFavorite(station.code)
            return
        }
        saveFavorite(station)
    }

    return (
        <div className="app">
            <header className="header">
                <h1 className="header-title">
                    <img src="/loading-cat.gif" alt="train" className="header-icon" />
                    Электрички
                </h1>
                <nav className="nav">
                    <button
                        className={`nav-btn ${activeTab === 'station' ? 'active' : ''}`}
                        onClick={() => handleTabChange('station')}
                    >
                        Станция
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'route' ? 'active' : ''}`}
                        onClick={() => handleTabChange('route')}
                    >
                        Маршрут
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => handleTabChange('favorites')}
                    >
                        Избранное ({favorites.length})
                    </button>
                </nav>
            </header>

            <main className="main">
                {activeTab === 'station' && (
                    <>
                        <SearchBar
                            onSelectStation={setSelectedStation}
                            onToggleFavorite={handleToggleFavorite}
                            favorites={favorites}
                        />
                        {selectedStation && (
                            <Schedule
                                station={selectedStation}
                                onBack={() => setSelectedStation(null)}
                            />
                        )}
                    </>
                )}

                {activeTab === 'route' && <RouteSearch />}

                {activeTab === 'favorites' && (
                    <Favorites
                        favorites={favorites}
                        onSelectStation={setSelectedStation}
                        onTabChange={handleTabChange}
                        onUpdateFavorites={() => setFavorites(loadFavorites())}
                    />
                )}
            </main>

            {/* <footer className="footer">
                <p>Данные предоставлены <a href="https://yandex.ru/rasp" target="_blank" rel="noopener noreferrer">Яндекс.Расписания</a></p>
            </footer> */}
        </div>
    )
}

export default App