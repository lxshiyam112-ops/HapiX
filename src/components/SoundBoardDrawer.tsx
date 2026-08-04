import React from 'react';
import { SOUNDBOARD_EFFECTS } from '../lib/mockData';
import { playSoundboardEffect, startBGMTrack, stopBGMTrack } from '../lib/audioEngine';
import { VoiceEffect } from '../types';
import { X, Volume2, Mic, Music, Disc } from 'lucide-react';

interface SoundBoardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeEffect: VoiceEffect;
  onChangeVoiceEffect: (effect: VoiceEffect) => void;
  bgmPlaying: boolean;
  onToggleBGM: (track?: string) => void;
}

export const SoundBoardDrawer: React.FC<SoundBoardDrawerProps> = ({
  isOpen,
  onClose,
  activeEffect,
  onChangeVoiceEffect,
  bgmPlaying,
  onToggleBGM,
}) => {
  if (!isOpen) return null;

  const voiceEffectsList: { id: VoiceEffect; label: string; icon: string }[] = [
    { id: 'normal', label: 'Normal Voice', icon: '🎙️' },
    { id: 'deep', label: 'Deep Male Pitch', icon: '🦁' },
    { id: 'female_pitch', label: 'Sweet High Pitch', icon: '👧' },
    { id: 'echo', label: 'Echo Concert', icon: '🏛️' },
    { id: 'reverb', label: 'Reverb Studio', icon: '🎧' },
    { id: 'robot', label: 'Futuristic Robot', icon: '🤖' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎛️</span>
            <div>
              <h3 className="font-extrabold text-base text-purple-300">Room Soundboard & Voice Changer</h3>
              <p className="text-xs text-slate-400">Audio FX & BGM Controls</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Sound FX Board */}
        <div className="my-3">
          <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" /> Instant Sound FX:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SOUNDBOARD_EFFECTS.map((fx) => (
              <button
                key={fx.id}
                onClick={() => playSoundboardEffect(fx.type)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/80 rounded-2xl p-2.5 text-center transition-all flex flex-col items-center gap-1 group"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{fx.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 line-clamp-1">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Voice Filters */}
        <div className="my-4">
          <label className="text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" /> Voice Changer FX:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {voiceEffectsList.map((eff) => {
              const isActive = activeEffect === eff.id;
              return (
                <button
                  key={eff.id}
                  onClick={() => onChangeVoiceEffect(eff.id)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-lg">{eff.icon}</span>
                  <span className="truncate">{eff.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: BGM Player */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Disc className={`w-5 h-5 ${bgmPlaying ? 'text-amber-400 animate-spin' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs font-bold text-slate-200">Host Background Music (BGM)</p>
              <p className="text-[10px] text-slate-400">Synth Ambient Loops</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['lofi', 'party', 'chill'].map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  startBGMTrack(genre as any);
                  onToggleBGM(genre);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-700 uppercase"
              >
                {genre}
              </button>
            ))}
            <button
              onClick={() => {
                stopBGMTrack();
                onToggleBGM();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                bgmPlaying ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {bgmPlaying ? 'Stop BGM' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
