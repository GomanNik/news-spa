export default function ErrorBanner({ message, onRetry }){
    return (
        <div className="error" role="alert">
            <div>{message}</div>
            {onRetry && <button className="btn" onClick={onRetry}>Повторить</button>}
        </div>
    );
}