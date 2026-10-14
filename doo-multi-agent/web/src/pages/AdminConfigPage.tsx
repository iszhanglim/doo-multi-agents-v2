import React, { useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { useScenarios } from '../hooks/useScenarios';
import { api } from '../services/api';

/**
 * 管理员配置中心：班级管理（增删改/重命名） + 场景库管理（启停/编辑）。
 * 班级与场景均持久化到 PostgreSQL，测评页/统计页从接口动态读取。
 */
const AdminConfigPage: React.FC = () => {
  const [tab, setTab] = useState<'classes' | 'scenarios'>('classes');
  const { classes, refetch: refetchClasses } = useClasses();
  const { scenarios, refetch: refetchScenarios } = useScenarios(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  // 班级表单
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // 场景表单
  const [newSceneId, setNewSceneId] = useState('');
  const [newSceneLabel, setNewSceneLabel] = useState('');
  const [newSceneDesc, setNewSceneDesc] = useState('');

  const flash = (msg: string) => {
    setFeedback(msg);
    setError('');
    setTimeout(() => setFeedback(''), 3000);
  };
  const fail = (msg: string) => {
    setError(msg);
    setFeedback('');
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return fail('请输入班级名称');
    const id = `class_${Date.now().toString(36)}`;
    try {
      await api.createClass({ id, name: newName.trim() });
      setNewName('');
      flash('班级已创建');
      refetchClasses();
    } catch (err) {
      fail(err instanceof Error ? err.message : '创建失败');
    }
  };

  const handleRenameClass = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await api.updateClass(id, editName.trim());
      setEditId(null);
      setEditName('');
      flash('班级已重命名');
      refetchClasses();
    } catch (err) {
      fail(err instanceof Error ? err.message : '重命名失败');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm('确定删除该班级？删除后其下幼儿与统计将不再归属此班级。')) return;
    try {
      await api.deleteClass(id);
      flash('班级已删除');
      refetchClasses();
    } catch (err) {
      fail(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleAddScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSceneId.trim() || !newSceneLabel.trim()) return fail('请填写场景标识与名称');
    try {
      const id = newSceneId.trim() === 'auto' ? `scene_${Date.now().toString(36)}` : newSceneId.trim();
      await api.createScenario({ id, label: newSceneLabel.trim(), description: newSceneDesc.trim() });
      setNewSceneId(''); setNewSceneLabel(''); setNewSceneDesc('');
      flash('场景已创建');
      refetchScenarios();
    } catch (err) {
      fail(err instanceof Error ? err.message : '场景创建失败');
    }
  };

  const handleToggleScenario = async (id: string, enabled: boolean) => {
    try {
      await api.updateScenario(id, { enabled });
      flash(enabled ? '场景已启用' : '场景已停用');
      refetchScenarios();
    } catch (err) {
      fail(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!window.confirm('确定删除该场景？')) return;
    try {
      await api.deleteScenario(id);
      flash('场景已删除');
      refetchScenarios();
    } catch (err) {
      fail(err instanceof Error ? err.message : '删除失败');
    }
  };

  return (
    <div className="config-page">
      <div className="page-head">
        <h1 className="page-title">班级与场景管理</h1>
        <p className="page-desc">管理测评班级与场景库，配置变更会实时同步到测评与统计页面。</p>
      </div>

      <div className="config-tabs">
        <button className={`config-tab ${tab === 'classes' ? 'active' : ''}`} onClick={() => setTab('classes')}>
          🏫 班级管理
        </button>
        <button className={`config-tab ${tab === 'scenarios' ? 'active' : ''}`} onClick={() => setTab('scenarios')}>
          🎬 场景库
        </button>
      </div>

      {feedback && <div className="config-feedback">{feedback}</div>}
      {error && <div className="config-error">{error}</div>}

      {tab === 'classes' && (
        <div className="config-panel">
          <form onSubmit={handleAddClass} className="config-form">
            <input
              className="input-field"
              placeholder="请输入新班级名称，如：大班五班"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="btn-primary config-form-btn">新增班级</button>
          </form>

          <div className="config-list">
            {classes.length === 0 && <div className="config-empty">暂无班级，请先创建。</div>}
            {classes.map((cls) => (
              <div key={cls.id} className="config-row">
                {editId === cls.id ? (
                  <>
                    <input
                      className="input-field config-row-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <button className="btn-secondary config-mini" onClick={() => handleRenameClass(cls.id)}>保存</button>
                    <button className="btn-ghost config-mini" onClick={() => { setEditId(null); setEditName(''); }}>取消</button>
                  </>
                ) : (
                  <>
                    <span className="config-row-name">{cls.name}</span>
                    <span className="config-row-id">{cls.id}</span>
                    <button
                      className="btn-secondary config-mini"
                      onClick={() => { setEditId(cls.id); setEditName(cls.name); }}
                    >
                      重命名
                    </button>
                    <button className="btn-danger config-mini" onClick={() => handleDeleteClass(cls.id)}>删除</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'scenarios' && (
        <div className="config-panel">
          <form onSubmit={handleAddScenario} className="config-form">
            <input
              className="input-field"
              placeholder="场景标识（英文，如 area_activity）"
              value={newSceneId}
              onChange={(e) => setNewSceneId(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="场景名称，如：区域活动"
              value={newSceneLabel}
              onChange={(e) => setNewSceneLabel(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="场景描述（选填）"
              value={newSceneDesc}
              onChange={(e) => setNewSceneDesc(e.target.value)}
            />
            <button type="submit" className="btn-primary config-form-btn">新增场景</button>
          </form>

          <div className="config-list">
            {scenarios.length === 0 && <div className="config-empty">暂无场景。</div>}
            {scenarios.map((scene) => (
              <div key={scene.id} className="config-row">
                <span className="config-row-name">{scene.label}</span>
                <span className={`config-badge ${scene.enabled ? 'on' : 'off'}`}>
                  {scene.enabled ? '启用' : '停用'}
                </span>
                <button
                  className="btn-secondary config-mini"
                  onClick={() => handleToggleScenario(scene.id, !scene.enabled)}
                >
                  {scene.enabled ? '停用' : '启用'}
                </button>
                <button className="btn-danger config-mini" onClick={() => handleDeleteScenario(scene.id)}>删除</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfigPage;