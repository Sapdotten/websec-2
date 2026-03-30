import React, { useState } from 'react'
import StationMap from './StationMap.jsx'
import SearchOptions from './SearchOptions.jsx'
import StationResults from './StationResults.jsx'
import { searchStations } from '../services/api.js'

function SearchBar({ onSelectStation, onToggleFavorite, favorites = [] }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showMap, setShowMap] = useState(false)
    const [userLocation, setUserLocation] = useState(null)

    const applyStations = (stations, max = null) => {
        const withCoords = stations.filter((station) => station.latitude && station.longitude)
        const limited = max ? withCoords.slice(0, max) : withCoords
        setResults(limited)
        return limited
    }

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setError(null)
        setResults([])

        try {
            const stations = await searchStations(query.trim())
            const filtered = applyStations(stations)
            if (filtered.length === 0) {
                setError('Ничего не найдено')
            }
        } catch (err) {
            setError('Ошибка: ' + err.message)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (station) => {
        onSelectStation(station)
        setResults([])
        setQuery('')
        setShowMap(false)
    }

    const handleMapStationSelect = (station) => {
        onSelectStation(station)
        setResults([])
        setQuery('')
        setShowMap(false)
        setTimeout(() => {
            document.querySelector('.schedule-container')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }, 100)
    }

    const handleGeoSearch = async () => {
        if (!navigator.geolocation) {
            setError('Геолокация не поддерживается')
            return
        }

        setLoading(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lng: longitude })

                try {
                    const stations = await searchStations('', latitude, longitude)
                    applyStations(stations, 20)
                    setShowMap(true)
                } catch (err) {
                    setError('Ошибка поиска рядом: ' + err.message)
                } finally {
                    setLoading(false)
                }
            },
            () => {
                setError('Не удалось получить геопозицию')
                setLoading(false)
            }
        )
    }

    const handleFavoriteClick = (e, station) => {
        e.stopPropagation()
        onToggleFavorite(station)
    }

    const handleShowAllStations = async () => {
        setLoading(true)
        setError(null)

        try {
            const stations = await searchStations('', null, null, 50)
            const filtered = applyStations(stations, 50)
            setShowMap(true)
            if (filtered.length === 0) {
                setError('Не удалось загрузить станции')
            }
        } catch (err) {
            setError('Ошибка: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Введите название станции..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" className="search-btn" disabled={loading}>
                    {loading ? '⌛' : '🔍'}
                </button>
            </form>
            <SearchOptions
                showMap={showMap}
                loading={loading}
                onToggleMap={() => setShowMap((prev) => !prev)}
                onGeoSearch={handleGeoSearch}
                onShowAll={handleShowAllStations}
            />

            {error && <div className="error-message">{error}</div>}

            {showMap && (
                <div className="map-container" style={{ marginBottom: '1rem' }}>
                    <StationMap
                        stations={results}
                        onStationSelect={handleMapStationSelect}
                        userLocation={userLocation}
                    />
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        fontFamily: 'Courier New, monospace'
                    }}>
                        Кликните на маркер для выбора станции
                    </div>
                </div>
            )}

            <StationResults
                results={results}
                favorites={favorites}
                onSelect={handleSelect}
                onToggleFavorite={handleFavoriteClick}
            />

            {results.length === 0 && query && !loading && !error && (
                <p className="no-results">Станции не найдены</p>
            )}
        </div>
    )
}

export default SearchBar
