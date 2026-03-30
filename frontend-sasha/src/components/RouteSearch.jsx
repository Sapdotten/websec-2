import React, { useActionState, useState } from 'react'
import { searchStations, getRouteSchedule } from '../services/api.js'

function RouteSearch() {
    const [fromQuery, setFromQuery] = useState('')
    const [toQuery, setToQuery] = useState('')
    const [date, setDate] = useState('')
    const [fromStations, setFromStations] = useState([])
    const [toStations, setToStations] = useState([])
    const [selectedFrom, setSelectedFrom] = useState(null)
    const [selectedTo, setSelectedTo] = useState(null)
    const [routes, setRoutes] = useState([])
    const [formError, setFormError] = useState(null)

    const searchFrom = async (query) => {
        if (!query.trim()) {
            setFromStations([])
            return
        }
        try {
            const stations = await searchStations(query)
            setFromStations(stations)
        } catch (err) {
            console.error('From search error:', err)
        }
    }

    const searchTo = async (query) => {
        if (!query.trim()) {
            setToStations([])
            return
        }
        try {
            const stations = await searchStations(query)
            setToStations(stations)
        } catch (err) {
            console.error('To search error:', err)
        }
    }

    const selectFrom = (station) => {
        setSelectedFrom(station)
        setFromQuery(station.title)
        setFromStations([])
    }

    const selectTo = (station) => {
        setSelectedTo(station)
        setToQuery(station.title)
        setToStations([])
    }

    const [_, submitSearchAction, isPending] = useActionState(
        async () => {
            if (!selectedFrom || !selectedTo || !date) {
                setFormError('Заполните станции отправления, назначения и дату')
                return null
            }

            setRoutes([])
            setFormError(null)

            try {
                const data = await getRouteSchedule(selectedFrom.code, selectedTo.code, date)
                const nextRoutes = data.segments || []
                setRoutes(nextRoutes)
                if (nextRoutes.length === 0) {
                    setFormError('Рейсы не найдены')
                }
            } catch (err) {
                setFormError('Ошибка: ' + err.message)
            }

            return null
        },
        null
    )

    const isFormComplete = Boolean(selectedFrom && selectedTo && date)

    const formatTime = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '—'
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    const formatDuration = (seconds) => {
        if (!seconds) return ''
        const h = Math.floor(seconds / 3600)  // ← 3600 секунд в часе
        const m = Math.floor((seconds % 3600) / 60)  // ← остаток в минутах
        return `${h}ч ${m}м`
    }

    return (
        <div className="route-search">
            <h2 className="section-title">Поиск маршрута</h2>

            <form action={submitSearchAction} className="route-form">
                <div className="form-group">
                    <label>Откуда:</label>
                    <input
                        type="text"
                        placeholder="Станция отправления"
                        value={fromQuery}
                        onChange={(e) => { setFromQuery(e.target.value); searchFrom(e.target.value) }}
                        disabled={isPending}
                    />
                    {fromStations.length > 0 && (
                        <div className="stations-dropdown">
                            {fromStations.map(station => (
                                <div key={station.code} className="station-option" onClick={() => selectFrom(station)}>
                                    <strong>{station.title}</strong>
                                    {station.settlement && <small>{station.settlement}</small>}
                                    {station.region && <small>{station.region}</small>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Куда:</label>
                    <input
                        type="text"
                        placeholder="Станция назначения"
                        value={toQuery}
                        onChange={(e) => { setToQuery(e.target.value); searchTo(e.target.value) }}
                        disabled={isPending}
                    />
                    {toStations.length > 0 && (
                        <div className="stations-dropdown">
                            {toStations.map(station => (
                                <div key={station.code} className="station-option" onClick={() => selectTo(station)}>
                                    <strong>{station.title}</strong>
                                    {station.settlement && <small>{station.settlement}</small>}
                                    {station.region && <small>{station.region}</small>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>Дата:</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isPending} />
                </div>

                <button type="submit" className="search-routes-btn" disabled={isPending || !isFormComplete}>
                    {isPending ? 'Поиск...' : 'Найти рейсы'}
                </button>
            </form>

            {formError && <div className="error-message">{formError}</div>}

            {routes.length > 0 && (
                <div className="routes-results">
                    <h3>Найдено рейсов: {routes.length}</h3>
                    {routes.map((route, index) => (
                        <div key={index} className="route-card">
                            <div className="route-time">
                                <div className="time-block">
                                    <span className="time">{formatTime(route.departure)}</span>
                                    <span className="station">{route.from_stop?.title || 'Отправление'}</span>
                                </div>
                                <div className="arrow">→</div>
                                <div className="time-block">
                                    <span className="time">{formatTime(route.arrival)}</span>
                                    <span className="station">{route.to_stop?.title || 'Прибытие'}</span>
                                </div>
                            </div>
                            <div className="route-info">
                                {route.duration && <span>В пути: {formatDuration(route.duration)}</span>}
                                {route.transfers?.length > 0 && <span>Пересадки: {route.transfers.length}</span>}
                                {route.is_express && <span className="badge express">Экспресс</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RouteSearch