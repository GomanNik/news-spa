import { useNews } from '../context/NewsContext.jsx';
import { actionTypes } from '../reducers/newsReducer.js';


export default function SearchBar(){
    const { state, dispatch } = useNews();


    return (
        <input
            className="input"
            type="search"
            placeholder="Поиск новостей..."
            value={state.query}
            onChange={(e)=> dispatch({ type: actionTypes.SET_QUERY, payload: e.target.value })}
            aria-label="Поиск"
        />
    );
}