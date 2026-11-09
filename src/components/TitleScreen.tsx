import React from 'react';
import { Play, Trophy, Users, Award, ShoppingBag, Settings, Volume2, VolumeX, Coins, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../three/characters/CharacterRegistry';
import { sounds } from '../audio/SoundManager';

interface TitleScreenProps {
  onStart: () => void;
  onOpenGallery: () => void;
  onOpenMissions: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  selectedCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  onSelectCharacter: (charId: CharacterId) => void;
  highScore: number;
  maxDistance: number;
  totalCoins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  unclaimedMissionsCount: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenGallery,
  onOpenMissions,
  onOpenShop,
  onOpenSettings,
  selectedCharacter,
  unlockedCharacters,
  onSelectCharacter,
  highScore,
  maxDistance,
  totalCoins,
  isMuted,
  onToggleMute,
  unclaimedMissionsCount,
}) => {
  const activeCharConfig = CHARACTERS[selectedCharacter];

  // Quick switch between unlocked characters
  const handlePrevCharacter = () => {
    sounds.playClick();
    const idx = unlockedCharacters.indexOf(selectedCharacter);
    const prevIdx = (idx - 1 + unlockedCharacters.length) % unlockedCharacters.length;
    onSelectCharacter(unlockedCharacters[prevIdx]);
  };

  const handleNextCharacter = () => {
    sounds.playClick();
    const idx = unlockedCharacters.indexOf(selectedCharacter);
    const nextIdx = (idx + 1) % unlockedCharacters.length;
    onSelectCharacter(unlockedCharacters[nextIdx]);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-6 pointer-events-none">
      {/* Top Bar: High Score, Coins & Settings */}
      <div className="flex justify-between items-center w-full">
        {/* High Score Badge */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-amber-500/90 border-2 border-yellow-200 text-amber-950 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <Trophy className="w-4 h-4 text-yellow-950 fill-yellow-300" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-wider text-yellow-900/80 leading-none">Best</span>
            <span className="text-sm sm:text-base font-black font-game leading-tight tabular-nums text-yellow-950">
              {highScore.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* Right Group: Coins & Settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Coin Vault */}
          <div className="flex items-center gap-1.5 bg-amber-500/90 border-2 border-yellow-200 text-amber-950 px-3 py-1.5 rounded-2xl shadow-lg font-game font-black text-sm">
            <Coins className="w-4 h-4 fill-amber-950" />
            <span className="tabular-nums">{totalCoins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl border-2 border-slate-700 shadow-md cursor-pointer active:scale-95 transition-transform"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl border-2 border-slate-700 shadow-md cursor-pointer active:scale-95 transition-transform"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Middle Center: Logo & Main CTAs */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Wolf Chase Alert Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 border-2 border-white text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-md mb-2 animate-bounce">
          <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span>Predatory Wolf Chase Edition</span>
          <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
        </div>

        {/* Title Lockup */}
        <div className="flex flex-col items-center select-none mb-1">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-game font-black text-yellow-300 drop-shadow-[0_4px_0_#b45309] tracking-tight leading-none">
            CARTOON RUN
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl sm:text-4xl md:text-5xl font-game font-black text-rose-500 drop-shadow-[0_4px_0_#881337] tracking-tight">
              ADVENTURE
            </span>
          </div>
        </div>

        {/* Quick Hero Selector Dock */}
        <div className="pointer-events-auto my-3 flex items-center gap-1.5 bg-slate-900/90 border-2 border-yellow-400/80 p-1.5 rounded-full shadow-lg">
          <button
            onClick={handlePrevCharacter}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-300 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Previous Hero"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenGallery();
            }}
            className="flex items-center gap-2 px-3 py-1 hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer"
          >
            <span className="text-xl">{activeCharConfig.collectibleEmoji}</span>
            <div className="flex flex-col items-start text-left leading-tight">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Selected Hero</span>
              <span className="text-yellow-300 font-black font-game text-sm sm:text-base">
                {activeCharConfig.name}
              </span>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md font-bold ml-1">
              Gallery ➔
            </span>
          </button>

          <button
            onClick={handleNextCharacter}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-yellow-300 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            title="Next Hero"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Primary START RUN CTA */}
        <button
          onClick={() => {
            sounds.playClick();
            onStart();
          }}
          className="pointer-events-auto group relative px-10 sm:px-14 py-4 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 font-game font-black text-2xl sm:text-3xl rounded-3xl border-4 border-white shadow-[0_8px_0_#b45309] active:shadow-[0_2px_0_#b45309] active:translate-y-1.5 transition-all cursor-pointer flex items-center gap-3 my-2"
        >
          <Play className="w-8 h-8 fill-slate-950 text-slate-950" />
          <span>START RUN!</span>
        </button>

        <span className="text-[11px] text-sky-950 font-bold bg-white/80 px-3 py-1 rounded-full mt-1">
          Press <kbd className="px-1.5 py-0.5 bg-yellow-400 rounded text-black font-mono">SPACE</kbd> or Tap to Play
        </span>
      </div>

      {/* Bottom Hub Navigation Dock */}
      <div className="pointer-events-auto flex items-center justify-center gap-2 sm:gap-4 w-full max-w-xl mx-auto">
        {/* Characters Gallery Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenGallery();
          }}
          className="flex-1 py-3 bg-slate-900/90 hover:bg-slate-800 border-2 border-yellow-400/70 text-white rounded-2xl shadow-lg flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer"
        >
          <Users className="w-5 h-5 text-yellow-400" />
          <span className="text-[10px] sm:text-xs font-game font-bold">ALL HEROES</span>
        </button>

        {/* Missions Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenMissions();
          }}
          className="relative flex-1 py-3 bg-slate-900/90 hover:bg-slate-800 border-2 border-sky-400/70 text-white rounded-2xl shadow-lg flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer"
        >
          {unclaimedMissionsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {unclaimedMissionsCount}
            </span>
          )}
          <Award className="w-5 h-5 text-sky-400" />
          <span className="text-[10px] sm:text-xs font-game font-bold">MISSIONS</span>
        </button>

        {/* Shop Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenShop();
          }}
          className="flex-1 py-3 bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-400/70 text-white rounded-2xl shadow-lg flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] sm:text-xs font-game font-bold">SHOP</span>
        </button>
      </div>
    </div>
  );
};
