import React, { useActionState, useState } from 'react'
import { Select, DatePicker, Button, Space, Typography, Tag, Alert, Flex } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { searchStations, getRouteSchedule } from '../services/api.js'
import { formatDuration } from '../utils/duration.js'

dayjs.locale('ru')

function RouteSearch() {
    const [fromValue, setFromValue] = useState()
    const [toValue, setToValue] = useState()
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
        } catch {
            setFromStations([])
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
        } catch {
            setToStations([])
        }
    }

    const selectFrom = (station) => {
        setSelectedFrom(station)
        setFromValue(station.code)
    }

    const selectTo = (station) => {
        setSelectedTo(station)
        setToValue(station.code)
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
                setFormError('Error: ' + err.message)
            }

            return null
        },
        null,
    )

    const isFormComplete = Boolean(selectedFrom && selectedTo && date)

    const formatTime = (dateString) => {
        if (!dateString) return '—'
        const d = new Date(dateString)
        if (isNaN(d.getTime())) return '—'
        return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    const fromOptions = fromStations.map((s) => ({
        value: s.code,
        label: `${s.title}`,
    }))

    const toOptions = toStations.map((s) => ({
        value: s.code,
        label: `${s.title}`,
    }))

    return (
        <div className="route-search">
            <Typography.Title level={4} className="section-title">
                Поиск маршрута
            </Typography.Title>

            <form action={submitSearchAction} className="route-form">
                <div className="form-group">
                    <label>Откуда</label>
                    <Select
                        showSearch={{
                            filterOption: false,
                            onSearch: searchFrom,
                        }}
                        allowClear
                        placeholder="Начните вводить название станции"
                        value={fromValue}
                        onChange={(code) => {
                            setFromValue(code)
                            if (!code) {
                                setSelectedFrom(null)
                                setFromStations([])
                                return
                            }
                            const station = fromStations.find((s) => s.code === code)
                            if (station) {
                                selectFrom(station)
                            }
                        }}
                        defaultActiveFirstOption={false}
                        suffixIcon={null}
                        notFoundContent={null}
                        options={fromOptions}
                        disabled={isPending}
                        style={{ width: '100%' }}
                    />
                </div>

                <div className="form-group">
                    <label>Куда</label>
                    <Select
                        showSearch={{
                            filterOption: false,
                            onSearch: searchTo,
                        }}
                        allowClear
                        placeholder="Начните вводить название станции"
                        value={toValue}
                        onChange={(code) => {
                            setToValue(code)
                            if (!code) {
                                setSelectedTo(null)
                                setToStations([])
                                return
                            }
                            const station = toStations.find((s) => s.code === code)
                            if (station) {
                                selectTo(station)
                            }
                        }}
                        defaultActiveFirstOption={false}
                        suffixIcon={null}
                        notFoundContent={null}
                        options={toOptions}
                        disabled={isPending}
                        style={{ width: '100%' }}
                    />
                </div>

                <div className="form-group">
                    <label>Дата</label>
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD.MM.YYYY"
                        value={date ? dayjs(date) : null}
                        onChange={(d) => setDate(d ? d.format('YYYY-MM-DD') : '')}
                        disabled={isPending}
                        placeholder="Выберите дату"
                    />
                </div>

                <Button type="primary" htmlType="submit" block loading={isPending} disabled={isPending || !isFormComplete} className="search-routes-btn">
                    Найти рейсы
                </Button>
            </form>

            {formError && <Alert type="error" message={formError} showIcon style={{ marginBottom: 16 }} />}

            {routes.length > 0 && (
                <div className="routes-results">
                    <Typography.Title level={5}>Найдено рейсов: {routes.length}</Typography.Title>
                    <Flex vertical gap={0} className="routes-results-list">
                        {routes.map((route, index) => (
                            <div key={index} className="route-card">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Space wrap size="large" className="route-time">
                                        <Space direction="vertical" size={0} className="time-block">
                                            <Typography.Text strong className="time">
                                                {formatTime(route.departure)}
                                            </Typography.Text>
                                            <Typography.Text type="secondary" className="station">
                                                {route.from_stop?.title || 'Отправление'}
                                            </Typography.Text>
                                        </Space>
                                        <Typography.Text className="arrow">→</Typography.Text>
                                        <Space direction="vertical" size={0} className="time-block">
                                            <Typography.Text strong className="time">
                                                {formatTime(route.arrival)}
                                            </Typography.Text>
                                            <Typography.Text type="secondary" className="station">
                                                {route.to_stop?.title || 'Прибытие'}
                                            </Typography.Text>
                                        </Space>
                                    </Space>
                                    <Space wrap className="route-info">
                                        {route.duration ? (
                                            <Typography.Text type="secondary">В пути: {formatDuration(route.duration)}</Typography.Text>
                                        ) : null}
                                        {route.transfers?.length > 0 && (
                                            <Typography.Text type="secondary">Пересадки: {route.transfers.length}</Typography.Text>
                                        )}
                                        {route.is_express && (
                                            <Tag color="purple" className="badge express">
                                                Экспресс
                                            </Tag>
                                        )}
                                    </Space>
                                </Space>
                            </div>
                        ))}
                    </Flex>
                </div>
            )}
        </div>
    )
}

export default RouteSearch
