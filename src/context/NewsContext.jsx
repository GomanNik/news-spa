// @ts-nocheck
import { createContext, useContext, useMemo, useReducer, useEffect, useCallback, useRef } from 'react';
import { newsReducer, initialState, actionTypes } from '../reducers/newsReducer.js';
import { fetchNews } from '../services/newsApi.js';
import { useDebounce } from '../hooks/useDebounce.js';

const NewsContext = createContext(null);

export function NewsProvider({ children }) {
    const errorUntilRef = useRef(0);
    const [state, dispatch] = useReducer(newsReducer, initialState, (s) => s);
    const lastKeyRef = useRef('');

    // Дебаунсим только текст запроса, чтобы не спамить API при наборе
    const debouncedQuery = useDebounce(state.query, 600);

    const loadMore = useCallback(
        async (page = state.page + 1, replace = false) => {
            if (state.status === 'loading') return;
            if (Date.now() < errorUntilRef.current) return; // кулдаун после ошибки
            dispatch({ type: actionTypes.FETCH_START, payload: { page, replace } });
            try {
                const { articles, hasMore } = await fetchNews({
                    q: debouncedQuery,            // <-- используем дебаунс-значение
                    category: state.category,
                    page,
                    pageSize: 12,
                });
                dispatch({
                    type: actionTypes.FETCH_SUCCESS,
                    payload: { articles, page, hasMore, replace },
                });
            } catch (err) {
                errorUntilRef.current = Date.now() + 5000;
                dispatch({
                    type: actionTypes.FETCH_ERROR,
                    payload: err?.message || 'Ошибка загрузки',
                });
            }
        },
        [state.page, state.status, state.category, debouncedQuery]
    );

    const resetHome = useCallback(() => {
        lastKeyRef.current = '';
        dispatch({ type: actionTypes.SET_QUERY, payload: '' });
        dispatch({ type: actionTypes.SET_CATEGORY, payload: 'all' });
        dispatch({ type: actionTypes.RESET_FEED });
        // загрузка стартует из эффекта, когда debouncedQuery станет '' (через 600 мс)
    }, []);

    // Автозагрузка при смене (debounced) поиска/категории
    useEffect(() => {
        const key = `${debouncedQuery}|${state.category}`;
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;

        dispatch({ type: actionTypes.RESET_FEED });
        void loadMore(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery, state.category]);

    const value = useMemo(() => ({ state, dispatch, loadMore, resetHome }), [state, loadMore, resetHome]);
    return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}

export function useNews() {
    const ctx = useContext(NewsContext);
    if (!ctx) throw new Error('useNews must be used within NewsProvider');
    return ctx;
}
