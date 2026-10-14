import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStats } from '../hooks/useStats';
import { useActivities } from '../hooks/useActivities';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading } = useStats();
  const { activities, loading: activitiesLoading } = useActivities();

  const statsData = [
    {
      label: '已评估幼儿',
      value: stats?.totalChildren ?? 0,
      icon: '👶',
      color: '#FF8C42',
    },
    {
      label: '今日评估',
      value: stats?.todayCount ?? 0,
      icon: '📝',
      color: '#6B5B95',
    },
    {
      label: '班级数量',
      value: stats?.classCount ?? 0,
      icon: '🏫',
      color: '#88D8B0',
    },
    {
      label: '平均等级',
      value: stats?.avgLevel?.toFixed(1) ?? '0.0',
      icon: '📈',
      color: '#FF6B6B',
    },
  ];

  const quickActions = [
    { label: '开始评估', icon: '📝', path: '/assess', desc: '输入幼儿叙事内容进行DOO评估' },
    { label: '查看画像', icon: '👶', path: '/portraits', desc: '浏览幼儿个人叙事能力画像' },
    { label: '班级统计', icon: '📊', path: '/class-stats', desc: '查看班级整体叙事能力分布' },
  ];

  return (
    <div className="dashboard animate-fade-in-up">
      <header className="dashboard-header">
        <div>
          <h1 className="brand-font gradient-text">欢迎使用 DOO 多智能体系统</h1>
          <p className="dashboard-subtitle">基于DOO模型的大班幼儿叙事能力评估与个性化支持</p>
        </div>
        <div className="date-badge">
          <span>📅</span>
          <span>{new Date().toLocaleDateString('zh-CN')}</span>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-grid">
        {statsData.map((stat, index) => (
          <div
            key={stat.label}
            className="stat-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: stat.color }}>
                {loading ? '...' : stat.value}
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title brand-font">快速操作</h2>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <span className="action-icon">{action.icon}</span>
              <h3>{action.label}</h3>
              <p>{action.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="recent-activity">
        <h2 className="section-title brand-font">最近动态</h2>
        <div className="activity-list">
          {activitiesLoading ? (
            <div className="loading-text">加载中...</div>
          ) : activities.length === 0 ? (
            <div className="empty-text">暂无动态</div>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  {activity.child[0]}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-child">{activity.child}</span>
                    <span className="activity-action">{activity.action}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-time">{activity.time}</span>
                    <span className={`activity-level level-${activity.level}`}>
                      等级 {activity.level}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* DOO Model Info */}
      <section className="doo-info">
        <h2 className="section-title brand-font">DOO 评估模型</h2>
        <div className="doo-cards">
          <div className="doo-card diction">
            <div className="doo-card-header">
              <span className="doo-icon">📝</span>
              <h3>词句维度 Diction</h3>
            </div>
            <ul>
              <li>词汇丰富度</li>
              <li>句型复杂度</li>
            </ul>
          </div>
          <div className="doo-card organization">
            <div className="doo-card-header">
              <span className="doo-icon">🧩</span>
              <h3>组织维度 Organization</h3>
            </div>
            <ul>
              <li>叙事结构</li>
              <li>主题关联</li>
              <li>事件扩展</li>
              <li>表现力</li>
            </ul>
          </div>
          <div className="doo-card opinion">
            <div className="doo-card-header">
              <span className="doo-icon">💭</span>
              <h3>观点维度 Opinion</h3>
            </div>
            <ul>
              <li>叙事观点</li>
              <li>情感表达</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
