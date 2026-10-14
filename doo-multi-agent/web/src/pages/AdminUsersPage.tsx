import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClasses } from '../hooks/useClasses';
import UserTable from '../components/UserTable';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';

interface AllUserEntry {
  username: string;
  user: { id: string; name: string; role: string; classId?: string; avatar?: string };
}

const AdminUsersPage: React.FC = () => {
  const { user, getAllUsers, adminDeleteUser, adminResetPassword, adminUpdateUser, register } = useAuth();
  const { classes } = useClasses();

  const CLASS_NAME_MAP = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    classes.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [classes]);

  const [allUsers, setAllUsers] = useState<AllUserEntry[]>([]);

  useEffect(() => {
    getAllUsers().then(setAllUsers);
  }, [getAllUsers]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInitial, setEditInitial] = useState<{ username: string; name: string; classId: string; avatar: string }>({
    username: '',
    name: '',
    classId: 'class_001',
    avatar: '👩‍🏫',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const refreshUsers = () => { getAllUsers().then(setAllUsers); };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="error-state">⚠️ 您没有权限访问此页面</div>
      </div>
    );
  }

  const handleDelete = async (username: string) => {
    if (!window.confirm(`确定要删除老师 "${username}" 吗？此操作不可恢复。`)) return;
    const success = await adminDeleteUser(username);
    if (success) {
      showMessage(`老师 "${username}" 已删除`);
      refreshUsers();
    } else {
      showError('删除失败');
    }
  };

  const handleResetPassword = async (username: string) => {
    if (!newPassword || newPassword.length < 6) {
      showError('密码至少6个字符');
      return;
    }
    const success = await adminResetPassword(username, newPassword);
    if (success) {
      showMessage(`老师 "${username}" 密码已重置`);
      setNewPassword('');
      setEditingUser(null);
    } else {
      showError('重置密码失败');
    }
  };

  const handleAddUser = async (form: { username: string; password: string; name: string; classId: string }) => {
    setError('');
    setMessage('');
    const result = await register(form.username, form.password, form.name, form.classId);
    if (result.success) {
      showMessage('老师添加成功');
      setShowAddModal(false);
      refreshUsers();
    } else {
      showError(result.message);
    }
  };

  const openEditModal = (username: string, userData: AllUserEntry['user']) => {
    setEditInitial({
      username,
      name: userData.name,
      classId: userData.classId || 'class_001',
      avatar: userData.avatar || '👩‍🏫',
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (updates: { name: string; classId: string; avatar: string }) => {
    setError('');
    setMessage('');
    const success = await adminUpdateUser(editInitial.username, {
      user: {
        name: updates.name,
        classId: updates.classId,
        avatar: updates.avatar,
      },
    });
    if (success) {
      showMessage('老师信息修改成功');
      setShowEditModal(false);
      refreshUsers();
    } else {
      showError('修改失败');
    }
  };

  return (
    <div className="admin-page animate-fade-in-up">
      <header className="page-header">
        <h1 className="brand-font gradient-text">教师管理</h1>
        <p>管理员可以新增、修改、删除所有老师信息</p>
      </header>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="admin-actions">
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ 新增老师
        </button>
      </div>

      <UserTable
        users={allUsers}
        classNameMap={CLASS_NAME_MAP}
        editingUser={editingUser}
        newPassword={newPassword}
        onToggleEditing={(username) => setEditingUser(editingUser === username ? null : username)}
        onPasswordChange={setNewPassword}
        onResetPassword={handleResetPassword}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {showEditModal && (
        <EditUserModal
          classes={classes}
          initial={editInitial}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditUser}
        />
      )}

      {showAddModal && (
        <AddUserModal
          classes={classes}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;