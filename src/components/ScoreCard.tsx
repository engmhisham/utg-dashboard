// components/ScoreCard.tsx
import { FC } from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  colorClass: string;
}

const ScoreCard: FC<ScoreCardProps> = ({ title, score, maxScore, colorClass }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="flex items-end mt-1">
        <div className={`text-xl font-semibold ${colorClass}`}>{score.toFixed(1)}</div>
        <div className="text-sm text-gray-400 mb-0.5 ml-1">/ {maxScore}</div>
      </div>
      <div className="mt-1 flex items-center">
        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
        <div className="w-16 h-1 bg-gray-200 rounded-full ml-1">
          <div className={`h-1 rounded-full ${colorClass.replace('text', 'bg')}`} style={{ width: `${(score / maxScore) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;