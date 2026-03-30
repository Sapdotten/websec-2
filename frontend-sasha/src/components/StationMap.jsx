import React, { useMemo, useState } from 'react'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'

const DEFAULT_CENTER = [55.7558, 37.6173]
const mapApiKey = import.meta.env.VITE_YANDEX_MAPS_APIKEY
console.log(mapApiKey)

function StationMap({ stations, onStationSelect, userLocation }) {
    const [selectedCode, setSelectedCode] = useState(null)

    const preparedStations = useMemo(() => {
        return stations
            .filter((station) => station.latitude && station.longitude)
            .map((station) => ({
                ...station,
                latitude: Number(station.latitude),
                longitude: Number(station.longitude),
            }))
            .filter((station) => Number.isFinite(station.latitude) && Number.isFinite(station.longitude))
    }, [stations])

    const center = useMemo(() => {
        if (userLocation?.lat && userLocation?.lng) {
            return [userLocation.lat, userLocation.lng]
        }
        if (preparedStations.length > 0) {
            return [preparedStations[0].latitude, preparedStations[0].longitude]
        }
        return DEFAULT_CENTER
    }, [preparedStations, userLocation])

    if (!mapApiKey) {
        return (
            <div className="yandex-map map-loading">
                <span>Не указан API ключ Яндекс.Карт</span>
            </div>
        )
    }

    return (
        <YMaps query={{ suggest_apikey: mapApiKey, lang: 'ru_RU', load: 'package.full' }}>
            <Map
                className="yandex-map"
                defaultState={{ center, zoom: preparedStations.length > 0 ? 11 : 9, controls: ['zoomControl'] }}
                state={{ center, zoom: preparedStations.length > 0 ? 11 : 9, controls: ['zoomControl'] }}
                modules={['control.ZoomControl', 'geoObject.addon.balloon', 'geoObject.addon.hint']}
                width="100%"
                height="100%"
            >
                {userLocation?.lat && userLocation?.lng && (
                    <Placemark
                        geometry={[userLocation.lat, userLocation.lng]}
                        properties={{ hintContent: 'Вы здесь' }}
                        options={{ preset: 'islands#blueCircleIcon' }}
                    />
                )}

                {preparedStations.map((station) => (
                    <Placemark
                        key={station.code}
                        geometry={[station.latitude, station.longitude]}
                        properties={{
                            hintContent: station.title,
                            balloonContent: `<strong>${station.title}</strong><br/>${station.settlement ?? ''}${
                                station.region ? `<br/>${station.region}` : ''
                            }`,
                        }}
                        options={{
                            preset: selectedCode === station.code ? 'islands#violetIcon' : 'islands#grayIcon',
                        }}
                        onClick={() => {
                            setSelectedCode(station.code)
                            onStationSelect(station)
                        }}
                    />
                ))}
            </Map>
        </YMaps>
    )
}

export default StationMap
