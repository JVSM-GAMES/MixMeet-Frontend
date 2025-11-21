import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NicknamePage from './pages/NicknamePage';
import HomePage from './pages/HomePage';

// Rota Protegida: Exige apenas Token JWT
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Rota Protegida Completa: Exige Token + Nickname
const FullyPrivateRoute = () => {
    const { isAuthenticated, userProfile, loading } = useAuth();
    
    if (loading) return <Center h="100vh"><Spinner size="xl" /></Center>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    // Se tem token mas não tem perfil, manda configurar o nickname
    if (!userProfile) return <Navigate to="/setup" replace />;

    return <Outlet />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas que exigem login básico (para configurar nickname) */}
      <Route element={<PrivateRoute />}>
         <Route path="/setup" element={<NicknamePage />} />
      </Route>

      {/* Rotas que exigem login + nickname configurado */}
      <Route element={<FullyPrivateRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;