export const actionTypes = {
    SET_QUERY: 'SET_QUERY',
    SET_CATEGORY: 'SET_CATEGORY',
    RESET_FEED: 'RESET_FEED',
    FETCH_START: 'FETCH_START',
    FETCH_SUCCESS: 'FETCH_SUCCESS',
    FETCH_ERROR: 'FETCH_ERROR',
};


export const initialState = {
    query: '',
    category: 'all',
    articles: [],
    page: 0,
    hasMore: true,
    status: 'idle', // idle | loading | error | success
    error: null,
};


export function newsReducer(state, action){
    switch(action.type){
        case actionTypes.SET_QUERY:
            return { ...state, query: action.payload };
        case actionTypes.SET_CATEGORY:
            return { ...state, category: action.payload };
        case actionTypes.RESET_FEED:
            return { ...state, articles: [], page: 0, hasMore: true };
        case actionTypes.FETCH_START:
            return { ...state, status: 'loading', error: null };
        case actionTypes.FETCH_SUCCESS: {
            const nextArticles = action.payload.replace
                ? action.payload.articles
                : [...state.articles, ...action.payload.articles];
            return {
                ...state,
                status: 'success',
                articles: nextArticles,
                page: action.payload.page,
                hasMore: action.payload.hasMore,
            };
        }
        case actionTypes.FETCH_ERROR:
            return { ...state, status: 'error', error: action.payload };
        default:
            return state;
    }
}