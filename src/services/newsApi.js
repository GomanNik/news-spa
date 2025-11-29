const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const USE_MOCK = (import.meta.env.VITE_USE_MOCK || 'false').toLowerCase() === 'true';
const CATEGORY_Q = {
    business: 'бизнес OR экономика OR рынки',
    entertainment: 'развлечения OR шоу-бизнес OR кино',
    general: 'новости',
    health: 'здоровье OR медицина',
    science: 'наука OR исследование',
    sports: 'спорт OR матч OR турнир',
    technology: 'технологии OR ИТ OR гаджеты'
};

function normalizeArticle(a) {
    const id =
        (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // картинка
    const imageUrl =
        (a && typeof a['urlToImage'] === 'string' && a['urlToImage']) ||
        (a && typeof a['imageUrl'] === 'string' && a['imageUrl']) ||
        '';

    // источник
    const sourceName =
        (a && a.source && typeof a.source === 'object' && 'name' in a.source)
            ? a.source.name
            : (typeof a?.source === 'string' ? a.source : 'Unknown');

    // «сырой» content из API
    const rawContent = typeof a?.content === 'string' ? a.content : '';

    // убираем хвост вида "[+136 chars]"
    const trimmedContent = rawContent.replace(/\s*\[\+\d+\schars]$/, '');

    // если после обрезки там почти нет букв/цифр — считаем, что контент бесполезен
    const hasLetters = /[A-Za-zА-Яа-я0-9]/.test(trimmedContent);
    const safeContent = hasLetters ? trimmedContent : '';

    // основной текст для отображения
    const mainText = a?.description || safeContent || '';

    return {
        id,
        title: a?.title || 'Без заголовка',
        description: a?.description || safeContent || '',
        url: a?.url,
        imageUrl,
        source: sourceName,
        publishedAt: a?.publishedAt || a?.date || new Date().toISOString(),
        author: a?.author || '',
        content: mainText,
    };
}

async function fetchReal({ q = '', category = 'all', page = 1, pageSize = 12 }) {
    const apiKey = String(import.meta.env.VITE_NEWS_API_KEY || '').trim();
    if (!apiKey) throw new Error('Не задан VITE_NEWS_API_KEY');
    if (/[^\u0000-\u007F]/.test(apiKey)) throw new Error('VITE_NEWS_API_KEY содержит не-ASCII символы.');

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 12000);
    const country = 'ru';
    const useCategory = category && category !== 'all';

    const doFetch = async (url) => {
        let attempt = 0;
        const maxAttempts = 3;     // всего до 3 попыток
        const baseDelay = 1200;    // 1.2s, затем *2, затем *3

        while (true) {
            const res = await fetch(url, { signal: controller.signal });
            if (res.status === 429) {
                if (attempt >= maxAttempts - 1) {
                    // отдадим понятную ошибку в UI — появится красная плашка с Retry
                    throw new Error('Слишком много запросов (429). Попробуйте чуть позже или уточните поиск.');
                }
                attempt += 1;
                const wait = baseDelay * (attempt + 1); // 1200 → 2400 → 3600 мс
                await new Promise(r => setTimeout(r, wait));
                continue;
            }
            if (!res.ok) {
                let msg = `API ${res.status}`;
                try { const err = await res.json(); if (err?.message) msg += `: ${err.message}`; } catch {}
                throw new Error(msg);
            }
            return res.json();
        }
    };

    const mapOut = (data) => {
        const articles = (data?.articles || []).map(normalizeArticle);
        return { articles, hasMore: articles.length === pageSize };
    };

    const build = (base, paramsObj) => {
        const p = new URLSearchParams({ ...paramsObj, page: String(page), pageSize: String(pageSize), apiKey });
        return `${base}?${p.toString()}`;
    };

    const headlines = (params) => build('https://newsapi.org/v2/top-headlines', params);
    const everything = (params) => build('https://newsapi.org/v2/everything', params);

    // Единый путь: пробуем headlines → если пусто, берём everything
    const getWithFallback = async (paramsHead, paramsEverything) => {
        const dataH = await doFetch(headlines(paramsHead));
        if ((Number(dataH && dataH['totalResults']) || 0) > 0) return mapOut(dataH);
        const dataE = await doFetch(everything(paramsEverything));
        return mapOut(dataE);
    };

    try {
        // 1) Есть категория → headlines по стране/категории (+q если задан), иначе fallback на everything
        if (useCategory) {
            return await getWithFallback(
                { country, category, ...(q ? { q } : {}) },
                { q: q || CATEGORY_Q[category] || 'новости', language: 'ru', sortBy: 'publishedAt' }
            );
        }

        // 2) Есть поиск без категории → сразу everything
        if (q) {
            const data = await doFetch(everything({ q, language: 'ru', sortBy: 'publishedAt' }));
            return mapOut(data);
        }

        // 3) Ни категории, ни поиска → headlines по стране, иначе fallback на everything с запросом «новости»
        return await getWithFallback(
            { country },
            { q: 'новости', language: 'ru', sortBy: 'publishedAt' }
        );
    } catch (e) {
        if (e?.name === 'AbortError') throw new Error('Таймаут запроса к NewsAPI (12s). Проверьте сеть/блокировщики.');
        throw e;
    } finally {
        clearTimeout(to);
    }
}

async function fetchMock({ q = '', category = 'all', page = 1, pageSize = 12 }){
    const res = await fetch('/src/mocks/news.json');
    const data = await res.json();
    let items = data.articles || [];
    if(category && category !== 'all') items = items.filter(a => (a.category || 'general') === category);
    if(q) {
        const needle = q.toLowerCase();
        items = items.filter(a => (a.title+" "+(a.description||'')).toLowerCase().includes(needle));
    }
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize).map(normalizeArticle);
    return { articles: paged, hasMore: start + pageSize < items.length };
}


export async function fetchNews(args){
    if(USE_MOCK) return fetchMock(args);
    if(!API_KEY) throw new Error('Отсутствует VITE_NEWS_API_KEY');
    return fetchReal(args);
}