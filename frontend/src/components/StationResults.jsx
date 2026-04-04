import React from 'react'
import { Button, Typography, Flex } from 'antd'

function StationResults({ results, favorites, onSelect, onToggleFavorite }) {
    if (results.length === 0) return null

    return (
        <Flex vertical gap={0} className="station-results-list">
            {results.map((station) => {
                const isFav = favorites.some((fav) => fav.code === station.code)
                return (
                    <Flex
                        key={station.code}
                        className="station-results-item"
                        align="center"
                        justify="space-between"
                        gap={8}
                        onClick={() => onSelect(station)}
                    >
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <Typography.Text strong>{station.title}</Typography.Text>
                            {station.settlement && (
                                <div>
                                    <Typography.Text type="secondary">{station.settlement}</Typography.Text>
                                </div>
                            )}
                            {station.region && (
                                <div>
                                    <Typography.Text type="secondary">{station.region}</Typography.Text>
                                </div>
                            )}
                        </div>
                        <Button
                            type="text"
                            className="fav-star-btn"
                            aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
                            onClick={(event) => onToggleFavorite(event, station)}
                            icon={
                                <img
                                    src={isFav ? '/star-filled.png' : '/star-empty.png'}
                                    alt=""
                                    style={{ width: 20, height: 20, display: 'block' }}
                                    draggable={false}
                                />
                            }
                        />
                    </Flex>
                )
            })}
        </Flex>
    )
}

export default StationResults
