import React from 'react';

export default function PostureGauge({ score = 100, grade = 'A+', size = 160 }) {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 85) return { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.3)', text: 'text-emerald-400', label: 'Low Risk' };
    if (s >= 70) return { stroke: '#38BDF8', glow: 'rgba(56, 189, 248, 0.3)', text: 'text-sky-400', label: 'Moderate' };
    if (s >= 50) return { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.3)', text: 'text-amber-400', label: 'Elevated' };
    return { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-red-400', label: 'Critical Risk' };
  };

  const col = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={col.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
            filter: `drop-shadow(0 0 8px ${col.glow})`
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-extrabold tracking-tight ${col.text}`}>
          {score.toFixed(0)}<span className="text-sm font-bold">%</span>
        </span>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {grade}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {col.label}
          </span>
        </div>
      </div>
    </div>
  );
}
