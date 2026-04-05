import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './App.jsx'
import 'ol/ol.css'
import './styles/main.css'
import './styles/adaptive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ConfigProvider
        locale={ruRU}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#8a2be2',
            colorBgContainer: 'transparent',
            colorBorder: 'rgba(255, 255, 255, 0.14)',
            colorText: '#ffffff',
            colorTextSecondary: 'rgba(255, 255, 255, 0.72)',
            borderRadius: 10,
            fontFamily: "'Quicksand', system-ui, -apple-system, 'Segoe UI', sans-serif",
          },
          components: {
            Tabs: {
              inkBarColor: '#c084fc',
              itemSelectedColor: '#ffffff',
              itemHoverColor: '#ffffff',
              itemActiveColor: '#ffffff',
              itemColor: 'rgba(255, 255, 255, 0.65)',
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
