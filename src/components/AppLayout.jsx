import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout() {
    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.mainWrapper}>
                <Navbar />
                <main style={styles.contentArea}>
                    <div style={styles.content}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-main)',
        overflowX: 'hidden',
    },
    mainWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'var(--sidebar-width)',
        minWidth: 0, // Critical for Recharts to calculate responsive width
        width: 'calc(100% - var(--sidebar-width))',
    },
    contentArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(var(--navbar-height) + 3rem) 2.5rem 2rem', // Increased offset for navbar clearance
    },
    content: {
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        flex: 1,
    }
};
