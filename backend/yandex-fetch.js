function buildUrl(pathname, queryParams) {
    const base = process.env.YANDEX_RASP_BASE.trim().replace(/\/?$/, '/');
    const url = new URL(String(pathname).replace(/^\//, ''), base);
    for (const [k, v] of Object.entries(queryParams || {})) {
        if (Boolean(v)) {
            url.searchParams.set(k, String(v));
        }
    }
    return url;
}

async function fetchYandexJson(pathname, queryParams) {
    const url = buildUrl(pathname, queryParams);

    const controller = new AbortController();
    const timeoutMs = 180000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
        response = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        });
    } finally {
        clearTimeout(timer);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data?.error?.message || response.statusText || 'Yandex API error');
        err.responseData = data;
        err.status = response.status;
        throw err;
    }
    return data;
}

module.exports = { fetchYandexJson };
