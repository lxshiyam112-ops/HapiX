import React, { useState } from 'react';
import { Gift, MicSeat, User } from '../types';
import { GIFTS_CATALOG } from '../lib/mockData';
import { X, Coins, Sparkles, Send, CheckCircle2 } from 'lucide-react';

interface GiftStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  seats: MicSeat[];
  onSendGift: (gift: Gift, count: number, targetSeatId: number | 'all') => void;
  onOpenRecharge: () => void;
  onOpenGames?: () => void;
}

export const GiftStoreModal: React.FC<GiftStoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  seats,
  onSendGift,
  onOpenRecharge,
  onOpenGames,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'luxury' | 'supercar' | 'magic'>('popular');
  const [selectedGift, setSelectedGift] = useState<Gift>(GIFTS_CATALOG[0]);
  const [giftCount, setGiftCount] = useState<number>(1);
  const [targetSeat, setTargetSeat] = useState<number | 'all'>(0);

  if (!isOpen) return null;

  const filteredGifts = GIFTS_CATALOG.filter((g) => g.category === activeTab);
  const totalPrice = selectedGift.price * giftCount;
  const canAfford = currentUser.coins >= totalPrice;

  const handleSend = () => {
    if (!canAfford) {
      onOpenRecharge();
      return;
    }
    onSendGift(selectedGift, giftCount, targetSeat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 text-white shadow-2xl shadow-purple-900/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <div>
              <h2 className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300">
                Luxury Gift Store
              </h2>
              <p className="text-xs text-slate-400">Send virtual gifts to speakers on stage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenGames && (
              <button
                onClick={() => {
                  onClose();
                  onOpenGames();
                }}
                className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all"
              >
                🎰 Play Game
              </button>
            )}
            <button
              id="btn_close_gift_store"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target Seat Selector */}
        <div className="my-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
            Select Recipient:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTargetSeat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                targetSeat === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌟 All Seats
            </button>
            {seats
              .filter((s) => s.userId)
              .map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => setTargetSeat(seat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                    targetSeat === seat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img src={seat.user?.avatar} alt="" className="w-4 h-4 rounded-full" />
                  <span>
                    #{seat.id === 0 ? 'Host' : seat.id}: {seat.user?.name}
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 gap-2 mb-3">
          {(
            [
              { id: 'popular', label: '🌹 Popular' },
              { id: 'luxury', label: '👑 Luxury' },
              { id: 'supercar', label: '🏎️ Supercars' },
              { id: 'magic', label: '🐉 Magic FX' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-4 gap-2.5 overflow-y-auto max-h-[220px] p-1 pr-2">
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <button
                key={gift.id}
                onClick={() => setSelectedGift(gift)}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-900/80 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400 absolute top-1 right-1" />
                )}
                <span className="text-3xl my-1 animate-bounce duration-1000">{gift.icon}</span>
                <span className="text-[11px] font-bold text-slate-200 line-clamp-1">{gift.name}</span>
                <span className="text-[10px] font-extrabold text-amber-300 flex items-center gap-0.5 mt-0.5">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {gift.price}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quantity Combo & Footer Send Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* Quick Combo selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {[1, 10, 99, 520].map((num) => (
              <button
                key={num}
                onClick={() => setGiftCount(num)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  giftCount === num
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                x{num}
              </button>
            ))}
          </div>

          {/* Price & Send Button */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total:</span>
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {totalPrice.toLocaleString()}
              </span>
            </div>

            <button
              id="btn_confirm_send_gift"
              onClick={handleSend}
              className={`px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 shadow-pink-500/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{canAfford ? 'Send Gift' : 'Recharge Coins'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
