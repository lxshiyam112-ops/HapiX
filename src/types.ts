export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp?: number;
  vipLevel: number;
  coins: number;
  gems: number;
  frameUrl?: string;
  entryVehicle?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'secret';
}

export interface MicSeat {
  id: number; // 0 is host, 1-8/12 are seats
  userId: string | null;
  user?: User;
  isMuted: boolean;
  isLocked: boolean;
  isSpeaking: boolean;
  speakingVolume: number; // 0 - 100
  title?: string; // e.g., "Host", "Co-Host", "VIP"
}

export interface Gift {
  id: string;
  name: string;
  category: 'popular' | 'luxury' | 'supercar' | 'magic';
  price: number;
  icon: string;
  animationType: 'confetti' | 'car_drive' | 'dragon_fire' | 'diamond_rain' | 'galaxy';
  soundFx?: string;
  description: string;
}

export interface GiftEvent {
  id: string;
  senderName: string;
  senderAvatar: string;
  receiverName: string;
  gift: Gift;
  count: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  vipLevel?: number;
  text: string;
  type: 'text' | 'gift' | 'system' | 'welcome' | 'dice';
  giftInfo?: {
    giftName: string;
    giftIcon: string;
    count: number;
    receiverName: string;
  };
  timestamp: number;
}

export interface VoiceRoom {
  id: string;
  title: string;
  notice: string;
  host: User;
  category: 'Music' | 'Party' | 'Late Night' | 'Gaming' | 'Bengali Adda';
  bgTheme: 'neon_purple' | 'luxury_gold' | 'cyberpunk' | 'romantic_pink' | 'ocean_blue' | 'starry_night';
  bgmPlaying: boolean;
  currentTrack?: string;
  isLocked: boolean;
  password?: string;
  onlineCount: number;
  seats: MicSeat[];
  giftValueToday: number;
  tags: string[];
}

export type VoiceEffect = 'normal' | 'deep' | 'echo' | 'reverb' | 'robot' | 'female_pitch' | 'male_pitch';

export interface SoundBoardEffect {
  id: string;
  name: string;
  icon: string;
  type: 'applause' | 'laughter' | 'drumroll' | 'cheer' | 'horn' | 'coin';
}
