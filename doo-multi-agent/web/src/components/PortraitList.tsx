import React from 'react';
import type { ChildPortrait } from '../types';
import { getLevelColor } from '../utils/levelCalculator';

interface PortraitListProps {
  portraits: ChildPortrait[];
  loading: boolean;
  selectedChildId: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (child: ChildPortrait) => void;
  onDelete: (childId: string) => void;
  canDelete: (portrait: ChildPortrait) => boolean;
  deleting: boolean;
}

const PortraitList: React.FC<PortraitListProps> = ({
  portraits,
  loading,
  selectedChildId,
  searchTerm,
  onSearchChange,
  onSelect,
  onDelete,
  canDelete,
  deleting,
}) => {
  const getOverallScore = (radar: ChildPortrait['currentRadar']) => {
    return ((radar.diction + radar.organization + radar.opinion) / 3).toFixed(1);
  };

  return (
    <div className="children-list-container">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="input-field"
          placeholder="搜索幼儿姓名..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-text">加载中...</div>
      ) : (
        <div className="children-grid">
          {portraits.map((child) => {
            const score = parseFloat(getOverallScore(child.currentRadar));
            return (
              <div
                key={child.childId}
                className={`child-card ${selectedChildId === child.childId ? 'active' : ''}`}
              >
                <button
                  className="child-card-main"
                  onClick={() => onSelect(child)}
                >
                  <div className="child-avatar">
                    {child.name?.[0] || '?'}
                  </div>
                  <div className="child-info">
                    <span className="child-name">{child.name || '未命名'}</span>
                    <span className="child-score">
                      综合: <strong style={{ color: getLevelColor(score) }}>{score}</strong>
                    </span>
                  </div>
                  <div
                    className="child-level-dot"
                    style={{ background: getLevelColor(score) }}
                  />
                </button>
                {canDelete(child) && (
                  <button
                    className="child-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(child.childId);
                    }}
                    disabled={deleting}
                    title="删除画像"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortraitList;