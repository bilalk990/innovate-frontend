import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

export default function PublicLayout() {
    return (
        <div className="public-layout min-h-screen bg-black text-white selection:bg-brand selection:text-white">
            <PublicNavbar />
            <main>
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
}

