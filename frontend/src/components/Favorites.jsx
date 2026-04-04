import React from 'react'
import { Button, Typography, Empty, Flex } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
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
                <Empty
                    image={<img src="/what-cat.gif" alt="" className="favorites-empty-cat" draggable={false} />}
                    description="У вас нет избранных станций"
                >
                    <Button type="primary" onClick={() => onTabChange('station')}>
                        Добавить станцию
                    </Button>
                </Empty>
            </div>
        )
    }

    return (
        <div className="favorites-container">
            <Typography.Title level={4} className="section-title">
                Избранные станции
            </Typography.Title>
            <Flex vertical gap={12} className="favorites-list-inner">
                {favorites.map((station) => (
                    <Flex
                        key={station.code}
                        className="favorite-card"
                        align="center"
                        justify="space-between"
                        gap={8}
                        onClick={() => handleSelectFavorite(station)}
                    >
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <Typography.Text strong>{station.title}</Typography.Text>
                            {station.settlement ? (
                                <div>
                                    <Typography.Text type="secondary">{station.settlement}</Typography.Text>
                                </div>
                            ) : null}
                        </div>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => handleRemoveFavorite(station.code, e)}
                            aria-label="Удалить из избранного"
                        />
                    </Flex>
                ))}
            </Flex>
        </div>
    )
}

export default Favorites
