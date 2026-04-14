import { Toaster } from 'sonner';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
    return (
        <ErrorBoundary>
            <Toaster position="top-center" richColors closeButton />
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <BrowserRouter>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </BrowserRouter>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
}

export default App;

