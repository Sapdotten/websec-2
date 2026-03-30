import React from 'react'
import { removeFavorite } from '../services/storage.js'

function Favorites({ favorites, onSelectStation, onTabChange, onUpdateFavorites }) {
    const handleRemoveFavorite = (code, e) => {
        e.stopPropagation()
        removeFavorite(code)
        onUpdateFavorites()
    }

    const handleSelectFavorite = (station) => {
        onSelectStation(station)
        onTabChange('station')
    }

    if (favorites.length === 0) {
        return (
            <div className="favorites-empty">
                <h2>Избранное</h2>
                <p>У вас нет избранных станций</p>
                <button onClick={() => onTabChange('station')}>
                    Добавить станцию
                </button>
            </div>
        )
    }

    return (
        <div className="favorites-container">
            <h2 className="section-title">Избранные станции</h2>
            <div className="favorites-list">
                {favorites.map((station) => (
                    <div
                        key={station.code}
                        className="favorite-card"
                        onClick={() => handleSelectFavorite(station)}
                    >
                        <div className="favorite-info">
                            <h3 className="favorite-title">{station.title}</h3>
                            {station.settlement && (
                                <p className="favorite-settlement">{station.settlement}</p>
                            )}
                        </div>
                        <button
                            className="remove-fav-btn"
                            onClick={(e) => handleRemoveFavorite(station.code, e)}
                            title="Удалить из избранного"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Favorites