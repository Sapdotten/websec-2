import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadFavorites, saveFavorite, removeFavorite } from './services/storage.js';

// Динамическая инициализация + манипуляции DOM
document.addEventListener('DOMContentLoaded', () => {
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);

    // Динамическое изменение CSSOM для темной темы (опционально)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.style.setProperty('--bg', '#121212');
        document.documentElement.style.setProperty('--card', '#1e1e1e');
        document.documentElement.style.setProperty('--text', '#fff');
    }
});

// Хелпер для динамической подгрузки контента
export async function fetchAPI(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/${endpoint}?${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// Динамическое обновление DOM-элементов
export function updateElement(id, content) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = content;
}

export { loadFavorites, saveFavorite, removeFavorite };