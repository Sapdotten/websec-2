import React from 'react'

function SearchOptions({ showMap, loading, onToggleMap, onShowAll }) {
    return (
        <div className="search-options">
            <button className="option-btn" onClick={onToggleMap} disabled={loading}>
                🗺️ {showMap ? 'Скрыть карту' : 'Показать карту'}
            </button>
            <button className="option-btn" onClick={onShowAll} disabled={loading}>
                🌍 Все станции
            </button>
        </div>
    )
}

export default SearchOptions
