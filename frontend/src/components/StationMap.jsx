import React, { useEffect, useMemo, useRef, useState } from 'react'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import VectorLayer from 'ol/layer/Vector.js'
import VectorSource from 'ol/source/Vector.js'
import OSM from 'ol/source/OSM.js'
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import { fromLonLat } from 'ol/proj.js'
import { Style, Circle, Fill, Stroke } from 'ol/style.js'
import { defaults as defaultControls } from 'ol/control/defaults.js'
import { isEmpty } from 'ol/extent.js'
import { DEFAULT_MAP_CENTER } from '../config/map.js'

function makeStationStyle(feature, selectedCode) {
    const station = feature.get('station')
    const isSel = station && station.code === selectedCode
    return new Style({
        image: new Circle({
            radius: isSel ? 9 : 7,
            fill: new Fill({
                color: isSel ? 'rgba(138, 43, 226, 0.95)' : 'rgba(100, 100, 110, 0.9)',
            }),
            stroke: new Stroke({ color: '#ffffff', width: 2 }),
        }),
    })
}

const userLocationStyle = new Style({
    image: new Circle({
        radius: 8,
        fill: new Fill({ color: 'rgba(59, 130, 246, 0.9)' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
})

function StationMap({ stations, onStationSelect, userLocation }) {
    const [selectedCode, setSelectedCode] = useState(null)
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const stationsSourceRef = useRef(null)
    const stationsLayerRef = useRef(null)
    const userSourceRef = useRef(null)
    const selectedCodeRef = useRef(selectedCode)
    const onSelectRef = useRef(onStationSelect)

    selectedCodeRef.current = selectedCode
    onSelectRef.current = onStationSelect

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

    useEffect(() => {
        if (!mapRef.current) return undefined

        const stationsSource = new VectorSource()
        const userSource = new VectorSource()
        stationsSourceRef.current = stationsSource
        userSourceRef.current = userSource

        const stationsLayer = new VectorLayer({
            source: stationsSource,
            style: (feature) => makeStationStyle(feature, selectedCodeRef.current),
        })
        stationsLayerRef.current = stationsLayer

        const userLayer = new VectorLayer({
            source: userSource,
            style: userLocationStyle,
            zIndex: 10,
        })

        const map = new Map({
            target: mapRef.current,
            layers: [new TileLayer({ source: new OSM() }), stationsLayer, userLayer],
            controls: defaultControls({ attribution: true }),
            view: new View({
                center: fromLonLat([DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]]),
                zoom: 9,
            }),
        })
        mapInstanceRef.current = map

        map.on('click', (evt) => {
            map.forEachFeatureAtPixel(
                evt.pixel,
                (feature) => {
                    const station = feature.get('station')
                    if (station) {
                        setSelectedCode(station.code)
                        onSelectRef.current(station)
                        return true
                    }
                    return false
                },
                { layerFilter: (layer) => layer === stationsLayer },
            )
        })

        return () => {
            map.setTarget(undefined)
            mapInstanceRef.current = null
            stationsLayerRef.current = null
            stationsSourceRef.current = null
            userSourceRef.current = null
        }
    }, [])

    useEffect(() => {
        const source = stationsSourceRef.current
        const map = mapInstanceRef.current
        if (!source || !map) return

        source.clear()
        for (const station of preparedStations) {
            source.addFeature(
                new Feature({
                    geometry: new Point(fromLonLat([station.longitude, station.latitude])),
                    station,
                }),
            )
        }
        stationsLayerRef.current?.changed()

        const view = map.getView()
        const extent = source.getExtent()
        if (preparedStations.length > 0 && !isEmpty(extent)) {
            view.fit(extent, { padding: [48, 48, 48, 48], maxZoom: 13, duration: 250 })
        } else {
            view.setCenter(fromLonLat([DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]]))
            view.setZoom(9)
        }
    }, [preparedStations])

    useEffect(() => {
        const source = userSourceRef.current
        if (!source) return
        source.clear()
        if (userLocation?.lat != null && userLocation?.lng != null) {
            const lat = Number(userLocation.lat)
            const lon = Number(userLocation.lng)
            if (Number.isFinite(lat) && Number.isFinite(lon)) {
                source.addFeature(new Feature({ geometry: new Point(fromLonLat([lon, lat])) }))
            }
        }
    }, [userLocation])

    useEffect(() => {
        stationsLayerRef.current?.changed()
    }, [selectedCode])

    return <div ref={mapRef} className="ol-station-map" role="application" aria-label="Карта станций" />
}

export default StationMap
