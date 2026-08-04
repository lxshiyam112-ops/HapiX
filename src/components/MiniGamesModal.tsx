import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { playSoundboardEffect } from '../lib/audioEngine';
import confetti from 'canvas-confetti';
import {
  X,
  Dices,
  Sparkles,
  Coins,
  Gift,
  Trophy,
  Flame,
  Zap,
  HelpCircle,
  Repeat,
  RotateCw,
  Info,
} from 'lucide-react';

interface MiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onRewardCoins: (amount: number) => void;
  onSpendCoins?: (amount: number) => boolean;
}

// Food wheel items definition
export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  isFruit: boolean;
  bgGradient: string;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: 'lemon', name: 'Lemon', icon: '🍋', multiplier: 5, isFruit: true, bgGradient: 'from-amber-400 to-yellow-500' },
  { id: 'strawberry', name: 'Strawberry', icon: '🍓', multiplier: 5, isFruit: true, bgGradient: 'from-rose-500 to-red-600' },
  { id: 'mango', name: 'Mango', icon: '🥭', multiplier: 5, isFruit: true, bgGradient: 'from-orange-400 to-amber-500' },
  { id: 'fish', name: 'Fish', icon: '🐟', multiplier: 10, isFruit: false, bgGradient: 'from-blue-500 to-cyan-600' },
  { id: 'burger', name: 'Burger', icon: '🍔', multiplier: 15, isFruit: false, bgGradient: 'from-amber-600 to-orange-700' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', multiplier: 25, isFruit: false, bgGradient: 'from-red-500 to-orange-500' },
  { id: 'chicken', name: 'Chicken', icon: '🍗', multiplier: 45, isFruit: false, bgGradient: 'from-amber-700 to-red-800' },
  { id: 'apple', name: 'Apple', icon: '🍎', multiplier: 5, isFruit: true, bgGradient: 'from-red-500 to-rose-600' },
];

const CHIP_VALUES = [100, 1000, 10000, 50000, 100000];

const SLOT_SYMBOLS = ['🍒', '🍋', '🍇', '💎', '7️⃣', '👑'];

export const MiniGamesModal: React.FC<MiniGamesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRewardCoins,
  onSpendCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'greedy_bear' | 'slot' | 'coinflip' | 'wheel' | 'treasure'>('greedy_bear');

  // --- GREEDY BEAR FOOD WHEEL GAME STATE ---
  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [userBets, setUserBets] = useState<{ [key: string]: number }>({
    lemon: 0,
    strawberry: 0,
    mango: 0,
    fish: 0,
    burger: 0,
    pizza: 0,
    chicken: 0,
    apple: 0,
  });
  const [isDrawingBear, setIsDrawingBear] = useState<boolean>(false);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(0);
  const [winningItem, setWinningItem] = useState<FoodItem | null>(null);
  const [bearMessage, setBearMessage] = useState<string | null>(null);
  const [todaysWin, setTodaysWin] = useState<number>(0);
  const [recentDrawHistory, setRecentDrawHistory] = useState<FoodItem[]>([
    FOOD_ITEMS[7], // Apple
    FOOD_ITEMS[1], // Strawberry
    FOOD_ITEMS[3], // Fish
    FOOD_ITEMS[4], // Burger
    FOOD_ITEMS[0], // Lemon
    FOOD_ITEMS[7], // Apple
  ]);

  // Game 2: Slot Machine State
  const [slotBet, setSlotBet] = useState<number>(50);
  const [slotReels, setSlotReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinningSlots, setIsSpinningSlots] = useState<boolean>(false);
  const [slotResultMsg, setSlotResultMsg] = useState<string | null>(null);

  // Game 3: Coin Flip State
  const [flipBet, setFlipBet] = useState<number>(50);
  const [flipChoice, setFlipChoice] = useState<'HEAD' | 'TAIL'>('HEAD');
  const [isFlippingCoin, setIsFlippingCoin] = useState<boolean>(false);
  const [coinResult, setCoinResult] = useState<'HEAD' | 'TAIL' | null>(null);
  const [flipResultMsg, setFlipResultMsg] = useState<string | null>(null);

  // Game 4: Lucky Wheel State
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelDegree, setWheelDegree] = useState<number>(0);
  const [wheelWinText, setWheelWinText] = useState<string | null>(null);

  // Game 5: Mystery Treasure State
  const [chestOpened, setChestOpened] = useState<number | null>(null);
  const [openingChest, setOpeningChest] = useState<boolean>(false);
  const [treasureRewards, setTreasureRewards] = useState<number[]>([150, 50, 500]);
  const [treasureMsg, setTreasureMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const spendCoins = (amount: number): boolean => {
    if (onSpendCoins) {
      return onSpendCoins(amount);
    }
    return currentUser.coins >= amount;
  };

  // Helper to format large numbers (e.g., 1K, 10K, 1M)
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  // --- GREEDY BEAR FOOD WHEEL LOGIC ---
  const handlePlaceBetOnFood = (foodId: string) => {
    if (isDrawingBear) return;
    if (currentUser.coins < selectedChip) {
      setBearMessage('❌ Insufficient coins balance!');
      return;
    }

    if (!spendCoins(selectedChip)) return;

    setUserBets((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + selectedChip,
    }));
    playSoundboardEffect('coin');
    setBearMessage(null);
  };

  // Quick Bet: Bet selectedChip on all Fruit items (Apple, Lemon, Strawberry, Mango)
  const handleBetAllFruits = () => {
    if (isDrawingBear) return;
    const totalCost = selectedChip * 4;
    if (currentUser.coins < totalCost) {
      setBearMessage(`❌ Need ${totalCost.toLocaleString()} Coins to bet on all fruits!`);
      return;
    }

    if (!spendCoins(totalCost)) return;

    setUserBets((prev) => ({
      ...prev,
      apple: (prev.apple || 0) + selectedChip,
      lemon: (prev.lemon || 0) + selectedChip,
      strawberry: (prev.strawberry || 0) + selectedChip,
      mango: (prev.mango || 0) + selectedChip,
    }));
    playSoundboardEffect('coin');
    setBearMessage(`✅ Placed ${selectedChip} Coins on ALL Fruits!`);
  };

  // Quick Bet: Bet selectedChip on Pizza
  const handleBetPizza = () => {
    handlePlaceBetOnFood('pizza');
  };

  // Clear all current bets
  const handleClearBets = () => {
    if (isDrawingBear) return;
    setUserBets({
      lemon: 0,
      strawberry: 0,
      mango: 0,
      fish: 0,
      burger: 0,
      pizza: 0,
      chicken: 0,
      apple: 0,
    });
  };

  // Start the Greedy Bear Wheel Draw
  const handleStartBearDraw = () => {
    if (isDrawingBear) return;

    const totalBetsPlaced = Object.values(userBets).reduce((a: number, b: number) => a + b, 0);
    if (totalBetsPlaced === 0) {
      setBearMessage('⚠️ Please place a bet on at least one food item before drawing!');
      return;
    }

    setIsDrawingBear(true);
    setWinningItem(null);
    setBearMessage(null);
    playSoundboardEffect('drumroll');

    let cycles = 0;
    let currentIdx = activeHighlightIndex;

    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % FOOD_ITEMS.length;
      setActiveHighlightIndex(currentIdx);
      cycles++;

      if (cycles > 24) {
        clearInterval(interval);

        // Pick winning food slot (weighted slightly or pure random)
        const winningSlotIdx = Math.floor(Math.random() * FOOD_ITEMS.length);
        const winningFood = FOOD_ITEMS[winningSlotIdx];

        setActiveHighlightIndex(winningSlotIdx);
        setWinningItem(winningFood);
        setIsDrawingBear(false);

        // Calculate Payout
        const betOnWinningFood = userBets[winningFood.id] || 0;
        if (betOnWinningFood > 0) {
          const winAmount = betOnWinningFood * winningFood.multiplier;
          onRewardCoins(winAmount);
          setTodaysWin((prev) => prev + winAmount);
          playSoundboardEffect('cheer');
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
          setBearMessage(`🎉 BEAR ATE ${winningFood.name.toUpperCase()} (${winningFood.multiplier}x)! Won ${winAmount.toLocaleString()} COINS!`);
        } else {
          playSoundboardEffect('applause');
          setBearMessage(`🐻 Bear ate ${winningFood.icon} ${winningFood.name} (${winningFood.multiplier}x)! Better luck next round!`);
        }

        // Add to history
        setRecentDrawHistory((prev) => [winningFood, ...prev.slice(0, 7)]);

        // Reset user bets for next turn
        setUserBets({
          lemon: 0,
          strawberry: 0,
          mango: 0,
          fish: 0,
          burger: 0,
          pizza: 0,
          chicken: 0,
          apple: 0,
        });
      }
    }, 120);
  };

  // --- SLOT MACHINE GAME LOGIC ---
  const handleSpinSlots = () => {
    if (isSpinningSlots) return;
    if (currentUser.coins < slotBet) {
      setSlotResultMsg('❌ insufficient coins!');
      return;
    }

    if (!spendCoins(slotBet)) return;

    setIsSpinningSlots(true);
    setSlotResultMsg(null);
    playSoundboardEffect('drumroll');

    let spinCounter = 0;
    const spinInterval = setInterval(() => {
      setSlotReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);
      spinCounter++;
      if (spinCounter > 15) {
        clearInterval(spinInterval);
        finishSlotSpin();
      }
    }, 100);
  };

  const finishSlotSpin = () => {
    const finalReels = [
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
    ];
    setSlotReels(finalReels);
    setIsSpinningSlots(false);

    const [r1, r2, r3] = finalReels;
    if (r1 === r2 && r2 === r3) {
      let multiplier = 5;
      if (r1 === '7️⃣') multiplier = 50;
      else if (r1 === '💎') multiplier = 20;
      else if (r1 === '👑') multiplier = 10;

      const winCoins = slotBet * multiplier;
      onRewardCoins(winCoins);
      playSoundboardEffect('cheer');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setSlotResultMsg(`🎉 MEGA JACKPOT! 3x ${r1} - Won ${winCoins} Coins! (${multiplier}x)`);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const winCoins = Math.floor(slotBet * 1.8);
      onRewardCoins(winCoins);
      playSoundboardEffect('coin');
      setSlotResultMsg(`✨ 2 Matching Symbols! Won ${winCoins} Coins!`);
    } else {
      setSlotResultMsg('😅 No match this time! Try again.');
    }
  };

  // --- COIN FLIP GAME LOGIC ---
  const handleFlipCoin = () => {
    if (isFlippingCoin) return;
    if (currentUser.coins < flipBet) {
      setFlipResultMsg('❌ Insufficient coins!');
      return;
    }

    if (!spendCoins(flipBet)) return;

    setIsFlippingCoin(true);
    setCoinResult(null);
    setFlipResultMsg(null);
    playSoundboardEffect('drumroll');

    setTimeout(() => {
      const outcome: 'HEAD' | 'TAIL' = Math.random() < 0.5 ? 'HEAD' : 'TAIL';
      setCoinResult(outcome);
      setIsFlippingCoin(false);

      if (outcome === flipChoice) {
        const winCoins = flipBet * 2;
        onRewardCoins(winCoins);
        playSoundboardEffect('cheer');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setFlipResultMsg(`🎉 WON! Coin landed on ${outcome}! Received ${winCoins} Coins (2x)!`);
      } else {
        playSoundboardEffect('applause');
        setFlipResultMsg(`💔 Coin landed on ${outcome}. Better luck next flip!`);
      }
    }, 1500);
  };

  // --- LUCKY WHEEL LOGIC ---
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    if (currentUser.coins < 50) {
      setWheelWinText('❌ Need 50 Coins to spin!');
      return;
    }

    if (!spendCoins(50)) return;

    setWheelSpinning(true);
    setWheelWinText(null);

    const rewards = [100, 200, 50, 500, 0, 1000];
    const randomIndex = Math.floor(Math.random() * rewards.length);
    const rewardAmount = rewards[randomIndex];

    const targetDegree = wheelDegree + 5 * 360 + randomIndex * 60 + 30;
    setWheelDegree(targetDegree);

    setTimeout(() => {
      setWheelSpinning(false);
      playSoundboardEffect('coin');
      if (rewardAmount > 0) {
        onRewardCoins(rewardAmount);
        setWheelWinText(`🎉 Congratulations! You won ${rewardAmount} Gold Coins!`);
        if (rewardAmount >= 500) {
          confetti({ particleCount: 100, spread: 80 });
        }
      } else {
        setWheelWinText('😅 Better luck next spin!');
      }
    }, 3000);
  };

  // --- TREASURE CHEST LOGIC ---
  const handleOpenChest = (index: number) => {
    if (chestOpened !== null || openingChest) return;
    if (currentUser.coins < 100) {
      setTreasureMsg('❌ Need 100 Coins to unlock a treasure box!');
      return;
    }

    if (!spendCoins(100)) return;

    setOpeningChest(true);
    setTreasureMsg(null);
    playSoundboardEffect('drumroll');

    const possible = [50, 150, 300, 800, 2000, 0];
    const generated = [
      possible[Math.floor(Math.random() * possible.length)],
      possible[Math.floor(Math.random() * possible.length)],
      possible[Math.floor(Math.random() * possible.length)],
    ];
    setTreasureRewards(generated);

    setTimeout(() => {
      setChestOpened(index);
      setOpeningChest(false);
      const won = generated[index];

      if (won > 0) {
        onRewardCoins(won);
        playSoundboardEffect('cheer');
        confetti({ particleCount: 70, spread: 70 });
        setTreasureMsg(`🎁 UNLOCKED! You found ${won} Gold Coins inside!`);
      } else {
        setTreasureMsg('📦 Empty Box! Try another treasure box!');
      }
    }, 1200);
  };

  const resetTreasure = () => {
    setChestOpened(null);
    setTreasureMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-3 sm:p-4 text-white shadow-2xl relative overflow-x-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-1.5">
                Greedy Bear Food Wheel 🐻‍❄️🍕
              </h3>
              <p className="text-[10px] text-slate-400">Bet on food & win up to 45x Coins!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Coin Balance */}
            <div className="bg-slate-950 border border-amber-500/40 rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-black text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Game Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-2xl my-2 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('greedy_bear')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'greedy_bear'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🐻‍❄️</span>
            <span>Greedy Bear</span>
          </button>

          <button
            onClick={() => setActiveTab('slot')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'slot'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🎰</span>
            <span>777 Slots</span>
          </button>

          <button
            onClick={() => setActiveTab('coinflip')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'coinflip'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🪙</span>
            <span>Coin Flip</span>
          </button>

          <button
            onClick={() => setActiveTab('wheel')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'wheel'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🎡</span>
            <span>Lucky Wheel</span>
          </button>

          <button
            onClick={() => setActiveTab('treasure')}
            className={`py-1.5 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-all ${
              activeTab === 'treasure'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🎁</span>
            <span>Treasure</span>
          </button>
        </div>

        {/* TAB 1: GREEDY BEAR FOOD WHEEL (Exact match to uploaded screenshot) */}
        {activeTab === 'greedy_bear' && (
          <div className="flex flex-col items-center py-1">
            
            {/* Header Score & Info */}
            <div className="w-full flex items-center justify-between text-xs font-black text-amber-300 mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>TODAY'S WIN: <span className="text-white font-mono">{todaysWin.toLocaleString()}</span></span>
              </div>
              <button
                onClick={handleClearBets}
                disabled={isDrawingBear}
                className="text-[10px] bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded-full border border-slate-700"
              >
                Clear Bets
              </button>
            </div>

            {/* MAIN GREEDY BEAR WHEEL ARENA */}
            <div className="w-full bg-gradient-to-b from-indigo-950/80 via-slate-950 to-indigo-950/90 border-2 border-amber-500/40 rounded-3xl p-3 shadow-2xl relative mb-2">
              
              {/* 8 Food Slots Octagon Grid around the Bear */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-sm mx-auto my-1">
                
                {/* Slot 0: Lemon x5 */}
                <button
                  onClick={() => handlePlaceBetOnFood('lemon')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 0
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍋</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x5</span>
                  {userBets.lemon > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.lemon)}
                    </span>
                  )}
                </button>

                {/* Slot 1: Strawberry x5 */}
                <button
                  onClick={() => handlePlaceBetOnFood('strawberry')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 1
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍓</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x5</span>
                  {userBets.strawberry > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.strawberry)}
                    </span>
                  )}
                </button>

                {/* Slot 2: Mango x5 */}
                <button
                  onClick={() => handlePlaceBetOnFood('mango')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 2
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🥭</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x5</span>
                  {userBets.mango > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.mango)}
                    </span>
                  )}
                </button>

                {/* Slot 7: Apple x5 (Left Middle) */}
                <button
                  onClick={() => handlePlaceBetOnFood('apple')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 7
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍎</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x5</span>
                  {userBets.apple > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.apple)}
                    </span>
                  )}
                </button>

                {/* CENTER: GREEDY BEAR MASCOT & DRAW BUTTON */}
                <div className="flex flex-col items-center justify-center p-1 bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 rounded-full border-2 border-amber-400/60 text-center relative shadow-inner">
                  <div className="text-3xl sm:text-4xl animate-pulse">🐻‍❄️</div>
                  <button
                    onClick={handleStartBearDraw}
                    disabled={isDrawingBear}
                    className="mt-1 bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-amber-200 shadow-md active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isDrawingBear ? 'Drawing...' : 'DRAW 🍴'}
                  </button>
                </div>

                {/* Slot 3: Fish x10 (Right Middle) */}
                <button
                  onClick={() => handlePlaceBetOnFood('fish')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 3
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🐟</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x10</span>
                  {userBets.fish > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.fish)}
                    </span>
                  )}
                </button>

                {/* Slot 6: Chicken x45 */}
                <button
                  onClick={() => handlePlaceBetOnFood('chicken')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 6
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍗</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x45</span>
                  {userBets.chicken > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.chicken)}
                    </span>
                  )}
                </button>

                {/* Slot 5: Pizza x25 */}
                <button
                  onClick={() => handlePlaceBetOnFood('pizza')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 5
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍕</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x25</span>
                  {userBets.pizza > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.pizza)}
                    </span>
                  )}
                </button>

                {/* Slot 4: Burger x15 */}
                <button
                  onClick={() => handlePlaceBetOnFood('burger')}
                  disabled={isDrawingBear}
                  className={`p-2 rounded-2xl border-2 transition-all relative flex flex-col items-center justify-center ${
                    activeHighlightIndex === 4
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/80 scale-105 shadow-lg z-20'
                      : 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">🍔</span>
                  <span className="text-[10px] font-black text-amber-300 bg-black/40 px-1.5 rounded-full mt-0.5">x15</span>
                  {userBets.burger > 0 && (
                    <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-slate-950 shadow-md">
                      {formatCompact(userBets.burger)}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Bet Buttons Bar (Fruit x5 vs Pizza x25) */}
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={handleBetAllFruits}
                  disabled={isDrawingBear}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-xs px-4 py-1.5 rounded-full border border-emerald-300 shadow-md flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <span>🥗 Fruit (x5 All)</span>
                </button>

                <button
                  onClick={handleBetPizza}
                  disabled={isDrawingBear}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-xs px-4 py-1.5 rounded-full border border-amber-300 shadow-md flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <span>🍕 Pizza (x25)</span>
                </button>
              </div>
            </div>

            {bearMessage && (
              <p className="text-xs font-bold text-amber-300 text-center my-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full w-full">
                {bearMessage}
              </p>
            )}

            {/* CHIP SELECTION ROW (100, 1K, 10K, 50K, 100K) */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2 my-1">
              <p className="text-[10px] text-slate-400 font-bold mb-1 text-center">Choose Chip Wager Amount:</p>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5">
                {CHIP_VALUES.map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelectedChip(val)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-black transition-all flex items-center gap-1 ${
                      selectedChip === val
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md scale-105'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 border border-slate-950" />
                    <span>{formatCompact(val)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MILESTONE REWARD CHESTS (1M, 10M, 50M, 100M, 500M) */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-2 my-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                <span>Reward Chest Milestones:</span>
                <span className="text-amber-300">Target Win Progress</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {[
                  { label: '1M', icon: '📦' },
                  { label: '10M', icon: '🥈' },
                  { label: '50M', icon: '🥇' },
                  { label: '100M', icon: '👑' },
                  { label: '500M', icon: '💎' },
                ].map((chest, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <span className="text-base block">{chest.icon}</span>
                    <span className="text-[9px] font-extrabold text-amber-300">{chest.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT DRAW HISTORY BAR */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold block mb-1">Recent Draw History:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-extrabold">
                  NEW
                </span>
                {recentDrawHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sm shadow-sm shrink-0"
                    title={item.name}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 777 SLOT MACHINE */}
        {activeTab === 'slot' && (
          <div className="flex flex-col items-center py-2">
            <p className="text-xs text-amber-300/90 font-bold mb-3 text-center">
              Spin 3 matching reels to hit 50x Mega Coin Jackpot!
            </p>

            <div className="w-full bg-gradient-to-b from-purple-950 via-slate-950 to-purple-950 border-4 border-amber-400/80 rounded-3xl p-4 shadow-2xl mb-4 relative">
              <div className="flex justify-center gap-2 mb-3">
                {slotReels.map((symbol, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-24 bg-slate-900 border-2 border-amber-400/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner relative overflow-hidden"
                  >
                    <div className={isSpinningSlots ? 'animate-bounce' : ''}>{symbol}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-extrabold mt-2">
                <span className="text-slate-400 text-[11px]">Bet:</span>
                {[20, 50, 100, 500].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSlotBet(b)}
                    className={`px-3 py-1 rounded-full border transition-all ${
                      slotBet === b
                        ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {b} 🪙
                  </button>
                ))}
              </div>
            </div>

            {slotResultMsg && (
              <p className="text-xs font-bold text-amber-300 text-center mb-3 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full w-full">
                {slotResultMsg}
              </p>
            )}

            <button
              onClick={handleSpinSlots}
              disabled={isSpinningSlots}
              className="w-full bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600 hover:opacity-95 text-slate-950 font-black text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              {isSpinningSlots ? 'Spinning Reels...' : `Spin Slots (${slotBet} Coins)`}
            </button>
          </div>
        )}

        {/* TAB 3: COIN FLIP */}
        {activeTab === 'coinflip' && (
          <div className="flex flex-col items-center py-2">
            <p className="text-xs text-amber-300/90 font-bold mb-3 text-center">
              Predict Head or Tail & win 2x double coin multiplier!
            </p>

            <div className="w-28 h-28 my-2 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-4 border-amber-200 flex items-center justify-center shadow-2xl relative">
              <div
                className={`text-center font-black text-slate-950 text-xl transition-transform duration-500 ${
                  isFlippingCoin ? 'animate-spin' : ''
                }`}
              >
                {coinResult ? coinResult : flipChoice}
                <div className="text-[10px] font-extrabold opacity-80">GOLD COIN</div>
              </div>
            </div>

            <div className="flex gap-3 my-3">
              <button
                onClick={() => setFlipChoice('HEAD')}
                className={`px-5 py-2 rounded-full font-black text-xs border transition-all ${
                  flipChoice === 'HEAD'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                🪙 HEAD
              </button>
              <button
                onClick={() => setFlipChoice('TAIL')}
                className={`px-5 py-2 rounded-full font-black text-xs border transition-all ${
                  flipChoice === 'TAIL'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                🦅 TAIL
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-extrabold mb-3">
              <span className="text-slate-400 text-[11px]">Bet:</span>
              {[20, 50, 100, 200, 500].map((b) => (
                <button
                  key={b}
                  onClick={() => setFlipBet(b)}
                  className={`px-2.5 py-1 rounded-full border transition-all ${
                    flipBet === b
                      ? 'bg-purple-500 border-purple-400 text-white font-black'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {b} 🪙
                </button>
              ))}
            </div>

            {flipResultMsg && (
              <p className="text-xs font-bold text-amber-300 text-center mb-3 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full w-full">
                {flipResultMsg}
              </p>
            )}

            <button
              onClick={handleFlipCoin}
              disabled={isFlippingCoin}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-black text-sm py-3 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              {isFlippingCoin ? 'Flipping Coin...' : `Flip Gold Coin (${flipBet} Coins)`}
            </button>
          </div>
        )}

        {/* TAB 4: LUCKY WHEEL */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col items-center py-2">
            <div className="relative w-44 h-44 mb-3">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

              <div
                style={{
                  transform: `rotate(${wheelDegree}deg)`,
                  transition: wheelSpinning ? 'transform 3s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
                className="w-full h-full rounded-full border-4 border-amber-400 bg-gradient-to-tr from-purple-950 via-pink-900 to-amber-800 shadow-xl overflow-hidden flex items-center justify-center relative"
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 opacity-90 text-[11px] font-black">
                  <div className="bg-amber-500/30 border p-2 text-center text-amber-200">100 🪙</div>
                  <div className="bg-pink-500/30 border p-2 text-center text-pink-200">200 🪙</div>
                  <div className="bg-purple-500/30 border p-2 text-center text-purple-200">50 🪙</div>
                  <div className="bg-emerald-500/30 border p-2 text-center text-emerald-200">500 🪙</div>
                  <div className="bg-slate-800/50 border p-2 text-center text-slate-400">Try 0</div>
                  <div className="bg-yellow-400/40 border p-2 text-center text-amber-300">1000 🪙</div>
                </div>

                <div className="w-10 h-10 bg-slate-950 border-2 border-amber-400 rounded-full z-10 flex items-center justify-center shadow-inner">
                  <Gift className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>

            {wheelWinText && (
              <p className="text-xs font-bold text-amber-300 text-center mb-3 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full w-full">
                {wheelWinText}
              </p>
            )}

            <button
              onClick={handleSpinWheel}
              disabled={wheelSpinning}
              className="w-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black text-xs py-3 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Coins className="w-4 h-4" />
              {wheelSpinning ? 'Spinning Wheel...' : 'Spin Wheel (50 Coins)'}
            </button>
          </div>
        )}

        {/* TAB 5: MYSTERY TREASURE BOX */}
        {activeTab === 'treasure' && (
          <div className="flex flex-col items-center py-2">
            <p className="text-xs text-amber-300/90 font-bold mb-3 text-center">
              Pick 1 of 3 Mystery Chests to win up to 2,000 Coins!
            </p>

            <div className="grid grid-cols-3 gap-3 w-full my-3">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenChest(idx)}
                  disabled={chestOpened !== null || openingChest}
                  className={`h-28 rounded-2xl border-2 flex flex-col items-center justify-center transition-all p-2 ${
                    chestOpened === idx
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105'
                      : 'bg-slate-800/80 border-purple-500/40 hover:border-amber-400 text-white'
                  }`}
                >
                  <span className="text-3xl mb-1">
                    {chestOpened === idx ? '🔓' : '🎁'}
                  </span>
                  <span className="text-[10px] font-black text-amber-300">
                    {chestOpened !== null ? `${treasureRewards[idx]} 🪙` : `Chest #${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>

            {treasureMsg && (
              <p className="text-xs font-bold text-amber-300 text-center mb-3 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full w-full">
                {treasureMsg}
              </p>
            )}

            {chestOpened !== null ? (
              <button
                onClick={resetTreasure}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5"
              >
                <Repeat className="w-4 h-4" /> Reset Chests (Try Again)
              </button>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Cost: 100 Coins per chest unlock
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
