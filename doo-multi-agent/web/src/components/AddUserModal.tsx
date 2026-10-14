import React, { useState } from 'react';

interface AddUserModalProps {
  classes: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (form: { username: string; password: string; name: string; classId: string }) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ classes, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    classId: classes[0]?.id || 'class_001',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>新增老师</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              className="input-field"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="至少3个字符"
              required
            />
          </div>
          <div className="form-group">
            <label>姓名</label>
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入姓名"
              required
            />
          </div>
          <div className="form-group">
            <label>所属班级</label>
            <select
              className="input-field"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="至少6个字符"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;