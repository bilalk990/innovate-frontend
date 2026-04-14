import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div>
            <div>🔍</div>
            <h1>Page Not Found</h1>
            <p>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link to="/">← Back to Home</Link>
        </div>
    );
}
