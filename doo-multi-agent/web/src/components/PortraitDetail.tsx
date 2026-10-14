import React from 'react';
import type { ChildPortrait, DOOAssessment } from '../types';
import { getLevelColor } from '../utils/levelCalculator';
import RadarChart from './RadarChart';
import HistoryTimeline from './HistoryTimeline';

const LEVEL_LABELS: Record<number, string> = {
  1: '初级·需支持',
  2: '初级·需支持',
  3: '中级·基本达成',
  4: '高级·表现优秀',
  5: '高级·表现优秀',
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: '处于初级发展阶段（1-3分），需要更多支架支持。建议从简单的词汇和句型开始，逐步引导幼儿完整叙述事件。',
  2: '处于初级发展阶段（1-3分），在词句运用和叙事组织方面需加强支持。建议多进行词汇丰富度和叙事顺序的引导。',
  3: '处于中级发展水平（3-4分），基本达成当前阶段的叙事要求。建议巩固已有能力，并尝试更丰富的词汇和更完整的叙事结构。',
  4: '处于高级发展水平（4-5分），表现优秀。叙事结构完整，能够清晰表达个人感受和观点。建议继续保持，并挑战更复杂的叙事内容。',
  5: '处于高级发展水平（4-5分），表现优秀。叙事结构完整，能够清晰表达个人感受和观点。建议继续保持，并挑战更复杂的叙事内容。',
};

const DIMENSION_DETAILS = {
  diction: {
    name: '词句维度',
    icon: '📝',
    color: '#FF8C42',
    subDimensions: [
      { key: 'vocabulary', name: '词汇水平', description: '形容词、副词、描述性词汇的使用丰富度' },
      { key: 'sentenceStructure', name: '句子结构', description: '简单句、复合句、复杂句的使用情况' },
    ],
  },
  organization: {
    name: '组织维度',
    icon: '🧩',
    color: '#6B5B95',
    subDimensions: [
      { key: 'narrativeStructure', name: '叙事结构', description: '背景、角色定义、事件、结局的完整性' },
      { key: 'timeMarker', name: '时间标记', description: '时间连词和时间逻辑的使用情况' },
      { key: 'themeRelevance', name: '主题贴切', description: '故事线索的一致性和连续性' },
      { key: 'eventExpansion', name: '事件扩展', description: '细节描述的丰富程度和重要事件的阐述' },
      { key: 'expressiveness', name: '表现性', description: '声音效果、角色语气、表现力叙述的使用' },
    ],
  },
  opinion: {
    name: '观点维度',
    icon: '💭',
    color: '#88D8B0',
    subDimensions: [
      { key: 'narrativeViewpoint', name: '叙事观点', description: '个人感受、观点和评价的表达能力' },
    ],
  },
};

interface PortraitDetailProps {
  portrait: ChildPortrait;
  classNameMap: Record<string, string>;
  scenarioMap: Record<string, string>;
  onExport: () => void;
  onPrint: () => void;
}

const PortraitDetail: React.FC<PortraitDetailProps> = ({
  portrait,
  classNameMap,
  scenarioMap,
  onExport,
  onPrint,
}) => {
  const getOverallScore = (radar: ChildPortrait['currentRadar']) => {
    return ((radar.diction + radar.organization + radar.opinion) / 3).toFixed(1);
  };

  const getSubDimensionScore = (assessment: DOOAssessment | undefined, dimension: string, subKey: string): number => {
    if (!assessment) return 1;
    const dim = assessment.dimensions[dimension as keyof typeof assessment.dimensions];
    if (!dim) return 1;
    return (dim as Record<string, number>)[subKey] || 1;
  };

  const level = Math.round(parseFloat(getOverallScore(portrait.currentRadar)));
  const latestAssessment = portrait.basePortrait?.assessments?.[portrait.basePortrait.assessments.length - 1];

  return (
    <div className="portrait-detail">
      {/* 头部信息 */}
      <div className="detail-header">
        <div className="detail-avatar">
          {portrait.name?.[0] || '?'}
        </div>
        <div className="detail-info">
          <h2>{portrait.name || '未命名'}</h2>
          <span className="detail-meta">
            班级: {classNameMap[portrait.classId] || portrait.classId} · 
            评估次数: {portrait.basePortrait?.assessments?.length || 0} 次
          </span>
        </div>
        <div className="detail-actions">
          <button className="btn-export" onClick={onExport}>
            📄 导出PDF
          </button>
          <button className="btn-print" onClick={onPrint}>
            🖨️ 打印报告
          </button>
        </div>
      </div>

      {/* 综合评分 */}
      <div className="overall-section">
        <div className="overall-score-card">
          <span className="overall-label">综合评分</span>
          <span className="overall-score" style={{ color: getLevelColor(level) }}>
            {getOverallScore(portrait.currentRadar)}
          </span>
          <span className="overall-level">
            等级 {level} · {LEVEL_LABELS[level] || '未知'}
          </span>
        </div>
        <div className="overall-description">
          {LEVEL_DESCRIPTIONS[level] || ''}
        </div>
      </div>

      {/* 雷达图 */}
      <div className="detail-radar">
        <RadarChart data={portrait.currentRadar} size={320} />
      </div>

      {/* 三维度详细分析 */}
      <div className="detail-dimensions">
        <h3>📊 三维度详细分析</h3>
        {Object.entries(DIMENSION_DETAILS).map(([dimKey, dimInfo]) => {
          const dimScore = portrait.currentRadar[dimKey as keyof typeof portrait.currentRadar];
          return (
            <div key={dimKey} className="dimension-section">
              <div className="dimension-header">
                <span className="dimension-icon">{dimInfo.icon}</span>
                <span className="dimension-name">{dimInfo.name}</span>
                <span className="dimension-score" style={{ color: dimInfo.color }}>
                  {dimScore.toFixed(1)} 分
                </span>
              </div>
              <div className="sub-dimensions">
                {dimInfo.subDimensions.map((sub) => {
                  const subScore = getSubDimensionScore(latestAssessment, dimKey, sub.key);
                  return (
                    <div key={sub.key} className="sub-dimension-item">
                      <div className="sub-dim-info">
                        <span className="sub-dim-name">{sub.name}</span>
                        <span className="sub-dim-desc">{sub.description}</span>
                      </div>
                      <div className="sub-dim-score-bar">
                        <div
                          className="sub-dim-progress"
                          style={{
                            width: `${(subScore / 3) * 100}%`,
                            background: getLevelColor(subScore),
                          }}
                        />
                        <span className="sub-dim-score-value" style={{ color: getLevelColor(subScore) }}>
                          {subScore} 级
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 评估历史 */}
      <HistoryTimeline
        assessments={portrait.basePortrait?.assessments || []}
        scenarioMap={scenarioMap}
      />
    </div>
  );
};

export default PortraitDetail;