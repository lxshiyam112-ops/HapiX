import React from 'react';
import { VoiceRoom } from '../types';
import { Users, Crown, Gift, Volume2, ShieldAlert, Sparkles } from 'lucide-react';

interface RoomCardProps {
  room: VoiceRoom;
  onJoin: (room: VoiceRoom) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case 'luxury_gold':
        return 'from-amber-950/80 via-slate-900 to-amber-900/60 border-amber-500/40 hover:border-amber-400';
      case 'cyberpunk':
        return 'from-cyan-950/80 via-slate-900 to-purple-950/60 border-cyan-500/40 hover:border-cyan-400';
      case 'ocean_blue':
        return 'from-blue-950/80 via-slate-900 to-indigo-950/60 border-blue-500/40 hover:border-blue-400';
      case 'romantic_pink':
        return 'from-pink-950/80 via-slate-900 to-rose-950/60 border-pink-500/40 hover:border-pink-400';
      case 'neon_purple':
      default:
        return 'from-purple-950/80 via-slate-900 to-pink-950/60 border-purple-500/40 hover:border-purple-400';
    }
  };

  return (
    <div
      id={`room_card_${room.id}`}
      onClick={() => onJoin(room)}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${getThemeGradient(
        room.bgTheme
      )} border p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 flex flex-col justify-between min-h-[200px]`}
    >
      {/* Background glow circle */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-2 z-10">
        <span className="bg-purple-900/60 border border-purple-400/30 text-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          {room.category}
        </span>

        <div className="flex items-center gap-1.5">
          {room.isLocked && (
            <span className="bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Password
            </span>
          )}
          <span className="bg-slate-900/90 border border-slate-700/80 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3" />
            {room.onlineCount}
          </span>
        </div>
      </div>

      {/* Center Room Title & Host Info */}
      <div className="my-3 z-10">
        <h3 className="font-extrabold text-white text-base sm:text-lg line-clamp-1 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
          {room.title}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-1 mt-0.5 font-medium">{room.notice}</p>
      </div>

      {/* Bottom Host Avatar & Mic Seats Info */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={room.host.avatar}
              alt={room.host.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-400"
            />
            <Crown className="w-4 h-4 text-amber-400 absolute -top-2 -right-1 drop-shadow" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
              {room.host.name}
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">
                LV.{room.host.level}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Gift className="w-3 h-3 text-pink-400" />
              Gifts: {(room.giftValueToday || 0).toLocaleString()} coins
            </p>
          </div>
        </div>

        {/* Floating Mic Active indicator */}
        <div className="bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md group-hover:scale-105 transition-transform">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Join</span>
        </div>
      </div>
    </div>
  );
};
