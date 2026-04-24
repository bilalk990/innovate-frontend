import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PrivateRoutes from './PrivateRoutes';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

// Layouts (kept eager — tiny, needed immediately)
import AdminLayout from '../layouts/AdminLayout';
import RecruiterLayout from '../layouts/RecruiterLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';

// Auth (eager — first thing users see)
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// All page components lazy-loaded — split into separate chunks
const CandidateDashboard    = lazy(() => import('../pages/candidate/Dashboard'));
const InterviewRoom         = lazy(() => import('../pages/candidate/InterviewRoom'));
const InterviewLobby        = lazy(() => import('../pages/candidate/InterviewLobby'));
const AIInsights            = lazy(() => import('../pages/candidate/AIInsights'));
const MyInterviews          = lazy(() => import('../pages/candidate/MyInterviews'));
const ResumeUpload          = lazy(() => import('../pages/candidate/ResumeUpload'));
const ProfileWizard         = lazy(() => import('../pages/candidate/ProfileWizard'));
const BrowseJobs            = lazy(() => import('../pages/candidate/BrowseJobs'));
const Profile               = lazy(() => import('../pages/candidate/Profile'));
const InterviewDebrief      = lazy(() => import('../pages/candidate/InterviewDebrief'));
const MyApplications        = lazy(() => import('../pages/candidate/MyApplications'));
const ResumeBuilder         = lazy(() => import('../pages/candidate/ResumeBuilder'));
const MockInterview         = lazy(() => import('../pages/candidate/MockInterview'));
const SalaryNegotiator      = lazy(() => import('../pages/candidate/SalaryNegotiator'));
const CareerPath            = lazy(() => import('../pages/candidate/CareerPath'));

const RecruiterDashboard    = lazy(() => import('../pages/recruiter/Dashboard'));
const ScheduleInterview     = lazy(() => import('../pages/recruiter/ScheduleInterview'));
const Candidates            = lazy(() => import('../pages/recruiter/Candidates'));
const JobPostings           = lazy(() => import('../pages/recruiter/JobPostings'));
const JobApplicants         = lazy(() => import('../pages/recruiter/JobApplicants'));
const RecruiterProfileWizard = lazy(() => import('../pages/recruiter/RecruiterProfileWizard'));
const RecruiterProfile      = lazy(() => import('../pages/recruiter/RecruiterProfile'));
const GoogleCalendarCallback = lazy(() => import('../pages/recruiter/GoogleCalendarCallback'));
const CandidateRanking      = lazy(() => import('../pages/recruiter/CandidateRanking'));
const QuestionBank          = lazy(() => import('../pages/recruiter/QuestionBank'));
const CandidateProfile      = lazy(() => import('../pages/recruiter/CandidateProfile'));
const JDAnalyzer            = lazy(() => import('../pages/recruiter/JDAnalyzer'));

const AdminDashboard        = lazy(() => import('../pages/admin/Dashboard'));
const Users                 = lazy(() => import('../pages/admin/Users'));
const Reports               = lazy(() => import('../pages/admin/Reports'));
const Settings              = lazy(() => import('../pages/admin/Settings'));

const Home                  = lazy(() => import('../pages/common/Home'));
const Features              = lazy(() => import('../pages/common/Features'));
const PublicJobs            = lazy(() => import('../pages/common/PublicJobs'));
const NotFound              = lazy(() => import('../pages/common/NotFound'));
const EvaluationReport      = lazy(() => import('../pages/common/EvaluationReport'));

function RoleRedirect() {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/" replace />;
    if (user?.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
    if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
}

export default function AppRoutes() {
    const { hasHydrated } = useAuth();

    if (!hasHydrated) {
        return <Loader fullScreen text="Setting up your workspace..." />;
    }

    return (
        <Suspense fallback={<Loader fullScreen text="Securely loading platform content..." />}>
        <Routes>
            {/* Public Pages - With Navbar */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/features" element={<Features />} />
                <Route path="/jobs" element={<PublicJobs />} />
            </Route>

            {/* Auth Pages - Without Navbar */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Dashboard Entry (Role-based redirect) */}
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* Interview Room (full-screen, no sidebar) */}
            <Route path="/interview/room/:roomId" element={
                <PrivateRoutes allowedRoles={['candidate', 'recruiter', 'admin']}>
                    <InterviewRoom />
                </PrivateRoutes>
            } />

            {/* Candidate */}
            <Route path="/candidate" element={
                <PrivateRoutes allowedRoles={['candidate']}>
                    <CandidateLayout />
                </PrivateRoutes>
            }>
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="interviews" element={<MyInterviews />} />
                <Route path="ai-insights" element={<AIInsights />} />
                <Route path="resume" element={<ResumeUpload />} />
                <Route path="resume-builder" element={<ResumeBuilder />} />
                <Route path="profile-setup" element={<ProfileWizard />} />
                <Route path="jobs" element={<BrowseJobs />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="evaluations/:evalId" element={<EvaluationReport />} />
                <Route path="evaluations/:evalId/debrief" element={<InterviewDebrief />} />
                <Route path="interview/lobby/:roomId" element={<InterviewLobby />} />
                {/* Category 1: New AI Features */}
                <Route path="mock-interview" element={<MockInterview />} />
                <Route path="salary-negotiator" element={<SalaryNegotiator />} />
                <Route path="career-path" element={<CareerPath />} />
            </Route>

            {/* Recruiter */}
            <Route path="/recruiter" element={
                <PrivateRoutes allowedRoles={['recruiter']}>
                    <RecruiterLayout />
                </PrivateRoutes>
            }>
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="profile-setup" element={<RecruiterProfileWizard />} />
                <Route path="profile" element={<RecruiterProfile />} />
                <Route path="google-callback" element={<GoogleCalendarCallback />} />
                <Route path="schedule" element={<ScheduleInterview />} />
                <Route path="jobs" element={<JobPostings />} />
                <Route path="jobs/:jobId/applicants" element={<JobApplicants />} />
                <Route path="candidates" element={<Candidates />} />
                <Route path="evaluations/:evalId" element={<EvaluationReport />} />
                <Route path="ranking" element={<CandidateRanking />} />
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="jd-analyzer" element={<JDAnalyzer />} />
                <Route path="applications" element={<JobApplicants />} />
                <Route path="pipeline" element={<Candidates />} />
                <Route path="messages" element={<RecruiterDashboard />} />
                <Route path="candidates/:candidateId" element={<CandidateProfile />} />
                <Route path="settings" element={<RecruiterProfile />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={
                <PrivateRoutes allowedRoles={['admin']}>
                    <AdminLayout />
                </PrivateRoutes>
            }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<RecruiterProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="/unauthorized" element={
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <div className="text-6xl">🚫</div>
                    <h2 className="text-2xl font-black uppercase">Access Denied</h2>
                    <p className="text-gray-500">You don't have permission to view this page.</p>
                    <a href="/" className="text-red-600 font-bold underline">← Go Home</a>
                </div>
            } />
            <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
    );
}
