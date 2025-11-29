import { useCallback, useMemo } from 'react';
import { useNews } from '../context/NewsContext.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import Loader from '../components/Loader.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import NewsList from '../components/NewsList.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';

export default function Home(){
    const { state, loadMore } = useNews();

    const handleLoadMore = useCallback(() => {
        // грузим только когда предыдущая загрузка успешна
        if (state.status === 'success' && state.hasMore) {
            loadMore();
        }
    }, [state.status, state.hasMore, loadMore]);

    // Автоподгрузка активна только когда уже есть контент и статус success
    const canAutoLoad = useMemo(
        () => state.status === 'success' && state.hasMore && state.articles.length > 0,
        [state.status, state.hasMore, state.articles.length]
    );

    const { sentinelRef } = useInfiniteScroll(handleLoadMore, !canAutoLoad);

    return (
        <main>
            <div className="row" style={{ gap:12, alignItems:'center', margin:'12px 0' }}>
                <SearchBar />
                <CategoryFilter />
            </div>

            {state.status === 'error' && (
                <ErrorBanner
                    message={state.error}
                    onRetry={() => loadMore(1, true)}
                />
            )}

            <NewsList items={state.articles} />

            {state.status === 'loading' && <Loader />}

            {/* Сентинел работает только когда canAutoLoad === true */}
            <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />

            {!state.hasMore && state.articles.length > 0 && (
                <div className="loader">Больше новостей нет.</div>
            )}
        </main>
    );
}
