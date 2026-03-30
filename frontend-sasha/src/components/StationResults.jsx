import React from 'react'

function StationResults({ results, favorites, onSelect, onToggleFavorite }) {
    if (results.length === 0) return null

    return (
        <div className="results-list">
            {results.map((station) => {
                const isFav = favorites.some((fav) => fav.code === station.code)

                return (
                    <div key={station.code} className="result-item" onClick={() => onSelect(station)}>
                        <div className="result-info">
                            <h3 className="result-title">{station.title}</h3>
                            {station.settlement && <p className="result-settlement">{station.settlement}</p>}
                            {station.region && <p className="result-region">{station.region}</p>}
                        </div>
                        <button
                            className="fav-btn"
                            onClick={(event) => onToggleFavorite(event, station)}
                            title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                            <img
                                src={isFav ? '/star-filled.png' : '/star-empty.png'}
                                alt={isFav ? 'В избранном' : 'Добавить'}
                                className="star-icon"
                            />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default StationResults
