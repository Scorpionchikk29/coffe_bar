import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Orders from './pages/Orders.tsx';
import Profile from './pages/Profile.tsx';
import Checkout from './pages/Checkout.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminMenu from './pages/AdminMenu.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminSettings from './pages/AdminSettings.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin"
            element={
              <ProtectedRoute allowRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/menu"
            element={
              <ProtectedRoute allowRoles={['admin']}>
                <AdminMenu />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/settings"
            element={
              <ProtectedRoute allowRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
