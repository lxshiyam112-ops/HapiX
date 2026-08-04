export interface LevelInfo {
  level: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  title: string;
  badgeStyle: string;
  icon: string;
}

// Calculate total XP required to reach a specific level
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  // Formula: Level 1 -> 0, Level 2 -> 200, Level 3 -> 500, etc.
  // Progressive XP: base 100 * level * (level - 1)
  return Math.floor(100 * (level - 1) * (1 + (level - 1) * 0.1));
}

// Calculate level and progress from total XP
export function getLevelInfoFromXp(totalXp: number = 0): LevelInfo {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }

  const xpForCurrentLevel = getXpRequiredForLevel(level);
  const xpForNextLevel = getXpRequiredForLevel(level + 1);
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100))
  );

  let title = 'Novice Giver';
  let badgeStyle = 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-300 text-white';
  let icon = '🌱';

  if (level >= 90) {
    title = 'Imperial Flame Legend';
    badgeStyle = 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 border-rose-300 text-white font-black shadow-lg shadow-rose-500/50 animate-pulse';
    icon = '🔥';
  } else if (level >= 50) {
    title = 'Crown Royal Supreme';
    badgeStyle = 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-yellow-200 text-slate-950 font-black shadow-md shadow-amber-500/40';
    icon = '👑';
  } else if (level >= 25) {
    title = 'Gold Adda King';
    badgeStyle = 'bg-gradient-to-r from-purple-600 to-pink-500 border-purple-300 text-white shadow-purple-500/30';
    icon = '⚡';
  } else if (level >= 10) {
    title = 'Silver Star Giver';
    badgeStyle = 'bg-gradient-to-r from-cyan-600 to-blue-500 border-cyan-300 text-white';
    icon = '✨';
  }

  return {
    level,
    currentXp: totalXp,
    xpForCurrentLevel,
    xpForNextLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent: isNaN(progressPercent) ? 100 : progressPercent,
    title,
    badgeStyle,
    icon,
  };
}

// Convert level to total XP for initialization
export function getXpForLevel(level: number): number {
  return getXpRequiredForLevel(level);
}
