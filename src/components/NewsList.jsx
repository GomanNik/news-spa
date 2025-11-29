import NewsCard from './NewsCard.jsx';


export default function NewsList({ items }){
    if(!items?.length) return null;
    return (
        <section className="grid" aria-label="Список новостей">
            {items.map(a => <NewsCard key={a.id} article={a} />)}
        </section>
    );
}