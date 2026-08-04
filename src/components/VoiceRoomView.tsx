import React, { useState, useEffect, useRef } from 'react';
import { VoiceRoom, MicSeat, User, Gift, ChatMessage, VoiceEffect } from '../types';
import { startMicrophone, stopMicrophone, playSoundboardEffect } from '../lib/audioEngine';
import { LevelBadge } from './LevelBadge';
import confetti from 'canvas-confetti';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  Crown,
  Gift as GiftIcon,
  Sparkles,
  Heart,
  Send,
  Sliders,
  Dices,
  Shield,
  MessageSquare,
  Flame,
  Radio,
  Users,
  Bot,
  Lock,
  Unlock,
  UserX,
  UserMinus,
  VolumeX,
  Settings,
} from 'lucide-react';

interface VoiceRoomViewProps {
  room: VoiceRoom;
  currentUser: User;
  onExitRoom: () => void;
  onOpenGiftStore: () => void;
  onOpenSoundboard: () => void;
  onOpenGames: () => void;
  activeGiftEvent: { sender: string; receiver: string; gift: Gift; count: number } | null;
}

export const VoiceRoomView: React.FC<VoiceRoomViewProps> = ({
  room,
  currentUser,
  onExitRoom,
  onOpenGiftStore,
  onOpenSoundboard,
  onOpenGames,
  activeGiftEvent,
}) => {
  const [seats, setSeats] = useState<MicSeat[]>(room.seats);
  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [activeVoiceEffect, setActiveVoiceEffect] = useState<VoiceEffect>('normal');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      userId: 'system',
      userName: 'Hapi System',
      userAvatar: '',
      userLevel: 99,
      text: '🎉 Welcome to Hapi Voice Adda Room! Keep conversations friendly and respectful. Enjoy live songs & luxury gifts!',
      type: 'system',
      timestamp: Date.now(),
    },
    {
      id: 'msg_ai_host',
      userId: 'user_1',
      userName: 'Aira AI 🤖',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      userLevel: 99,
      vipLevel: 8,
      text: `Hello everyone! I am Aira AI, your voice room co-host. 🎉 mic seats open আছেন, বলুন কী গান শুনবেন?`,
      type: 'text',
      timestamp: Date.now() + 1,
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(1280);
  const [bulletComments, setBulletComments] = useState<{ id: string; text: string; top: number; color: string }[]>([]);
  const [selectedSeatForModal, setSelectedSeatForModal] = useState<MicSeat | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isExpandedChatOpen, setIsExpandedChatOpen] = useState<boolean>(false);
  const [isRoomAdminOpen, setIsRoomAdminOpen] = useState<boolean>(false);
  const [roomNotice, setRoomNotice] = useState<string>(room.notice);
  const [noticeInput, setNoticeInput] = useState<string>(room.notice);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const expandedChatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    if (expandedChatScrollRef.current) {
      expandedChatScrollRef.current.scrollTop = expandedChatScrollRef.current.scrollHeight;
    }
  }, [messages, isExpandedChatOpen]);

  // Handle active gift particle trigger
  useEffect(() => {
    if (!activeGiftEvent) return;

    // Add gift message to room chat
    const newMsg: ChatMessage = {
      id: 'gift_msg_' + Date.now(),
      userId: currentUser.id,
      userName: activeGiftEvent.sender,
      userAvatar: currentUser.avatar,
      userLevel: currentUser.level,
      vipLevel: currentUser.vipLevel,
      text: `sent ${activeGiftEvent.gift.icon} ${activeGiftEvent.gift.name} x${activeGiftEvent.count} to ${activeGiftEvent.receiver}!`,
      type: 'gift',
      giftInfo: {
        giftName: activeGiftEvent.gift.name,
        giftIcon: activeGiftEvent.gift.icon,
        count: activeGiftEvent.count,
        receiverName: activeGiftEvent.receiver,
      },
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Trigger full screen confetti or FX
    if (activeGiftEvent.gift.animationType === 'confetti') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      playSoundboardEffect('coin');
    } else if (activeGiftEvent.gift.animationType === 'diamond_rain') {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
      playSoundboardEffect('cheer');
    } else if (activeGiftEvent.gift.animationType === 'car_drive' || activeGiftEvent.gift.animationType === 'dragon_fire') {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 } });
      playSoundboardEffect('horn');
    }
  }, [activeGiftEvent]);

  // Toggle Browser Real Microphone
  const handleToggleMic = async () => {
    if (isMicOn) {
      stopMicrophone();
      setIsMicOn(false);
      setMicVolume(0);
      updateMySeatSpeaking(false, 0);
    } else {
      const success = await startMicrophone((vol) => {
        setMicVolume(vol);
        updateMySeatSpeaking(vol > 15, vol);
      }, activeVoiceEffect);

      if (success) {
        setIsMicOn(true);
        playSoundboardEffect('coin');
      } else {
        alert('Microphone access denied. Please allow microphone permissions in your browser.');
      }
    }
  };

  const updateMySeatSpeaking = (isSpeaking: boolean, vol: number) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.userId === currentUser.id) {
          return { ...seat, isSpeaking, speakingVolume: vol };
        }
        return seat;
      })
    );
  };

  // Host Action: Toggle seat mute status
  const handleToggleMuteSeat = (seatId: number) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId) {
          const nextMuted = !s.isMuted;
          const msgText = `🎙️ Seat #${seatId} was ${nextMuted ? 'muted 🔇' : 'unmuted 🔊'} by Room Host.`;
          setMessages((m) => [
            ...m,
            {
              id: 'sys_' + Date.now(),
              userId: 'system',
              userName: 'System',
              userAvatar: '',
              userLevel: 1,
              text: msgText,
              type: 'system',
              timestamp: Date.now(),
            },
          ]);
          return { ...s, isMuted: nextMuted };
        }
        return s;
      })
    );
  };

  // Host Action: Toggle seat lock status
  const handleToggleLockSeat = (seatId: number) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId) {
          const nextLocked = !s.isLocked;
          const msgText = `🔒 Seat #${seatId} was ${nextLocked ? 'locked 🔒' : 'unlocked 🔓'} by Room Host.`;
          setMessages((m) => [
            ...m,
            {
              id: 'sys_' + Date.now(),
              userId: 'system',
              userName: 'System',
              userAvatar: '',
              userLevel: 1,
              text: msgText,
              type: 'system',
              timestamp: Date.now(),
            },
          ]);
          return { ...s, isLocked: nextLocked };
        }
        return s;
      })
    );
  };

  // Host Action: Kick user from mic seat to audience
  const handleKickUserFromSeat = (seatId: number) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId && s.user) {
          const targetName = s.user.name;
          setMessages((m) => [
            ...m,
            {
              id: 'sys_' + Date.now(),
              userId: 'system',
              userName: 'System',
              userAvatar: '',
              userLevel: 1,
              text: `⚠️ ${targetName} was moved to audience from Seat #${seatId} by Host.`,
              type: 'system',
              timestamp: Date.now(),
            },
          ]);
          return { ...s, userId: null, user: undefined, isSpeaking: false };
        }
        return s;
      })
    );
    setSelectedSeatForModal(null);
  };

  // Host Action: Kick user from room completely
  const handleKickUserFromRoom = (seatId: number) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId && s.user) {
          const targetName = s.user.name;
          setMessages((m) => [
            ...m,
            {
              id: 'sys_' + Date.now(),
              userId: 'system',
              userName: 'System',
              userAvatar: '',
              userLevel: 1,
              text: `⛔ ${targetName} was kicked out of the room by Host!`,
              type: 'system',
              timestamp: Date.now(),
            },
          ]);
          return { ...s, userId: null, user: undefined, isSpeaking: false };
        }
        return s;
      })
    );
    setSelectedSeatForModal(null);
  };

  // Host Batch Actions
  const handleMuteAllSeats = () => {
    setSeats((prev) => prev.map((s) => (s.id !== 0 ? { ...s, isMuted: true } : s)));
    setMessages((m) => [
      ...m,
      {
        id: 'sys_' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        userLevel: 1,
        text: `🔇 Host muted all guest mic seats.`,
        type: 'system',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleUnmuteAllSeats = () => {
    setSeats((prev) => prev.map((s) => ({ ...s, isMuted: false })));
    setMessages((m) => [
      ...m,
      {
        id: 'sys_' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        userLevel: 1,
        text: `🔊 Host unmuted all mic seats.`,
        type: 'system',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleLockAllSeats = () => {
    setSeats((prev) => prev.map((s) => (s.id !== 0 ? { ...s, isLocked: true } : s)));
    setMessages((m) => [
      ...m,
      {
        id: 'sys_' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        userLevel: 1,
        text: `🔒 Host locked all mic seats.`,
        type: 'system',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleUnlockAllSeats = () => {
    setSeats((prev) => prev.map((s) => ({ ...s, isLocked: false })));
    setMessages((m) => [
      ...m,
      {
        id: 'sys_' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        userLevel: 1,
        text: `🔓 Host unlocked all mic seats.`,
        type: 'system',
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeInput.trim()) return;
    setRoomNotice(noticeInput.trim());
    setMessages((m) => [
      ...m,
      {
        id: 'sys_' + Date.now(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        userLevel: 1,
        text: `📢 Room Notice updated: "${noticeInput.trim()}"`,
        type: 'system',
        timestamp: Date.now(),
      },
    ]);
  };

  // Seat Action: Take seat or leave seat
  const handleSeatClick = (seat: MicSeat) => {
    if (seat.isLocked && !seat.userId) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_lock_' + Date.now(),
          userId: 'system',
          userName: 'System',
          userAvatar: '',
          userLevel: 1,
          text: `🔒 Seat #${seat.id} is locked by host!`,
          type: 'system',
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (!seat.userId) {
      // Take seat
      setSeats((prev) =>
        prev.map((s) => {
          if (s.userId === currentUser.id) {
            return { ...s, userId: null, isSpeaking: false };
          }
          if (s.id === seat.id) {
            return { ...s, userId: currentUser.id, user: currentUser, isMuted: false };
          }
          return s;
        })
      );
      playSoundboardEffect('applause');
    } else {
      setSelectedSeatForModal(seat);
    }
  };

  // Send Live Chat Message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userLevel: currentUser.level,
      vipLevel: currentUser.vipLevel,
      text: text,
      type: 'text',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    playSoundboardEffect('coin');

    // Spawn floating bullet comment
    const bulletColors = ['#f59e0b', '#ec4899', '#a855f7', '#10b981', '#3b82f6'];
    const randomColor = bulletColors[Math.floor(Math.random() * bulletColors.length)];
    const bullet = {
      id: 'b_' + Date.now(),
      text: `${currentUser.name}: ${text}`,
      top: Math.floor(Math.random() * 50) + 20, // 20% to 70% height
      color: randomColor,
    };
    setBulletComments((prev) => [...prev, bullet]);

    // Remove bullet after animation
    setTimeout(() => {
      setBulletComments((prev) => prev.filter((b) => b.id !== bullet.id));
    }, 4000);

    if (!textToSend) setInputText('');

    // Simulate real-time chat response from room members or AI Co-host
    setTimeout(() => {
      const roomParticipants = [
        { name: 'Aira AI 🤖', level: 99, vip: 8, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
        { name: 'Warren (Owner) 👑', level: 18, vip: 5, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
        { name: 'Sumaiya 🌸', level: 12, vip: 3, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
        { name: 'Tanvir 🔥', level: 15, vip: 4, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
      ];

      const responses = [
        `হ্যাঁ ${currentUser.name.split(' ')[0]}, আপনার মেসেজ পাইছি! দারুণ হচ্ছে আজকের আড্ডা 🎤`,
        `Nice message! ❤️ ভয়েস রুমে সবাই একসাথে থাকলে খুব ভালো লাগে।`,
        `🔥 Love this vibe! বলুন মাইকে কে গান গাইবেন?`,
        `Welcome ${currentUser.name.split(' ')[0]}! আজকের আড্ডায় যোগ দেওয়ার জন্য ধন্যবাদ 🎉`,
      ];

      const randomUser = roomParticipants[Math.floor(Math.random() * roomParticipants.length)];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];

      const replyMsg: ChatMessage = {
        id: 'msg_reply_' + Date.now(),
        userId: 'user_sim_' + Math.random(),
        userName: randomUser.name,
        userAvatar: randomUser.avatar,
        userLevel: randomUser.level,
        vipLevel: randomUser.vip,
        text: randomReply,
        type: 'text',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, replyMsg]);
    }, 2000);
  };

  const handleQuickEmoji = (emoji: string) => {
    handleSendMessage(`${emoji} ${emoji} ${emoji}`);
  };

  // Ask AI Co-Host to speak / react in room
  const handleTriggerAICoHost = async () => {
    if (aiLoading) return;
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/cohost-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTitle: room.title,
          userName: currentUser.name,
          userAction: 'Prompted AI Co-host for adda banter',
        }),
      });
      const data = await res.json();

      if (data.comment) {
        const aiMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          userId: 'user_1',
          userName: 'Aira AI 🤖',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          userLevel: 99,
          vipLevel: 8,
          text: data.comment,
          type: 'text',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        playSoundboardEffect('cheer');
      }
    } catch (err) {
      console.warn('AI Co-host request error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const getStageThemeStyle = (theme: string) => {
    switch (theme) {
      case 'starry_night':
        return 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 border-indigo-500/30';
      case 'luxury_gold':
        return 'bg-gradient-to-b from-amber-950/90 via-slate-950 to-amber-950/80 border-amber-500/30';
      case 'cyberpunk':
        return 'bg-gradient-to-b from-slate-950 via-purple-950/90 to-cyan-950 border-cyan-500/30';
      case 'romantic_pink':
        return 'bg-gradient-to-b from-rose-950/90 via-slate-950 to-pink-950 border-pink-500/30';
      case 'ocean_blue':
        return 'bg-gradient-to-b from-blue-950/90 via-slate-950 to-indigo-950 border-blue-500/30';
      case 'neon_purple':
      default:
        return 'bg-gradient-to-b from-purple-950/90 via-slate-950 to-slate-900 border-purple-500/30';
    }
  };

  const hostSeat = seats.find((s) => s.id === 0) || seats[0];
  const gridSeats = seats.filter((s) => s.id !== 0);

  return (
    <div className={`relative w-full min-h-[calc(100vh-65px)] ${getStageThemeStyle(room.bgTheme)} border-t text-white flex flex-col justify-between overflow-hidden`}>
      {/* Floating Danmaku Bullet Comments Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {bulletComments.map((b) => (
          <div
            key={b.id}
            style={{ top: `${b.top}%`, color: b.color }}
            className="absolute right-0 translate-x-full animate-[bullet_4s_linear_forwards] bg-slate-950/70 border border-white/10 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{b.text}</span>
          </div>
        ))}
      </div>

      {/* Top Voice Room Header Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img src={room.host.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-amber-400" />
            <Crown className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm sm:text-base line-clamp-1 flex items-center gap-1.5">
              {room.title}
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full uppercase font-bold">
                ID: {room.id}
              </span>
            </h2>
            <p className="text-[11px] text-slate-300 line-clamp-1 flex items-center gap-2">
              <span>Notice: {roomNotice}</span>
            </p>
          </div>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2">
          {/* Room Management Drawer Button */}
          <button
            onClick={() => setIsRoomAdminOpen(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Room Management Drawer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Room Admin</span>
          </button>

          {/* Today Gift Value Counter */}
          <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-extrabold text-amber-300">
            <GiftIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>{(room.giftValueToday || 0).toLocaleString()}</span>
          </div>

          {/* Like Heart Button */}
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${
              isLiked
                ? 'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : 'text-rose-400'}`} />
            <span>{likeCount}</span>
          </button>

          {/* AI Co-Host Trigger Button */}
          <button
            onClick={handleTriggerAICoHost}
            disabled={aiLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md border border-pink-400/40 active:scale-95 disabled:opacity-50"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{aiLoading ? 'AI Thinking...' : 'Aira AI'}</span>
          </button>

          {/* Exit Room */}
          <button
            onClick={onExitRoom}
            className="p-2 rounded-full bg-slate-800/90 hover:bg-rose-600 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Leave Voice Room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Stage: Host Seat + Mic Grid Seats */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-start z-10 max-w-4xl mx-auto w-full">
        {/* Host Crown Seat (#0) */}
        <div className="mb-6 flex flex-col items-center relative">
          <div
            onClick={() => handleSeatClick(hostSeat)}
            className={`relative p-1.5 rounded-full cursor-pointer transition-transform hover:scale-105 ${
              hostSeat.isSpeaking ? 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-950 animate-pulse' : ''
            }`}
          >
            {/* Host Crown */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-slate-950 flex items-center gap-1">
                <Crown className="w-3 h-3 text-slate-950" />
                HOST
              </span>
            </div>

            {/* Speaking Wave Ripple */}
            {hostSeat.isSpeaking && (
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400 to-pink-500 rounded-full opacity-40 blur-md animate-ping" />
            )}

            <img
              src={hostSeat.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={hostSeat.user?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl shadow-amber-500/20 relative z-10"
            />

            {/* Mic Status Icon */}
            <div className="absolute bottom-0 right-0 z-20 bg-slate-950 border-2 border-amber-400 p-1.5 rounded-full">
              {hostSeat.isMuted ? (
                <MicOff className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-amber-300">
              {hostSeat.user?.name || 'Owner'}
            </span>
            <LevelBadge level={hostSeat.user?.level || 1} xp={hostSeat.user?.xp} size="xs" />
          </div>
        </div>

        {/* Mic Seats Grid (Seats #1 to #7) */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-5 w-full mb-4">
          {gridSeats.map((seat) => {
            const isOccupied = !!seat.userId;
            const isMe = seat.userId === currentUser.id;

            return (
              <div key={seat.id} className="flex flex-col items-center">
                <button
                  onClick={() => handleSeatClick(seat)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 ${
                    isOccupied
                      ? seat.isSpeaking
                        ? 'border-pink-400 ring-4 ring-pink-500/50 ring-offset-2 ring-offset-slate-950 animate-pulse'
                        : 'border-purple-400/80 bg-slate-900'
                      : 'border-dashed border-slate-700 bg-slate-900/60 hover:border-amber-400/80'
                  }`}
                >
                  {isOccupied ? (
                    <>
                      {/* Speaking Aura */}
                      {seat.isSpeaking && (
                        <div className="absolute -inset-1 bg-pink-500/30 rounded-full blur-sm animate-ping" />
                      )}

                      <img src={seat.user?.avatar} alt="" className="w-full h-full rounded-full object-cover" />

                      {/* Seat Badge */}
                      <span className="absolute -top-2 bg-purple-900/90 text-purple-200 border border-purple-400/40 font-black text-[9px] px-1.5 rounded-full">
                        #{seat.id}
                      </span>

                      {/* Mic Status */}
                      <div className="absolute bottom-0 right-0 bg-slate-950 border border-purple-400/60 p-1 rounded-full z-10">
                        {seat.isMuted ? (
                          <MicOff className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Mic className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </>
                  ) : seat.isLocked ? (
                    <div className="flex flex-col items-center text-rose-400">
                      <Lock className="w-4 h-4 mb-0.5 text-rose-400" />
                      <span className="text-[10px] font-extrabold text-rose-400">Locked</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 hover:text-amber-300">
                      <span className="text-xs font-bold">#{seat.id}</span>
                      <span className="text-[10px] font-extrabold">+ Mic</span>
                    </div>
                  )}
                </button>

                <div className="mt-1 flex flex-col items-center max-w-[76px]">
                  <p className="text-[11px] font-bold text-slate-300 truncate w-full text-center">
                    {isOccupied ? seat.user?.name : seat.isLocked ? '🔒 Locked' : 'Empty'}
                  </p>
                  {isOccupied && seat.user && (
                    <LevelBadge level={seat.user.level} xp={seat.user.xp} size="xs" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Live Chat Feed & Mic Control Dock */}
      <div className="p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl border-t border-purple-500/20 z-30 max-w-4xl mx-auto w-full rounded-t-3xl shadow-2xl">
        {/* Chat Header with Expand Button */}
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Room Chat ({messages.length})</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          </div>
          <button
            onClick={() => setIsExpandedChatOpen(true)}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30 flex items-center gap-1 font-semibold transition-all"
          >
            💬 Full Chat Box
          </button>
        </div>

        {/* Quick Emoji Reactions Row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 no-scrollbar text-sm">
          {['❤️', '🔥', '👏', '🎤', '🎁', '🎉', '😂', '💯'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmoji(emoji)}
              className="bg-slate-900 hover:bg-purple-900/50 border border-slate-800 hover:border-purple-500/40 px-2 py-1 rounded-full transition-transform active:scale-90 text-xs shrink-0 flex items-center gap-0.5"
              title={`React ${emoji}`}
            >
              <span>{emoji}</span>
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div ref={chatScrollRef} className="max-h-36 overflow-y-auto space-y-1.5 mb-3 pr-1 text-xs no-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 animate-in fade-in duration-200">
              {msg.type === 'system' ? (
                <div className="bg-purple-900/40 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-2xl font-medium w-full text-[11px]">
                  {msg.text}
                </div>
              ) : msg.type === 'gift' ? (
                <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-2xl font-bold w-full flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    <strong className="text-white">{msg.userName}</strong> {msg.text}
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2 max-w-[90%]">
                  {msg.userAvatar ? (
                    <img src={msg.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-purple-400 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5">
                      {msg.userName.charAt(0)}
                    </div>
                  )}
                  <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="font-extrabold text-amber-300 text-[11px]">{msg.userName}</span>
                      <LevelBadge level={msg.userLevel} size="xs" />
                      {msg.vipLevel && (
                        <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] px-1 rounded">
                          VIP {msg.vipLevel}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 font-normal">{msg.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar & Controls Dock */}
        <div className="flex flex-col gap-2">
          {/* Real Mic Meter if microphone is active */}
          {isMicOn && (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Mic Live</span>
              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${micVolume}%` }}
                  className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-75"
                />
              </div>
              <span>{micVolume}%</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Real Browser Mic Toggle */}
            <button
              id="btn_mic_toggle"
              onClick={handleToggleMic}
              className={`p-3 rounded-full font-bold transition-all shadow-lg active:scale-95 ${
                isMicOn
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-slate-800 border border-slate-700 text-rose-400 hover:text-white'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Soundboard Drawer button */}
            <button
              id="btn_open_soundboard"
              onClick={onOpenSoundboard}
              className="p-3 rounded-full bg-slate-800 border border-slate-700 text-purple-300 hover:text-white hover:border-purple-400 transition-all"
              title="Soundboard & Voice Changer"
            >
              <Sliders className="w-5 h-5" />
            </button>

            {/* Chat Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5"
            >
              <input
                type="text"
                placeholder="Text while talking in room..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Mini Games Button (Beside Gift Box) */}
            <button
              id="btn_open_games"
              onClick={onOpenGames}
              className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform active:scale-95"
              title="Voice Room Mini Games & Win Coins"
            >
              <Dices className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">Game 🎰</span>
            </button>

            {/* Send Gift Button */}
            <button
              id="btn_open_gift_store"
              onClick={onOpenGiftStore}
              className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-pink-500/30 transition-transform active:scale-95"
            >
              <GiftIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Gift 🎁</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Real-Time Chat Box Modal */}
      {isExpandedChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-4 sm:p-5 text-white shadow-2xl flex flex-col h-[80vh] relative animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-950 border border-purple-500/30 rounded-xl text-purple-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Voice Room Real-Time Text Chat</h3>
                  <p className="text-xs text-slate-400">Text & send reactions while listening on stage</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpandedChatOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Emoji Bar inside Expanded Chat */}
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-b border-slate-800/80 text-base">
              {['❤️', '🔥', '👏', '🎤', '🎁', '🎉', '😂', '💯', '🚀', '😍'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleQuickEmoji(emoji)}
                  className="bg-slate-800 hover:bg-purple-900/50 border border-slate-700 px-3 py-1 rounded-full text-sm shrink-0 active:scale-95 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Messages Feed in Expanded Modal */}
            <div ref={expandedChatScrollRef} className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5">
                  {msg.type === 'system' ? (
                    <div className="bg-purple-900/40 border border-purple-500/30 text-purple-200 px-3 py-2 rounded-2xl font-medium w-full text-xs">
                      {msg.text}
                    </div>
                  ) : msg.type === 'gift' ? (
                    <div className="bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-200 px-3 py-2 rounded-2xl font-bold w-full flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>
                        <strong className="text-white">{msg.userName}</strong> {msg.text}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 max-w-[90%]">
                      {msg.userAvatar ? (
                        <img src={msg.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover border border-purple-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                          {msg.userName.charAt(0)}
                        </div>
                      )}
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-2xl space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-amber-300 text-xs">{msg.userName}</span>
                          <LevelBadge level={msg.userLevel} size="xs" />
                          {msg.vipLevel && (
                            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] px-1 rounded">
                              VIP {msg.vipLevel}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500 ml-auto">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Bar inside Expanded Modal */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-3 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a real-time message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-lg shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Management Drawer / Modal */}
      {isRoomAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 text-white shadow-2xl flex flex-col max-h-[85vh] relative animate-in zoom-in-95">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                    Room Host Management
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                      Host Admin
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Control mic seats, mute guests, lock slots & edit notice</p>
                </div>
              </div>
              <button
                onClick={() => setIsRoomAdminOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 no-scrollbar">
              {/* Room Notice Banner Editor */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-pink-400" />
                    <span>Room Notice Banner</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Visible to all users</span>
                </div>
                <form onSubmit={handleSaveNotice} className="flex gap-2">
                  <input
                    type="text"
                    value={noticeInput}
                    onChange={(e) => setNoticeInput(e.target.value)}
                    placeholder="Set voice room notice announcement..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    Save Notice
                  </button>
                </form>
              </div>

              {/* Quick Batch Controls */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>One-Click Batch Room Controls</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={handleMuteAllSeats}
                    className="bg-slate-800 hover:bg-slate-700 border border-rose-500/40 text-rose-300 font-bold p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 text-center"
                  >
                    <MicOff className="w-4 h-4 text-rose-400" />
                    <span className="text-[11px]">Mute All Guests</span>
                  </button>

                  <button
                    onClick={handleUnmuteAllSeats}
                    className="bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-bold p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 text-center"
                  >
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px]">Unmute All</span>
                  </button>

                  <button
                    onClick={handleLockAllSeats}
                    className="bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-bold p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 text-center"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px]">Lock All Seats</span>
                  </button>

                  <button
                    onClick={handleUnlockAllSeats}
                    className="bg-slate-800 hover:bg-slate-700 border border-purple-500/40 text-purple-300 font-bold p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95 text-center"
                  >
                    <Unlock className="w-4 h-4 text-purple-400" />
                    <span className="text-[11px]">Unlock All Seats</span>
                  </button>
                </div>
              </div>

              {/* Individual Mic Seats Control List (#0 to #7) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Seat Management Matrix ({seats.length} Seats)</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Click actions to kick/mute/lock</span>
                </div>

                <div className="space-y-2">
                  {seats.map((seat) => {
                    const isOccupied = !!seat.userId;
                    const isHostSeat = seat.id === 0;

                    return (
                      <div
                        key={seat.id}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                          isHostSeat
                            ? 'bg-amber-950/30 border-amber-500/40'
                            : isOccupied
                            ? 'bg-slate-950 border-purple-500/30'
                            : seat.isLocked
                            ? 'bg-slate-950/80 border-rose-500/30'
                            : 'bg-slate-950/50 border-slate-800'
                        }`}
                      >
                        {/* Left: Seat info & User */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`px-2 py-1 rounded-lg font-black text-[10px] shrink-0 ${
                              isHostSeat
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-purple-900/80 text-purple-200 border border-purple-400/30'
                            }`}
                          >
                            #{seat.id}
                          </span>

                          {isOccupied ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={seat.user?.avatar}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-extrabold text-white text-xs truncate">
                                  {seat.user?.name}
                                </p>
                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <span className="text-amber-300 font-bold">Lvl {seat.user?.level}</span>
                                  {seat.isMuted && <span className="text-rose-400 font-bold">• Muted</span>}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              {seat.isLocked ? (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5" /> Seat Locked
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Empty Mic Seat</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        {!isHostSeat && (
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Toggle Mute */}
                            <button
                              onClick={() => handleToggleMuteSeat(seat.id)}
                              className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                                seat.isMuted
                                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              }`}
                              title={seat.isMuted ? 'Unmute Mic' : 'Mute Mic'}
                            >
                              {seat.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>

                            {/* Toggle Lock */}
                            <button
                              onClick={() => handleToggleLockSeat(seat.id)}
                              className={`p-1.5 rounded-xl border transition-all active:scale-95 ${
                                seat.isLocked
                                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                              }`}
                              title={seat.isLocked ? 'Unlock Seat' : 'Lock Seat'}
                            >
                              {seat.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            {/* Kick user from seat (if occupied) */}
                            {isOccupied && (
                              <button
                                onClick={() => handleKickUserFromSeat(seat.id)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-600 border border-slate-700 text-amber-300 hover:text-white transition-all active:scale-95"
                                title="Move User to Audience (Kick Seat)"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Kick user from room (if occupied) */}
                            {isOccupied && (
                              <button
                                onClick={() => handleKickUserFromRoom(seat.id)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 border border-slate-700 text-rose-400 hover:text-white transition-all active:scale-95"
                                title="Kick User Out of Room"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seat User Profile Modal */}
      {selectedSeatForModal && selectedSeatForModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-purple-500/30 rounded-3xl p-5 text-white shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedSeatForModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <img
                  src={selectedSeatForModal.user.avatar}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                />
                {selectedSeatForModal.user.vipLevel && (
                  <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full border border-slate-950 shadow-md">
                    VIP {selectedSeatForModal.user.vipLevel}
                  </span>
                )}
              </div>

              <h3 className="font-black text-lg text-white mb-1">{selectedSeatForModal.user.name}</h3>
              {selectedSeatForModal.title && (
                <span className="bg-purple-900/80 border border-purple-400/40 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  {selectedSeatForModal.title} (Seat #{selectedSeatForModal.id})
                </span>
              )}

              <p className="text-xs text-slate-300 italic max-w-xs mb-3">
                "{selectedSeatForModal.user.bio || 'Hapi Voice Room Member 🎤'}"
              </p>

              {/* XP Level Progress Card */}
              <div className="w-full my-2 text-left">
                <LevelBadge
                  level={selectedSeatForModal.user.level}
                  xp={selectedSeatForModal.user.xp}
                  size="lg"
                />
              </div>

              {/* Host Quick Actions in User Seat Modal */}
              <div className="w-full pt-3 mt-3 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-amber-300 text-left flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Host Admin Actions
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => handleToggleMuteSeat(selectedSeatForModal.id)}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px]"
                  >
                    {selectedSeatForModal.isMuted ? '🔊 Unmute' : '🔇 Mute'}
                  </button>
                  <button
                    onClick={() => handleKickUserFromSeat(selectedSeatForModal.id)}
                    className="bg-slate-800 hover:bg-amber-600 border border-slate-700 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px] text-amber-300 hover:text-white"
                  >
                    <UserMinus className="w-3 h-3" />
                    Kick Seat
                  </button>
                  <button
                    onClick={() => handleKickUserFromRoom(selectedSeatForModal.id)}
                    className="bg-slate-800 hover:bg-rose-600 border border-slate-700 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 text-[11px] text-rose-400 hover:text-white"
                  >
                    <UserX className="w-3 h-3" />
                    Kick Room
                  </button>
                </div>
              </div>

              <div className="w-full flex gap-2 pt-3 border-t border-slate-800 mt-2">
                <button
                  onClick={() => {
                    setSelectedSeatForModal(null);
                    onOpenGiftStore();
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 text-slate-950 font-black text-xs py-2.5 rounded-full shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <GiftIcon className="w-4 h-4" />
                  Send Gift to {selectedSeatForModal.user.name.split(' ')[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
