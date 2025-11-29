import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Article from './pages/Article.jsx';
import { useNews } from './context/NewsContext.jsx';

export default function App(){
    const { resetHome } = useNews();
    const location = useLocation();
    const navigate = useNavigate();

    const handleHomeClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            resetHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // если мы НЕ на '/', Link просто сработает как навигация
    };

    const handleFeedClick = () => {
        // всегда переходим на главную
        if (location.pathname !== '/') navigate('/');
        else window.scrollTo({ top: 0, behavior: 'smooth' }); // если уже на главной — просто наверх
    };

    return (
        <div className="app">
            <header className="header">
                <div className="row">
                    <div className="brand">
                        <Link to="/" className="back" onClick={handleHomeClick}>Главные новости</Link>
                    </div>
                    <nav className="controls" aria-label="Навигация">
                        {/* Кнопка гарантированно работает даже если Link где-то перехватывается */}
                        <button type="button" className="btn" onClick={handleFeedClick}>Лента</button>
                    </nav>
                </div>
            </header>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:id" element={<Article />} />
            </Routes>

            <footer className="footer">© {new Date().getFullYear()} News SPA</footer>
        </div>
    );
}
