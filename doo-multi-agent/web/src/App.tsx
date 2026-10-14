import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AssessPage from './pages/AssessPage';
import PortraitPage from './pages/PortraitPage';
import ClassStatsPage from './pages/ClassStatsPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminConfigPage from './pages/AdminConfigPage';
import LoginPage from './pages/LoginPage';
import './App.css';

/**
 * 已登录应用骨架：左侧导航 + 主内容区（hash 路由，刷新/前进后退/分享均可用，
 * 兼容静态托管无需服务端 rewrite）。
 */
function AppShell() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assess" element={<AssessPage />} />
          <Route path="/portraits" element={<PortraitPage />} />
          <Route path="/portrait/:childId" element={<PortraitPage />} />
          <Route path="/class-stats" element={<ClassStatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin-users" element={<AdminUsersPage />} />
          <Route path="/admin-config" element={<AdminConfigPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  return <AppShell />;
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;