import React from 'react';
import { User } from '../types';
import { LevelBadge } from './LevelBadge';
import { PlusCircle, Sparkles, Smartphone, User as UserIcon, Coins, Gem, Volume2 } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onOpenCreateRoom: () => void;
  onOpenProfile: () => void;
  onOpenRecharge: () => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  activeRoomTitle?: string;
  onReturnToRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenCreateRoom,
  onOpenProfile,
  onOpenRecharge,
  isMobileFrame,
  setIsMobileFrame,
  activeRoomTitle,
  onReturnToRoom,
}) => {
  return (
    <header id="main_navbar" className="bg-slate-900/90 backdrop-blur-md border-b border-purple-900/40 sticky top-0 z-40 px-4 py-3 text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-xl">🎙️</span>
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300 tracking-wide text-lg sm:text-xl flex items-center gap-1.5">
              Hapi Voice
              <span className="bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                LIVE
              </span>
            </h1>
            <p className="text-[11px] text-purple-300/70 hidden sm:block">Group Voice Party & Adda Rooms</p>
          </div>
        </div>

        {/* Active room quick floating bar if in room but viewing lobby */}
        {activeRoomTitle && (
          <button
            id="btn_return_room"
            onClick={onReturnToRoom}
            className="animate-pulse bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-pink-500/30 border border-pink-400/30"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="truncate max-w-[120px] sm:max-w-[200px]">In Room: {activeRoomTitle}</span>
          </button>
        )}

        {/* Right side stats & buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins Badge */}
          <button
            id="btn_coins_recharge"
            onClick={onOpenRecharge}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-amber-500/30 rounded-full px-2.5 py-1 transition-all group"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold text-amber-300">{currentUser.coins.toLocaleString()}</span>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              +
            </span>
          </button>

          {/* Gems Badge */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/90 border border-pink-500/30 rounded-full px-2.5 py-1">
            <Gem className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-xs font-bold text-pink-300">{currentUser.gems}</span>
          </div>

          {/* Create Room Button */}
          <button
            id="btn_create_room"
            onClick={onOpenCreateRoom}
            className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-1.5 shadow-lg shadow-purple-500/25 transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Room</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Mobile frame toggle */}
          <button
            id="btn_toggle_mobile_frame"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title="Toggle ACS Android Phone View"
            className={`p-2 rounded-full border transition-all ${
              isMobileFrame
                ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Profile Avatar Button with Level Badge */}
          <div className="flex items-center gap-1.5">
            <div className="hidden md:block">
              <LevelBadge level={currentUser.level} xp={currentUser.xp} size="xs" />
            </div>
            <button
              id="btn_user_profile"
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-full border-2 border-amber-400/80 hover:scale-105 transition-transform"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-[9px] px-1 rounded-full border border-slate-950">
                V{currentUser.vipLevel}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
