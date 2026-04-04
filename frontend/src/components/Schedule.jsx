import React, { useState, useEffect, useCallback } from 'react'
import { Spin, Button, Typography, Tag, Alert, Flex, Grid } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { getStationSchedule } from '../services/api.js'
import { saveFavorite, removeFavorite, isFavorite } from '../services/storage.js'

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;


function Schedule({ station, onBack }) {
    const screens = useBreakpoint()
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [favorite, setFavorite] = useState(false)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const scheduleData = await getStationSchedule(station.code)
            setSchedule(scheduleData.segments || scheduleData.schedule || [])
        } catch (err) {
            setError('Download error: ' + err.message)
        } finally {
            setLoading(false)
        }
    }, [station.code])

    useEffect(() => {
        loadData()
        setFavorite(isFavorite(station.code))
    }, [loadData, station.code])

    const handleToggleFavorite = () => {
        if (favorite) removeFavorite(station.code)
        else saveFavorite(station)
        setFavorite(!favorite)
    }

    if (loading) {
        return (
            <Flex align="center" justify="center" style={{ minHeight: '200px' }}>
                <Spin tip="Загрузка расписания..." />
            </Flex>
        )
    }

    if (error) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert type="error" message={error} action={
                    <Button size="small" type="primary" onClick={loadData}>Повторить</Button>
                } />
            </div>
        )
    }

    return (
        <div className="schedule-wrapper" style={{ padding: screens.xs ? '8px' : '16px' }}>
            <Flex
                justify="space-between"
                align="center"
                gap="small"
                style={{ marginBottom: 16 }}
            >
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    type={screens.xs ? 'text' : 'default'}
                >
                    {!screens.xs && 'Назад'}
                </Button>

                <Title level={screens.xs ? 5 : 4} style={{ margin: 0, textAlign: 'center', flex: 1 }}>
                    {station.title}
                </Title>

                <Button
                    type="text"
                    size="large"
                    className="fav-star-btn"
                    onClick={handleToggleFavorite}
                    aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    icon={
                        <img
                            src={favorite ? '/star-filled.png' : '/star-empty.png'}
                            alt=""
                            style={{ width: 24, height: 24, display: 'block' }}
                            draggable={false}
                        />
                    }
                />
            </Flex>

            <Flex style={{ marginBottom: 16 }}>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                    block={screens.xs}
                >
                    Обновить
                </Button>
            </Flex>

            {schedule.length === 0 ? (
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>
                    Расписание не найдено
                </Text>
            ) : (
                <Flex vertical gap={0} className="schedule-train-list">
                    {schedule.map((train) => (
                        <div
                            key={train.thread?.uid || `${train.departure || ''}-${train.arrival || ''}-${train.thread?.number || ''}`}
                            className="schedule-train-item"
                            style={{ padding: screens.xs ? '12px 4px' : '12px 16px' }}
                        >
                            <Flex justify="space-between" align="start">
                                <Flex vertical>
                                    <Text strong style={{ fontSize: screens.xs ? '16px' : '18px' }}>
                                        {train.departure || train.arrival}
                                    </Text>
                                    <Text type="secondary" size="small" style={{ fontSize: '12px' }}>
                                        {train.days}
                                    </Text>
                                </Flex>
                                <Flex vertical align="end" gap={4}>
                                    {train.is_express && <Tag color="purple" style={{ margin: 0 }}>Экспресс</Tag>}
                                    {train.thread?.number && (
                                        <Text type="secondary" style={{ fontSize: '12px' }}>№{train.thread.number}</Text>
                                    )}
                                </Flex>
                            </Flex>
                            <div style={{ marginTop: 4 }}>
                                <Text style={{ display: 'block' }}>
                                    {train.thread?.title || train.title || 'Маршрут не указан'}
                                </Text>
                                {!screens.xs && train.to_stop?.title && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Конечная: {train.to_stop.title}
                                    </Text>
                                )}
                            </div>
                        </div>
                    ))}
                </Flex>
            )}
        </div>
    )
}

export default Schedule
