import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { NewsProvider } from './context/NewsContext.jsx';


createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <NewsProvider>
                <App />
            </NewsProvider>
        </BrowserRouter>
    </React.StrictMode>
);