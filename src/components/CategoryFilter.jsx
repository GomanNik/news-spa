import { useNews } from '../context/NewsContext.jsx';
import { actionTypes } from '../reducers/newsReducer.js';


const CATEGORIES = [
    { value:'all', label:'Все' },
    { value:'business', label:'Бизнес' },
    { value:'entertainment', label:'Развлечения' },
    { value:'general', label:'Общее' },
    { value:'health', label:'Здоровье' },
    { value:'science', label:'Наука' },
    { value:'sports', label:'Спорт' },
    { value:'technology', label:'Технологии' },
];


export default function CategoryFilter(){
    const { state, dispatch } = useNews();
    return (
        <select
            className="select"
            value={state.category}
            onChange={(e)=> dispatch({ type: actionTypes.SET_CATEGORY, payload: e.target.value })}
            aria-label="Категория"
        >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
    );
}