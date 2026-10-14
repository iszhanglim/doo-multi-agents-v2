import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AVATARS = ['👩‍🏫', '👨‍🏫', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨'];

const ProfilePage: React.FC = () => {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👩‍🏫');

  // 当user变化时同步状态
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSelectedAvatar(user.avatar || '👩‍🏫');
    }
  }, [user]);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const updates: { name?: string; avatar?: string } = {};
      if (name && name !== user?.name) updates.name = name;
      if (selectedAvatar !== user?.avatar) updates.avatar = selectedAvatar;

      if (Object.keys(updates).length === 0) {
        setProfileError('没有需要修改的信息');
        setProfileLoading(false);
        return;
      }

      const success = await updateProfile(updates);
      if (success) {
        setProfileSuccess('个人信息修改成功');
      } else {
        setProfileError('修改失败，请重试');
      }
    } catch {
      setProfileError('修改失败，请重试');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await updatePassword(oldPassword, newPassword);
      if (result.success) {
        setPasswordSuccess(result.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(result.message);
      }
    } catch {
      setPasswordError('修改失败，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page animate-fade-in-up">
      <header className="page-header">
        <h1 className="brand-font gradient-text">个人中心</h1>
        <p>管理您的个人信息和账号安全</p>
      </header>

      <div className="profile-layout">
        {/* User Info Card */}
        <div className="profile-card info-card">
          <div className="profile-header">
            <div className="profile-avatar-large">{user?.avatar || '👤'}</div>
            <div className="profile-meta">
              <h2>{user?.name}</h2>
              <span className="profile-role">{user?.role === 'admin' ? '管理员' : '教师'}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="profile-card">
          <h3>📝 修改个人信息</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>姓名</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
              />
            </div>

            <div className="form-group">
              <label>选择头像</label>
              <div className="avatar-grid">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${selectedAvatar === avatar ? 'active' : ''}`}
                    onClick={() => setSelectedAvatar(avatar)}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {profileError && <div className="form-error">{profileError}</div>}
            {profileSuccess && <div className="form-success">{profileSuccess}</div>}

            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? '保存中...' : '保存修改'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h3>🔐 修改密码</h3>
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label>原密码</label>
              <input
                type="password"
                className="input-field"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入原密码"
                required
              />
            </div>

            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少6个字符）"
                required
              />
            </div>

            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                className="input-field"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="请再次输入新密码"
                required
              />
            </div>

            {passwordError && <div className="form-error">{passwordError}</div>}
            {passwordSuccess && <div className="form-success">{passwordSuccess}</div>}

            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? '修改中...' : '修改密码'}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="profile-card logout-card">
          <button className="btn-danger" onClick={logout}>
            🚪 退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
