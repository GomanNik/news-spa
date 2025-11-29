import { Link } from 'react-router-dom';


export default function NewsCard({ article }){
    const date = new Date(article.publishedAt);
    return (
        <article className="card">
            {article.imageUrl && <img src={article.imageUrl} alt="" loading="lazy" />}
            <div className="content">
                <h3>{article.title}</h3>
                <div className="meta">
                    <span>{article.source}</span>
                    <span>•</span>
                    <time dateTime={date.toISOString()}>{date.toLocaleDateString('ru-RU')}</time>
                </div>
                {article.description && <p>{article.description}</p>}
                <div className="actions">
                    <Link className="btn" to={`/article/${article.id}`} state={{ article }}>Открыть</Link>
                    {article.url && <a className="btn" href={article.url} target="_blank" rel="noreferrer">Источник</a>}
                </div>
            </div>
        </article>
    );
}