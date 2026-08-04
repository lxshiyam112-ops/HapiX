import React from 'react';
import { getLevelInfoFromXp, getXpForLevel } from '../lib/xpUtils';
import { Zap, Award, Sparkles, Crown } from 'lucide-react';

interface LevelBadgeProps {
  level?: number;
  xp?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showProgress?: boolean;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level = 1,
  xp,
  size = 'sm',
  showTitle = false,
  showProgress = false,
  className = '',
}) => {
  // If xp is not explicitly passed, calculate estimate based on level
  const totalXp = xp !== undefined ? xp : getXpForLevel(level);
  const info = getLevelInfoFromXp(totalXp);
  const displayLevel = level > info.level ? level : info.level;

  if (size === 'xs') {
    return (
      <span
        className={`inline-flex items-center gap-0.5 border text-[9px] font-extrabold px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm ${info.badgeStyle} ${className}`}
        title={`${info.title} - Level ${displayLevel}`}
      >
        <span>{info.icon}</span>
        <span>Lv.{displayLevel}</span>
      </span>
    );
  }

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1 border text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm ${info.badgeStyle} ${className}`}
      >
        <span>{info.icon}</span>
        <span>Lv.{displayLevel}</span>
        {showTitle && <span className="opacity-90 font-bold ml-0.5">{info.title}</span>}
      </span>
    );
  }

  if (size === 'md') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <div
          className={`inline-flex items-center gap-1.5 border text-xs font-black px-3 py-1 rounded-full shadow-md ${info.badgeStyle}`}
        >
          <span className="text-sm">{info.icon}</span>
          <span>Lv.{displayLevel}</span>
          <span className="opacity-90 font-bold border-l border-white/30 pl-1.5">{info.title}</span>
        </div>
        {showProgress && (
          <div className="w-full mt-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-0.5">
              <span>XP: {info.xpInCurrentLevel} / {info.xpNeededForNextLevel}</span>
              <span>{info.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${info.progressPercent}%` }}
                className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 h-full transition-all duration-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Size 'lg' for Profile hero
  return (
    <div className={`w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-white shadow-inner ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 shadow-md ${info.badgeStyle}`}>
            <span className="text-base">{info.icon}</span>
            <span>Level {displayLevel}</span>
          </div>
          <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
            {info.title}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-300">
          {info.currentXp.toLocaleString()} Total XP
        </span>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span>Progress to Level {displayLevel + 1}</span>
          <span className="text-amber-300">{info.xpInCurrentLevel.toLocaleString()} / {info.xpNeededForNextLevel.toLocaleString()} XP ({info.progressPercent}%)</span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
          <div
            style={{ width: `${info.progressPercent}%` }}
            className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-pink-500/50"
          />
        </div>
        <p className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Send gifts in voice rooms to earn XP & unlock higher level badges!
        </p>
      </div>
    </div>
  );
};
