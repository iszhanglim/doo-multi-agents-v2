import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../hooks/useClasses';

const LoginPage: React.FC = () => {
  const { login, register, updatePassword, logout } = useAuth();
  const { classes } = useClasses();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  // P0：默认口令登录成功后必须修改密码才能进入系统
  const [mustChange, setMustChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        if (!classId) {
          setError('请选择所属班级');
          setLoading(false);
          return;
        }
        const result = await register(username, password, name, classId);
        if (result.success) {
          setSuccess('注册成功！请登录');
          setIsRegister(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          setError(result.message);
        }
      } else {
        const result = await login(username, password);
        if (!result.ok) {
          setError('用户名或密码错误');
        } else if (result.mustChangePassword) {
          // 默认口令：强制先改密
          setMustChange(true);
          setSuccess('首次使用默认密码登录，请先设置新密码');
        }
      }
    } catch {
      setError(isRegister ? '注册失败，请重试' : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 6) {
      setError('新密码至少 6 个字符');
      return;
    }
    if (newPassword !== confirmNew) {
      setError('两次输入的新密码不一致');
      return;
    }
    setChangeLoading(true);
    const result = await updatePassword(password, newPassword);
    setChangeLoading(false);
    if (result.success) {
      // 改密成功后登出当前会话，要求用新密码重新登录（确保走完整鉴权）
      logout();
      setPassword('');
      setNewPassword('');
      setConfirmNew('');
      setMustChange(false);
      setIsRegister(false);
      setSuccess('密码已更新，请使用新密码登录');
    } else {
      setError(result.message);
    }
  };

  const toggleMode = () => {
    if (mustChange) return;
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <span className="brand-icon">🎯</span>
          <h1 className="brand-font">DOO 多智能体系统</h1>
          <p>幼儿叙事能力评估平台</p>
        </div>

        {mustChange ? (
          <form onSubmit={handleChangePassword} className="login-form">
            <div className="must-change-tip">
              检测到您正在使用默认密码登录，为保障账号安全，请先设置新密码后才能进入系统。
            </div>
            <div className="form-group">
              <label>原默认密码</label>
              <input
                type="password"
                className="input-field"
                placeholder="请输入当前使用的默认密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                readOnly={!password}
                required
              />
            </div>
            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                className="input-field"
                placeholder="请输入新密码（至少6个字符）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                className="input-field"
                placeholder="请再次输入新密码"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <button type="submit" className="btn-primary login-btn" disabled={changeLoading}>
              {changeLoading ? '提交中...' : '设置新密码'}
            </button>
          </form>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              className="input-field"
              placeholder={isRegister ? '请输入用户名（至少3个字符）' : '请输入用户名'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>姓名</label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {isRegister && (
            <div className="form-group">
              <label>所属班级</label>
              <select
                className="input-field"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">请选择班级</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              className="input-field"
              placeholder={isRegister ? '请输入密码（至少6个字符）' : '请输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>确认密码</label>
              <input
                type="password"
                className="input-field"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注 册' : '登 录')}
          </button>
        </form>
        </>
        )}

        <div className="login-toggle">
          <button type="button" className="toggle-btn" onClick={toggleMode}>
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>

        {/* P0 修复：测试凭据仅在开发环境展示，生产环境不暴露默认账号 */}
        {!isRegister && !mustChange && import.meta.env.DEV && (
          <div className="login-hint">
            <p>测试账号：</p>
            <code>teacher1 / 123456</code>
            <code>teacher2 / 123456</code>
            <code>admin / admin</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;