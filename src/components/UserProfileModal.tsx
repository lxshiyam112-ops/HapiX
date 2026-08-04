import React, { useState } from 'react';
import { User } from '../types';
import { LevelBadge } from './LevelBadge';
import { X, Crown, ShieldCheck, Coins, Gem, Sparkles, Check, Edit3, Flame } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onRechargeCoins: (coins: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onRechargeCoins,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [selectedFrame, setSelectedFrame] = useState(currentUser.frameUrl || '');

  if (!isOpen) return null;

  const framePresets = [
    { name: 'Gold Crown Glow', class: 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)]' },
    { name: 'Neon Purple VIP', class: 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.9)]' },
    { name: 'Cyber Blue Halo', class: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' },
    { name: 'Rose Gold Heart', class: 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]' },
  ];

  const handleSave = () => {
    onUpdateUser({ name, bio, frameUrl: selectedFrame });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-amber-300">My Hapi VIP Profile</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex flex-col items-center my-4">
          <div className="relative mb-2">
            <div className={`p-1 rounded-full border-4 ${selectedFrame || 'border-amber-400'}`}>
              <img src={currentUser.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full border border-slate-950 shadow-md">
              VIP {currentUser.vipLevel}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <h4 className="font-black text-base text-white">{currentUser.name}</h4>
            <LevelBadge level={currentUser.level} xp={currentUser.xp} size="sm" />
          </div>

          <p className="text-xs text-slate-400">ID: {currentUser.id}</p>
        </div>

        {/* User XP & Gifting Level Progress Card */}
        <div className="my-4">
          <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> User Experience (XP) & Level Rank:
          </label>
          <LevelBadge level={currentUser.level} xp={currentUser.xp} size="lg" />
        </div>

        {/* Edit Name & Bio */}
        <div className="space-y-3 my-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Display Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Bio / Adda Status:
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Avatar Frame Selector */}
        <div className="my-4">
          <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Select Avatar Frame:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {framePresets.map((frame) => {
              const isSelected = selectedFrame === frame.class;
              return (
                <button
                  key={frame.name}
                  onClick={() => setSelectedFrame(frame.class)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <span>{frame.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Recharge Coins Simulation */}
        <div className="my-4 pt-3 border-t border-slate-800">
          <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" /> Instant Recharge Coins:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 20000].map((amount) => (
              <button
                key={amount}
                onClick={() => onRechargeCoins(amount)}
                className="bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 rounded-xl p-2 text-center transition-all group"
              >
                <span className="text-xs font-extrabold text-emerald-300 block">+{amount.toLocaleString()} 🪙</span>
                <span className="text-[10px] text-slate-400">Free Top-up</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Save */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black text-xs py-2.5 rounded-full shadow-lg"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
