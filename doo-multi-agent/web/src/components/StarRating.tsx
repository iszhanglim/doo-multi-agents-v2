import React from 'react';

interface StarRatingProps {
  score: number;
  size?: number;
  showScore?: boolean;
}

/**
 * 星星评分组件：1分点亮1颗星，满分5颗
 */
const StarRating: React.FC<StarRatingProps> = ({ score, size = 18, showScore = true }) => {
  const rounded = Math.max(0, Math.min(5, Math.round(score)));
  const stars = Array.from({ length: 5 }, (_, i) => i < rounded);

  const getColor = (s: number) => {
    if (s < 3) return '#FF6B6B';
    if (s < 4) return '#FFB347';
    return '#4ADE80';
  };

  return (
    <div className="star-rating">
      <div className="stars" style={{ fontSize: size }}>
        {stars.map((filled, i) => (
          <span key={i} style={{ color: filled ? '#FFB800' : '#E0E0E0' }}>
            {filled ? '★' : '☆'}
          </span>
        ))}
      </div>
      {showScore && (
        <div className="star-info">
          <span className="star-score" style={{ color: getColor(score) }}>{rounded}分</span>
        </div>
      )}
    </div>
  );
};

export default StarRating;
