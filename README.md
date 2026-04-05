# Лабораторная работа №2 — «Электрички»

Веб-приложение для пригородных поездов : поиск станций, расписание по станции и между двумя станциями, избранное.

---

## Реализованный функционал

- **Поиск станции**
- **Карта**
- **Расписание по станции**
- **Маршрут между двумя станциями**
- **Избранное**
- **Адаптив**

---


## Переменные окружения

**Backend** — файл `backend/.env`:

```env
YANDEX_API_KEY=<ключ API Яндекс.Расписаний>
PORT=3001
YANDEX_RASP_BASE=https://api.rasp.yandex.net/v3.0
STATIONS_CACHE_TTL_MS=604800000
```

`STATIONS_CACHE_TTL_MS` — срок жизни файлового кэша справочника станций в миллисекундах (пример: 7 суток).

**Frontend** — файл `frontend/.env` (скопировать из `frontend/.env.example`):

```env
VITE_API_BASE=http://localhost:3001/api
```

Полный URL API бэкенда (как в примере), чтобы фронт не ходил на себя через относительный `/api`. Порт должен совпадать с `PORT` бэкенда. Карта: [OpenLayers](https://openlayers.org/) + OSM, ключ не нужен.

Шаблоны: `backend/.env.example`, `frontend/.env.example`.
---

## Установка и запуск

Требуется **Node.js**.

### 1. Backend

```bash
cd backend
npm install
npm run backend-start
```

Сервер слушает `http://localhost:3001` (или `PORT` из `.env`).

### 2. Frontend

В другом терминале:

```bash
cd frontend
npm install
npm run dev
```

---

```
  ╱|、
(˚ˎ 。7  
 |、˜〵          
じしˍ,)ノ
```