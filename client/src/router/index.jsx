import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';

import AdminLogin from '../pages/auth/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFound from '../pages/NotFound';
import AppLayout from '../AppLayout';
import ProtectedRoute from './ProtectedRoute';
import PersonnelManagement from '../pages/admin/PersonnelManagement';
import EmplacementManagement from '../pages/admin/EmplacementManagement';
import GuardManagement from '../pages/admin/GuardManagement';
import KioskManagement from '../pages/admin/KioskManagement';
const AppRouter = () => {
  return (
      <BrowserRouter>
    <AuthProvider>
    
        <Routes>
          {/* App layout wraps everything */}
          <Route path="/" element={<AppLayout />}>
            {/* Public route */}
            <Route index element={<AdminLogin />} />

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


            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
         </AuthProvider>
      </BrowserRouter>
   
  );
};

export default AppRouter;
