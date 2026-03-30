import React, { useState, useEffect, useCallback } from 'react'
import { getStationSchedule, getDirections } from '../services/api.js'
import { saveFavorite, removeFavorite, isFavorite } from '../services/storage.js'

function Schedule({ station, onBack }) {
    const [schedule, setSchedule] = useState([])
    const [directions, setDirections] = useState([])
    const [selectedDirection, setSelectedDirection] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [favorite, setFavorite] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const [scheduleData, directionsList] = await Promise.all([
                getStationSchedule(station.code, null, selectedDirection),
                getDirections(station.code)
            ])

            setSchedule(scheduleData.schedule || scheduleData.segments || [])
            setDirections(['all', ...directionsList])
        } catch (err) {
            setError('Ошибка загрузки расписания: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [selectedDirection, station.code])

    useEffect(() => {
        loadData()
        setFavorite(isFavorite(station.code))
    }, [loadData, station.code])

    const handleToggleFavorite = () => {
        if (favorite) {
            removeFavorite(station.code)
        } else {
            saveFavorite(station)
        }
        setFavorite(!favorite)
    }

    if (loading) {
        return (
            <div className="schedule-container loading">
                <div className="loader">Загрузка расписания...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="schedule-container error">
                <p>{error}</p>
                <button onClick={loadData}>Повторить</button>
            </div>
        )
    }

    return (
        <div className="schedule-container">
            <div className="schedule-header">
                <button className="back-btn" onClick={onBack}>
                    ← Назад
                </button>
                <h2 className="station-title">{station.title}</h2>
                <button
                    className={`fav-btn ${favorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    title={favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                    {favorite ? '⭐' : '☆'}
                </button>
            </div>

            <div className="schedule-controls">
                <select
                    value={selectedDirection}
                    onChange={(e) => setSelectedDirection(e.target.value)}
                    className="direction-select"
                >
                    <option value="all">Все направления</option>
                    {directions.filter(d => d !== 'all').map(dir => (
                        <option key={dir} value={dir}>{dir}</option>
                    ))}
                </select>
                <button onClick={loadData} className="refresh-btn">
                    🔄 Обновить
                </button>
            </div>

            {schedule.length === 0 ? (
                <p className="no-schedule">Расписание пусто</p>
            ) : (
                <div className="trains-list">
                    {schedule.map((train, index) => (
                        <div key={index} className="train-card">
                            <div className="train-time">
                                <span className="time">{train.departure}</span>
                                <span className="date">{train.days}</span>
                            </div>
                            <div className="train-info">
                                {/* direction может быть вложен в thread или быть напрямую */}
                                <h4 className="train-direction">
                                    {train.thread?.direction || train.thread?.title || train.direction || train.title || 'Не указано'}
                                </h4>
                                {train.to_stop?.title && (
                                    <p className="train-to">До: {train.to_stop.title}</p>
                                )}
                            </div>
                            <div className="train-meta">
                                {train.is_express && <span className="badge express">Экспресс</span>}
                                {train.thread?.number && (
                                    <span className="train-number">№{train.thread.number}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Schedule
