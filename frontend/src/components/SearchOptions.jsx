import React from 'react'
import { Space, Button } from 'antd'
import { GlobalOutlined, CompassOutlined } from '@ant-design/icons'

function SearchOptions({ showMap, loading, onToggleMap, onShowAll }) {
    return (
        <Space wrap style={{ marginBottom: 12 }} className="search-options">
            <Button icon={<CompassOutlined />} onClick={onToggleMap} disabled={loading}>
                {showMap ? 'Скрыть карту' : 'Показать карту'}
            </Button>
            <Button icon={<GlobalOutlined />} onClick={onShowAll} disabled={loading}>
                Все станции
            </Button>
        </Space>
    )
}

export default SearchOptions
