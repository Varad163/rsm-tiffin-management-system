import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentDashboard from '../pages/student/Dashboard';
import { useAuth } from '../context/AuthContext';

const RoleRedirect = () => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isStudent) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

const PlaceholderPage = ({ title }) => (
  <div className="space-y-4">
    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{title}</h1>
    <p className="text-zinc-500">This module will be implemented next.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<PlaceholderPage title="Student Management" />} />
        <Route path="attendance" element={<PlaceholderPage title="Attendance Management" />} />
        <Route path="menus" element={<PlaceholderPage title="Menu Management" />} />
        <Route path="orders" element={<PlaceholderPage title="Order Management" />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
        <Route path="attendance" element={<PlaceholderPage title="My Attendance" />} />
        <Route path="menus" element={<PlaceholderPage title="Menus" />} />
        <Route path="orders" element={<PlaceholderPage title="My Orders" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
