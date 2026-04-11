export function getVectorLayerByName(mapObject, layerName) {
    if (!mapObject) return null
    const vectorLayer = mapObject.getAllLayers().find((l) => l.get('name') === layerName)
    return vectorLayer ?? null
}

export function getSourceFromVectorLayerByName(mapObject, layerName) {
    const vectorLayer = getVectorLayerByName(mapObject, layerName)
    if (!vectorLayer || typeof vectorLayer.getSource !== 'function') return null
    return vectorLayer.getSource() ?? null
}
