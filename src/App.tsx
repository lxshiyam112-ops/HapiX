import React, { useState } from 'react';
import { VoiceRoom, Gift, User, VoiceEffect } from './types';
import { CURRENT_USER, SAMPLE_ROOMS } from './lib/mockData';
import { getLevelInfoFromXp, getXpForLevel } from './lib/xpUtils';
import { Navbar } from './components/Navbar';
import { RoomCard } from './components/RoomCard';
import { VoiceRoomView } from './components/VoiceRoomView';
import { GiftStoreModal } from './components/GiftStoreModal';
import { SoundBoardDrawer } from './components/SoundBoardDrawer';
import { MiniGamesModal } from './components/MiniGamesModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { Search, Sparkles, Flame, Radio, PlusCircle, Crown, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [rooms, setRooms] = useState<VoiceRoom[]>(SAMPLE_ROOMS);
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(SAMPLE_ROOMS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Modals state
  const [isGiftStoreOpen, setIsGiftStoreOpen] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isGamesOpen, setIsGamesOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);

  // Active Gift trigger state
  const [activeGiftEvent, setActiveGiftEvent] = useState<{
    sender: string;
    receiver: string;
    gift: Gift;
    count: number;
  } | null>(null);

  // Audio BGM State
  const [bgmPlaying, setBgmPlaying] = useState<boolean>(false);
  const [activeVoiceEffect, setActiveVoiceEffect] = useState<VoiceEffect>('normal');

  // Filtered rooms list
  const filteredRooms = rooms.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.host.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Send Gift from store
  const handleSendGift = (gift: Gift, count: number, targetSeatId: number | 'all') => {
    const totalCost = gift.price * count;
    if (currentUser.coins < totalCost) return;

    // Deduct coins & Grant XP based on sent gift value
    setCurrentUser((prev) => {
      const currentXp = prev.xp !== undefined ? prev.xp : getXpForLevel(prev.level);
      const newXp = currentXp + totalCost;
      const levelInfo = getLevelInfoFromXp(newXp);
      const newLevel = levelInfo.level;

      const updatedUser: User = {
        ...prev,
        coins: prev.coins - totalCost,
        xp: newXp,
        level: newLevel,
      };

      // Also update user profile on mic seats in active room
      if (activeRoom) {
        setActiveRoom((rPrev) => {
          if (!rPrev) return null;
          return {
            ...rPrev,
            seats: rPrev.seats.map((s) => (s.userId === prev.id ? { ...s, user: updatedUser } : s)),
          };
        });
      }

      return updatedUser;
    });

    let receiverName = 'Room Members';
    if (activeRoom) {
      if (targetSeatId === 'all') {
        receiverName = 'All Speakers';
      } else {
        const targetSeat = activeRoom.seats.find((s) => s.id === targetSeatId);
        if (targetSeat && targetSeat.user) {
          receiverName = targetSeat.user.name;
        }
      }

      // Update room gift value today
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, giftValueToday: (r.giftValueToday || 0) + totalCost } : r
        )
      );

      setActiveRoom((prev) => (prev ? { ...prev, giftValueToday: (prev.giftValueToday || 0) + totalCost } : null));
    }

    // Trigger gift animation event
    setActiveGiftEvent({
      sender: currentUser.name,
      receiver: receiverName,
      gift,
      count,
    });

    // Reset event after 4 seconds
    setTimeout(() => {
      setActiveGiftEvent(null);
    }, 4000);
  };

  // Handle create new room
  const handleCreateRoom = (roomData: Partial<VoiceRoom>) => {
    const newRoom: VoiceRoom = {
      id: 'room_' + (rooms.length + 101),
      title: roomData.title || 'My Hapi Voice Adda',
      notice: roomData.notice || 'Welcome to my room!',
      host: currentUser,
      category: roomData.category || 'Bengali Adda',
      bgTheme: roomData.bgTheme || 'neon_purple',
      bgmPlaying: false,
      isLocked: !!roomData.isLocked,
      password: roomData.password,
      onlineCount: 1,
      giftValueToday: 0,
      tags: ['New Room', 'Party'],
      seats: [
        { id: 0, userId: currentUser.id, user: currentUser, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0, title: 'Owner 👑' },
        { id: 1, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 2, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 3, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 4, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 5, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 6, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
        { id: 7, userId: null, isMuted: false, isLocked: false, isSpeaking: false, speakingVolume: 0 },
      ],
    };

    setRooms([newRoom, ...rooms]);
    setActiveRoom(newRoom);
  };

  // Content render helper
  const renderMainContent = () => {
    if (activeRoom) {
      return (
        <VoiceRoomView
          room={activeRoom}
          currentUser={currentUser}
          onExitRoom={() => setActiveRoom(null)}
          onOpenGiftStore={() => setIsGiftStoreOpen(true)}
          onOpenSoundboard={() => setIsSoundboardOpen(true)}
          onOpenGames={() => setIsGamesOpen(true)}
          activeGiftEvent={activeGiftEvent}
        />
      );
    }

    return (
      <main className="max-w-7xl mx-auto px-4 py-6 text-white space-y-6">
        {/* Banner Hero Showcase */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-pink-950 to-slate-900 p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
          <div className="max-w-xl space-y-3 z-10 relative">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Hapi Group Voice Chat
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-200">
              Join Live Voice Rooms & Luxury Gift Parties!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Talk on live mic seats, send animated supercars & dragons, play spin wheel games, and enjoy Bengali adda with friends!
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="bg-gradient-to-r from-amber-400 to-pink-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-pink-500/25 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> Create Voice Room
              </button>
            </div>
          </div>
        </div>

        {/* Filter Categories Bar */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2">
            {['All', 'Bengali Adda', 'Music', 'Party', 'Late Night', 'Gaming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 border-amber-300 font-extrabold shadow-md'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative min-w-[180px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Room or Host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Voice Rooms Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
              Live Group Voice Rooms ({filteredRooms.length})
            </h3>
          </div>

          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={(r) => setActiveRoom(r)} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <p className="text-sm font-bold">No voice rooms found matching "{searchQuery}"</p>
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="mt-3 bg-purple-600 text-white font-bold text-xs px-4 py-2 rounded-full"
              >
                Launch This Room Now
              </button>
            </div>
          )}
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenCreateRoom={() => setIsCreateRoomOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenRecharge={() => setIsProfileOpen(true)}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        activeRoomTitle={activeRoom?.title}
        onReturnToRoom={() => setActiveRoom(activeRoom)}
      />

      {/* Main Body with Android Code Studio Mobile View Frame Toggle support */}
      {isMobileFrame ? (
        <div className="py-6 px-4 flex items-center justify-center bg-slate-900/40 min-h-[calc(100vh-65px)]">
          <div className="w-full max-w-[420px] h-[840px] bg-slate-950 border-[10px] border-slate-800 rounded-[48px] shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col relative ring-1 ring-purple-500/30">
            {/* Phone Top Notch / Status Bar */}
            <div className="bg-slate-950 px-6 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-900 z-50">
              <span>9:41 AM</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
              <span>5G 🔋</span>
            </div>

            {/* Mobile Inner Application Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar">{renderMainContent()}</div>

            {/* Android Navigation Bar Home Indicator */}
            <div className="bg-slate-950 py-2 flex justify-center border-t border-slate-900 z-50">
              <div className="w-32 h-1 bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        renderMainContent()
      )}

      {/* Modals & Drawers */}
      <GiftStoreModal
        isOpen={isGiftStoreOpen}
        onClose={() => setIsGiftStoreOpen(false)}
        currentUser={currentUser}
        seats={activeRoom?.seats || []}
        onSendGift={handleSendGift}
        onOpenRecharge={() => {
          setIsGiftStoreOpen(false);
          setIsProfileOpen(true);
        }}
        onOpenGames={() => {
          setIsGiftStoreOpen(false);
          setIsGamesOpen(true);
        }}
      />

      <SoundBoardDrawer
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        activeEffect={activeVoiceEffect}
        onChangeVoiceEffect={(eff) => setActiveVoiceEffect(eff)}
        bgmPlaying={bgmPlaying}
        onToggleBGM={() => setBgmPlaying(!bgmPlaying)}
      />

      <MiniGamesModal
        isOpen={isGamesOpen}
        onClose={() => setIsGamesOpen(false)}
        currentUser={currentUser}
        onRewardCoins={(amount) => setCurrentUser((prev) => ({ ...prev, coins: prev.coins + amount }))}
        onSpendCoins={(amount) => {
          if (currentUser.coins >= amount) {
            setCurrentUser((prev) => ({ ...prev, coins: prev.coins - amount }));
            return true;
          }
          return false;
        }}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
        onRechargeCoins={(amount) => setCurrentUser((prev) => ({ ...prev, coins: prev.coins + amount }))}
      />

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}
