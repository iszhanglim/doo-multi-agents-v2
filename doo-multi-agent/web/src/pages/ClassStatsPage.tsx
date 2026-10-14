import React from 'react';
import { usePortraits } from '../hooks/usePortraits';
import { useClasses } from '../hooks/useClasses';
import { calculateLevelFromScore, getLevelColor } from '../utils/levelCalculator';

const ClassStatsPage: React.FC = () => {
  const { portraits, loading } = usePortraits();
  const { classes } = useClasses();
  const classNameMap = (id: string) => classes.find((c) => c.id === id)?.name || id;

  // 从真实数据计算班级统计
  const classMap = new Map<string, { count: number; totalScore: number; dictionSum: number; orgSum: number; opinionSum: number }>();

  for (const portrait of portraits) {
    const classId = portrait.classId;
    const existing = classMap.get(classId) || { count: 0, totalScore: 0, dictionSum: 0, orgSum: 0, opinionSum: 0 };
    const score = (portrait.currentRadar.diction + portrait.currentRadar.organization + portrait.currentRadar.opinion) / 3;

    classMap.set(classId, {
      count: existing.count + 1,
      totalScore: existing.totalScore + score,
      dictionSum: existing.dictionSum + portrait.currentRadar.diction,
      orgSum: existing.orgSum + portrait.currentRadar.organization,
      opinionSum: existing.opinionSum + portrait.currentRadar.opinion,
    });
  }

  const classData = Array.from(classMap.entries()).map(([classId, data]) => ({
    name: classNameMap(classId),
    count: data.count,
    avgScore: data.totalScore / data.count,
    dictionAvg: data.dictionSum / data.count,
    orgAvg: data.orgSum / data.count,
    opinionAvg: data.opinionSum / data.count,
  }));

  // 得分分布 - 按5分制统一划分：<3需支持 / 3-4基本达到 / 4-5表现良好
  const levelDistribution = [
    { level: '需支持 (<3分)', count: 0, color: '#FF6B6B' },
    { level: '基本达到 (3-4分)', count: 0, color: '#FFB347' },
    { level: '表现良好 (4-5分)', count: 0, color: '#4ADE80' },
  ];

  let totalChildren = 0;
  let totalScore = 0;

  for (const portrait of portraits) {
    const score = (portrait.currentRadar.diction + portrait.currentRadar.organization + portrait.currentRadar.opinion) / 3;
    const level = calculateLevelFromScore(score);
    totalChildren++;
    totalScore += score;

    if (level < 3) levelDistribution[0].count++;
    else if (level < 4) levelDistribution[1].count++;
    else levelDistribution[2].count++;
  }

  const overallAvg = totalChildren > 0 ? (totalScore / totalChildren).toFixed(2) : '0.00';
  const maxCount = Math.max(...levelDistribution.map((d) => d.count), 1);

  // 三维度全园平均
  const dimensionAvgs = portraits.length > 0 ? {
    diction: portraits.reduce((sum, p) => sum + p.currentRadar.diction, 0) / portraits.length,
    organization: portraits.reduce((sum, p) => sum + p.currentRadar.organization, 0) / portraits.length,
    opinion: portraits.reduce((sum, p) => sum + p.currentRadar.opinion, 0) / portraits.length,
  } : { diction: 0, organization: 0, opinion: 0 };

  return (
    <div className="class-stats-page animate-fade-in-up">
      <header className="page-header">
        <h1 className="brand-font gradient-text">班级统计</h1>
        <p>查看各班级幼儿叙事能力的整体分布与发展趋势</p>
      </header>

      {loading ? (
        <div className="loading-text">加载中...</div>
      ) : portraits.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>暂无数据，请先进行评估</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="stats-overview">
            <div className="overview-card">
              <span className="overview-icon">👶</span>
              <div className="overview-info">
                <span className="overview-value">{totalChildren}</span>
                <span className="overview-label">评估幼儿总数</span>
              </div>
            </div>
            <div className="overview-card">
              <span className="overview-icon">📊</span>
              <div className="overview-info">
                <span className="overview-value">{overallAvg}</span>
                <span className="overview-label">全园平均等级</span>
              </div>
            </div>
            <div className="overview-card">
              <span className="overview-icon">🏫</span>
              <div className="overview-info">
                <span className="overview-value">{classMap.size}</span>
                <span className="overview-label">参与班级数</span>
              </div>
            </div>
          </div>

          <div className="stats-layout">
            {/* Level Distribution */}
            <div className="stats-section">
              <h2 className="section-title brand-font">等级分布</h2>
              <div className="distribution-chart">
                {levelDistribution.map((item) => (
                  <div key={item.level} className="distribution-bar">
                    <div className="bar-label">
                      <span className="bar-color" style={{ background: item.color }} />
                      <span>{item.level}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${(item.count / maxCount) * 100}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                    <span className="bar-count">{item.count}人</span>
                  </div>
                ))}
              </div>

              <div className="distribution-pie">
                <svg viewBox="0 0 200 200" width="200" height="200">
                  {levelDistribution.reduce(
                    (acc, item, index) => {
                      if (item.count === 0) return acc;
                      const startAngle = acc.currentAngle;
                      const angle = (item.count / totalChildren) * 360;
                      const endAngle = startAngle + angle;

                      const startRad = ((startAngle - 90) * Math.PI) / 180;
                      const endRad = ((endAngle - 90) * Math.PI) / 180;

                      const x1 = 100 + 80 * Math.cos(startRad);
                      const y1 = 100 + 80 * Math.sin(startRad);
                      const x2 = 100 + 80 * Math.cos(endRad);
                      const y2 = 100 + 80 * Math.sin(endRad);

                      const largeArc = angle > 180 ? 1 : 0;

                      acc.paths.push(
                        <path
                          key={index}
                          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={item.color}
                          stroke="white"
                          strokeWidth="2"
                        />
                      );
                      acc.currentAngle = endAngle;
                      return acc;
                    },
                    { paths: [] as React.ReactNode[], currentAngle: 0 }
                  ).paths}
                  <circle cx="100" cy="100" r="45" fill="white" />
                  <text x="100" y="95" textAnchor="middle" fontSize="14" fontWeight="600" fill="#2D2A4A">
                    {totalChildren}
                  </text>
                  <text x="100" y="112" textAnchor="middle" fontSize="11" fill="#6B6B8D">
                    总人数
                  </text>
                </svg>
              </div>
            </div>

            {/* Class Comparison */}
            <div className="stats-section">
              <h2 className="section-title brand-font">班级对比</h2>
              <div className="class-table-container">
                <table className="class-table">
                  <thead>
                    <tr>
                      <th>班级</th>
                      <th>人数</th>
                      <th>综合均分</th>
                      <th>词句</th>
                      <th>组织</th>
                      <th>观点</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classData.map((cls) => (
                      <tr key={cls.name}>
                        <td>
                          <strong>{cls.name}</strong>
                        </td>
                        <td>{cls.count}人</td>
                        <td>
                          <span
                            className="score-badge"
                            style={{
                              background: `${getLevelColor(cls.avgScore)}20`,
                              color: getLevelColor(cls.avgScore),
                            }}
                          >
                            {cls.avgScore.toFixed(1)}
                          </span>
                        </td>
                        <td>{cls.dictionAvg.toFixed(1)}</td>
                        <td>{cls.orgAvg.toFixed(1)}</td>
                        <td>{cls.opinionAvg.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Dimension Analysis */}
          <div className="stats-section full-width">
            <h2 className="section-title brand-font">三维度分析</h2>
            <div className="dimension-analysis">
              <div className="analysis-card diction">
                <div className="analysis-header">
                  <span className="analysis-icon">📝</span>
                  <h3>词句维度</h3>
                </div>
                <div className="analysis-score">{dimensionAvgs.diction.toFixed(2)}</div>
                <p>全园平均词汇丰富度和句型复杂度处于{dimensionAvgs.diction >= 2 ? '良好' : dimensionAvgs.diction >= 1.5 ? '中等' : '初级'}水平。</p>
              </div>

              <div className="analysis-card organization">
                <div className="analysis-header">
                  <span className="analysis-icon">🧩</span>
                  <h3>组织维度</h3>
                </div>
                <div className="analysis-score">{dimensionAvgs.organization.toFixed(2)}</div>
                <p>叙事结构组织能力{dimensionAvgs.organization >= 2 ? '较好' : '有待提升'}，大部分幼儿能按时间顺序叙述事件。</p>
              </div>

              <div className="analysis-card opinion">
                <div className="analysis-header">
                  <span className="analysis-icon">💭</span>
                  <h3>观点维度</h3>
                </div>
                <div className="analysis-score">{dimensionAvgs.opinion.toFixed(2)}</div>
                <p>情感表达和观点阐述能力{dimensionAvgs.opinion >= 2 ? '良好' : '有待提升'}，建议多引导幼儿表达个人感受。</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassStatsPage;
