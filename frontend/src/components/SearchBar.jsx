import React, { useState, useEffect } from 'react'
import { Space, Input, Button, Alert, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import StationMap from './StationMap.jsx'
import SearchOptions from './SearchOptions.jsx'
import StationResults from './StationResults.jsx'
import { searchStations } from '../services/api.js'
import { useNavigate, useSearchParams } from 'react-router-dom'

function SearchBar({ onToggleFavorite, favorites = [] }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showMap, setShowMap] = useState(searchParams.get('map') === '1')

    const applyStations = (stations, max = null) => {
        const withCoords = stations.filter((station) => station.latitude && station.longitude)
        const limited = max ? withCoords.slice(0, max) : withCoords
        setResults(limited)
        return limited
    }

    const runSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setError(null)
        setResults([])

        try {
            const stations = await searchStations(searchQuery.trim(), null, null, 500)
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

    const handleSearch = async () => {
        if (!query.trim()) return
        const next = new URLSearchParams(searchParams)
        next.set('q', query.trim())
        if (showMap) {
            next.set('map', '1')
        } else {
            next.delete('map')
        }
        setSearchParams(next)
        await runSearch(query)
    }

    const handleSelect = (station) => {
        navigate(
            `/station/${station.code}?q=${encodeURIComponent(query)}${showMap ? '&map=1' : ''}`,
            { state: { station } },
        )
    }

    const handleMapStationSelect = (station) => {
        navigate(
            `/station/${station.code}?q=${encodeURIComponent(query)}${showMap ? '&map=1' : ''}`,
            { state: { station } },
        )
        setTimeout(() => {
            document.querySelector('.schedule-container')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }, 100)
    }

    const handleFavoriteClick = (e, station) => {
        e.stopPropagation()
        onToggleFavorite(station)
    }

    const handleShowAllStations = async () => {
        setLoading(true)
        setError(null)

        try {
            const stations = await searchStations('', null, null, 500)
            const filtered = applyStations(stations)

            setQuery('')
            setShowMap(true)

            const params = new URLSearchParams()
            params.set('map', '1')
            params.set('all', '1')
            setSearchParams(params)

            if (filtered.length === 0) {
                setError('Не удалось загрузить станции')
            }
        } catch (err) {
            setError('Ошибка: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleMap = () => {
        const next = !showMap
        setShowMap(next)

        const params = new URLSearchParams(searchParams)
        if (query.trim()) {
            params.set('q', query.trim())
        }
        if (next) {
            params.set('map', '1')
        } else {
            params.delete('map')
        }
        setSearchParams(params)
    }

    useEffect(() => {
        const isAll = searchParams.get('all') === '1'
        const initialQ = searchParams.get('q')

        if (isAll) {
            void handleShowAllStations()
        } else if (initialQ) {
            void runSearch(initialQ)
        }
    }, [])

    return (
        <div className="search-container">
            <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                <Input
                    placeholder="Введите название станции..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={handleSearch}
                    disabled={loading}
                    allowClear
                />
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                >
                    Найти
                </Button>
            </Space.Compact>

            <SearchOptions
                showMap={showMap}
                loading={loading}
                onToggleMap={handleToggleMap}
                onShowAll={handleShowAllStations}
            />

            {error && (
                <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} closable onClose={() => setError(null)} />
            )}

            {showMap && (
                <div className="map-container" style={{ marginBottom: '0.5rem' }}>
                    <StationMap
                        stations={results}
                        onStationSelect={handleMapStationSelect}
                    />
                </div>
            )}

            {showMap && <Typography type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>
                        Кликните на маркер для выбора станции
                    </Typography>}

            <StationResults
                results={results}
                favorites={favorites}
                onSelect={handleSelect}
                onToggleFavorite={handleFavoriteClick}
            />

            {results.length === 0 && query && !loading && !error && (
                <Typography type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 8 }}>
                    Станции не найдены
                </Typography>
            )}
        </div>
    )
}

export default SearchBar
