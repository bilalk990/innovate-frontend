import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function DashboardShell({ role }) {
    return (
        <div>
            <Sidebar role={role} />
            <div>
                <Navbar />
                <div>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export function AdminLayout() { return <DashboardShell role="admin" />; }
export function RecruiterLayout() { return <DashboardShell role="recruiter" />; }
export function CandidateLayout() { return <DashboardShell role="candidate" />; }

export default AdminLayout;
