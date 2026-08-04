import React, { useState } from 'react';
import { VoiceRoom } from '../types';
import { X, Sparkles, Shield, Music, PlusCircle } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: Partial<VoiceRoom>) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState('🇧🇩 Dhaka Superstar Voice Adda 🎤');
  const [notice, setNotice] = useState('Welcome everyone! Join mic seats and enjoy live music & chat ❤️');
  const [category, setCategory] = useState<'Music' | 'Party' | 'Late Night' | 'Gaming' | 'Bengali Adda'>('Bengali Adda');
  const [bgTheme, setBgTheme] = useState<'neon_purple' | 'luxury_gold' | 'cyberpunk' | 'romantic_pink' | 'ocean_blue' | 'starry_night'>('neon_purple');
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateRoom({
      title,
      notice,
      category,
      bgTheme,
      isLocked,
      password: isLocked ? password : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-amber-300">Create New Voice Room</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Room Title:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Room Announcement / Notice:
            </label>
            <textarea
              rows={2}
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Category:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Bengali Adda', 'Music', 'Party', 'Late Night', 'Gaming'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    category === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Stage Theme:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'neon_purple', name: '🌌 Neon Night' },
                { id: 'starry_night', name: '✨ Starry Night' },
                { id: 'cyberpunk', name: '🤖 Cyberpunk' },
                { id: 'luxury_gold', name: '👑 Royal Gold' },
                { id: 'romantic_pink', name: '💖 Romantic Rose' },
                { id: 'ocean_blue', name: '🌊 Ocean Chill' },
              ].map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setBgTheme(theme.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    bgTheme === theme.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="rounded accent-amber-400"
              />
              <span>Private Room (Password Protected)</span>
            </label>
          </div>

          {isLocked && (
            <input
              type="password"
              placeholder="Enter 4-digit passcode"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          )}

          <div className="pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black text-xs py-3 rounded-full shadow-lg shadow-pink-500/25 active:scale-95"
            >
              🚀 Launch Hapi Voice Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
