import React from 'react';
import type { DOOAssessment } from '../types';
import { getLevelColor, calculateLevelFromDimensions } from '../utils/levelCalculator';

const LEVEL_LABELS: Record<number, string> = {
  1: '初级·需支持',
  2: '初级·需支持',
  3: '中级·基本达成',
  4: '高级·表现优秀',
  5: '高级·表现优秀',
};

interface HistoryTimelineProps {
  assessments: DOOAssessment[];
  scenarioMap: Record<string, string>;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ assessments, scenarioMap }) => {
  if (!assessments?.length) return null;

  return (
    <div className="detail-history">
      <h3>📋 评估历史记录</h3>
      <div className="history-list">
        {assessments.map((assessment, index) => (
          <div key={assessment.id || index} className="history-item">
            <div className="history-header">
              <span className="history-index">第 {index + 1} 次评估</span>
              <span className="history-date">
                {assessment.timestamp ? new Date(assessment.timestamp).toLocaleString('zh-CN') : '未知时间'}
              </span>
            </div>

            <div className="history-info-grid">
              <div className="history-info-item">
                <span className="info-label">评估场景</span>
                <span className="info-value">
                  {scenarioMap[assessment.scenario || ''] || '🎨 智能故事角'}
                </span>
              </div>
              <div className="history-info-item">
                <span className="info-label">综合等级</span>
                <span className="info-value" style={{ color: getLevelColor(calculateLevelFromDimensions(assessment.dimensions)) }}>
                  等级 {calculateLevelFromDimensions(assessment.dimensions)} · {LEVEL_LABELS[calculateLevelFromDimensions(assessment.dimensions)] || '未知'}
                </span>
              </div>
            </div>

            <div className="history-content">
              <span className="content-label">叙事内容</span>
              <p className="content-text">{assessment.narrativeContent || '无内容记录'}</p>
            </div>

            <div className="history-dimensions">
              <div className="history-dim-row">
                <span>词句维度</span>
                <div className="dim-bars">
                  <span>词汇:{assessment.dimensions.diction.vocabulary}</span>
                  <span>句型:{assessment.dimensions.diction.sentenceStructure}</span>
                </div>
              </div>
              <div className="history-dim-row">
                <span>组织维度</span>
                <div className="dim-bars">
                  <span>结构:{assessment.dimensions.organization.narrativeStructure}</span>
                  <span>主题:{assessment.dimensions.organization.themeRelevance}</span>
                  <span>扩展:{assessment.dimensions.organization.eventExpansion}</span>
                  <span>表现:{assessment.dimensions.organization.expressiveness}</span>
                </div>
              </div>
              <div className="history-dim-row">
                <span>观点维度</span>
                <div className="dim-bars">
                  <span>观点:{assessment.dimensions.opinion.narrativeViewpoint}</span>
                </div>
              </div>
            </div>

            {assessment.suggestions && assessment.suggestions.length > 0 && (
              <div className="history-suggestions">
                <span className="suggestions-label">评估分析与建议</span>
                <ul className="suggestions-list">
                  {assessment.suggestions.map((suggestion, sIndex) => (
                    <li key={sIndex}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;