import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems: { path: string; label: string; icon: string; adminOnly?: boolean }[] = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/assess', label: '叙事评估', icon: '📝' },
  { path: '/portraits', label: '幼儿画像', icon: '👶' },
  { path: '/class-stats', label: '班级统计', icon: '📊' },
  { path: '/profile', label: '个人中心', icon: '👤' },
  { path: '/admin-users', label: '教师管理', icon: '⚙️', adminOnly: true },
  { path: '/admin-config', label: '班级与场景', icon: '🏫', adminOnly: true },
];

function useNavItems() {
  const { user } = useAuth();
  return menuItems.filter((item) => !item.adminOnly || user?.role === 'admin');
}

/** 桌面端侧边栏 + 移动端顶部抽屉导航（<900px 用汉堡按钮展开） */
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const items = useNavItems();

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <>
      {/* 移动端顶部导航栏 */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" aria-label="打开菜单" onClick={() => setOpen((v) => !v)}>
          {open ? '✕' : '☰'}
        </button>
        <div className="mobile-brand">
          <span className="logo-icon">🎯</span>
          <span className="brand-font">DOO智能体</span>
        </div>
        <span className="mobile-avatar">{user?.avatar || '👤'}</span>
      </div>

      {/* 移动端抽屉遮罩 */}
      {open && <div className="mobile-drawer-overlay" onClick={() => setOpen(false)} />}

      {/* 导航（桌面固定侧栏 / 移动端抽屉） */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <div className="logo-text">
              <h2 className="brand-font">DOO智能体</h2>
              <span className="logo-subtitle">叙事能力评估</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="user-info">
            <span className="user-avatar">{user.avatar || '👤'}</span>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role === 'admin' ? '管理员' : '教师'}</span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="agent-status">
            <div className="agent-item">
              <span className="agent-dot active" />
              <span className="agent-name">D博士</span>
              <span className="agent-role">专家</span>
            </div>
            <div className="agent-item">
              <span className="agent-dot active" />
              <span className="agent-name">小欧老师</span>
              <span className="agent-role">助教</span>
            </div>
            <div className="agent-item">
              <span className="agent-dot active" />
              <span className="agent-name">多多</span>
              <span className="agent-role">同伴</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;