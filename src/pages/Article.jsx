import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Article() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const article = state?.article;

    if (!article) {
        // Если перешли по прямой ссылке без state — вернуться на главную
        navigate('/', { replace: true });
        return null;
    }

    const date = new Date(article.publishedAt);
    const text = article.content || article.description || '';

    return (
        <main className="article">
            <Link className="btn back" to="/">← Назад</Link>

            <h1>{article.title}</h1>

            <div className="meta">
                <span>{article.source}</span>
                <span>•</span>
                <time dateTime={date.toISOString()}>
                    {date.toLocaleString('ru-RU')}
                </time>
            </div>

            {article.imageUrl && <img src={article.imageUrl} alt="" />}

            {article.author && (
                <div className="meta">Автор: {article.author}</div>
            )}

            {text && <p>{text}</p>}

            {article.url && (
                <a
                    className="btn"
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                >
                    Читать на источнике
                </a>
            )}

            <div style={{ height: 24 }} />
        </main>
    );
}
