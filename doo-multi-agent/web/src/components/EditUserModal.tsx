import React, { useState } from 'react';

const AVATARS = ['👩‍🏫', '👨‍🏫', '👩‍🎓', '👨‍🎓', '👩‍💼', '👨‍💼', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨'];

interface EditUserModalProps {
  classes: Array<{ id: string; name: string }>;
  initial: { username: string; name: string; classId: string; avatar: string };
  onClose: () => void;
  onSubmit: (updates: { name: string; classId: string; avatar: string }) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ classes, initial, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: initial.name,
    classId: initial.classId,
    avatar: initial.avatar,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>编辑老师信息</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              className="input-field"
              value={initial.username}
              disabled
              readOnly
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
            <label>选择头像</label>
            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-option ${form.avatar === avatar ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, avatar })}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;