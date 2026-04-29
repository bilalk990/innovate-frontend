import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

export default function PublicLayout() {
    return (
        <div className="public-layout min-h-screen bg-black text-white selection:bg-brand selection:text-white">
            <PublicNavbar />
            <main>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Suspense fallback={null}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}

