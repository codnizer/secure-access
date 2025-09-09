import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';

import AdminLogin from '../pages/auth/AdminLogin';
import GuardLogin from '../pages/auth/GuardLogin'; // New guard login page
import AdminDashboard from '../pages/admin/AdminDashboard';
import GuardDashboard from '../pages/guard/GuardDashboard'; // New guard dashboard
import NotFound from '../pages/NotFound';
import AppLayout from '../AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PersonnelManagement from '../pages/admin/PersonnelManagement';
import EmplacementManagement from '../pages/admin/EmplacementManagement';
import GuardManagement from '../pages/admin/GuardManagement';
import KioskManagement from '../pages/admin/KioskManagement';
import KioskPublicAccess from '../pages/public/KioskPublicAccess';
import KioskScanner from '../pages/public/KioskScanner';
// Guard-specific pages
/* import GuardProfile from '../pages/guard/GuardProfile';
import GuardAssignments from '../pages/guard/GuardAssignments';
import GuardReports from '../pages/guard/GuardReports'; */

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* App layout wraps everything */}
          <Route path="/" element={<AppLayout />}>
            {/* Public routes */}
            <Route index element={<AdminLogin />} />
            <Route path="guard-login" element={<GuardLogin />} />
<Route path="/kiosk" element={<KioskPublicAccess />} />
<Route path="/kiosk/scanner/:kioskId" element={<KioskScanner />} />
            {/* Protected admin routes */}
            <Route
              path="admin"
              element={<ProtectedRoute allowedRoles={['admin']} />}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="personnel" element={<PersonnelManagement />} />
              <Route path="emplacements" element={<EmplacementManagement />} />
              <Route path="guards" element={<GuardManagement />} />
              <Route path="kiosks" element={<KioskManagement />} />
            </Route>

            {/* Protected guard routes */}
            <Route
              path="guard"
              element={<ProtectedRoute allowedRoles={['guard']} />}
            >
              <Route path="dashboard" element={<GuardDashboard />} />
             {/*  <Route path="profile" element={<GuardProfile />} />
              <Route path="assignments" element={<GuardAssignments />} />
              <Route path="reports" element={<GuardReports />} /> */}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
