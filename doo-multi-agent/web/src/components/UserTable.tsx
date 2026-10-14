import React from 'react';

interface UserItem {
  username: string;
  user: { id: string; name: string; role: string; classId?: string; avatar?: string };
}

interface UserTableProps {
  users: UserItem[];
  classNameMap: Record<string, string>;
  editingUser: string | null;
  newPassword: string;
  onToggleEditing: (username: string) => void;
  onPasswordChange: (value: string) => void;
  onResetPassword: (username: string) => void;
  onEdit: (username: string, user: UserItem['user']) => void;
  onDelete: (username: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  classNameMap,
  editingUser,
  newPassword,
  onToggleEditing,
  onPasswordChange,
  onResetPassword,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="users-table-card">
      <table className="users-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>姓名</th>
            <th>班级</th>
            <th>头像</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ username, user: u }) => (
            <tr key={username}>
              <td>{username}</td>
              <td>{u.name}</td>
              <td>{classNameMap[u.classId || ''] || u.classId || '-'}</td>
              <td>{u.avatar || '👤'}</td>
              <td>
                <div className="action-btns">
                  <button
                    className="btn-small btn-edit"
                    onClick={() => onEdit(username, u)}
                  >
                    编辑
                  </button>
                  <button
                    className="btn-small btn-edit"
                    onClick={() => onToggleEditing(username)}
                  >
                    {editingUser === username ? '取消' : '重置密码'}
                  </button>
                  <button
                    className="btn-small btn-delete"
                    onClick={() => onDelete(username)}
                  >
                    删除
                  </button>
                </div>
                {editingUser === username && (
                  <div className="reset-password-form">
                    <input
                      type="password"
                      className="input-field"
                      placeholder="输入新密码"
                      value={newPassword}
                      onChange={(e) => onPasswordChange(e.target.value)}
                    />
                    <button
                      className="btn-small btn-confirm"
                      onClick={() => onResetPassword(username)}
                    >
                      确认
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;