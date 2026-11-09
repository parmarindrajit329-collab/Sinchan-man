import React from 'react';
import { Pause, Volume2, VolumeX, Sparkles, Footprints, Gamepad2, Magnet, Shield, Flame, AlertTriangle } from 'lucide-react';
import { GameStats } from '../types/game';
import { CHARACTERS } from '../three/characters/CharacterRegistry';
import { sounds } from '../audio/SoundManager';

interface GameHUDProps {
  stats: GameStats;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showTouchButtons: boolean;
  onToggleTouchButtons: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  onPause,
  isMuted,
  onToggleMute,
  showTouchButtons,
  onToggleTouchButtons,
}) => {
  const activeCharConfig = CHARACTERS[stats.selectedCharacter];
  const isWolfClose = stats.wolfDistance < 3.2;
  const isWolfCritical = stats.wolfDistance < 2.0;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-3 sm:p-5 flex flex-col justify-between">
      {/* Top Status Bar: Score, Distance, Coins, Pause */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Left: Score & Distance Clusters */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main Score Pill */}
          <div className="flex items-center gap-2.5 bg-slate-900/85 border-2 border-yellow-400/80 text-white px-3.5 py-1.5 rounded-2xl shadow-lg">
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider font-black text-yellow-300/80 leading-none">
                Score
              </span>
              <span className="text-xl sm:text-2xl font-game font-black text-yellow-300 leading-tight tabular-nums">
                {stats.score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Distance Meter */}
          <div className="flex items-center gap-2 bg-slate-900/75 border border-slate-700/80 text-white px-3 py-1 rounded-xl text-xs font-bold w-fit">
            <Footprints className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-300">Distance:</span>
            <span className="text-sky-300 tabular-nums">{stats.distance} m</span>
          </div>
        </div>

        {/* Center: Wolf Proximity Radar */}
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border-2 transition-all shadow-lg ${
              isWolfCritical
                ? 'bg-red-600/90 border-red-300 text-white animate-pulse'
                : isWolfClose
                ? 'bg-amber-500/90 border-yellow-200 text-amber-950 font-black'
                : 'bg-slate-900/80 border-slate-700 text-slate-200'
            }`}
          >
            {isWolfCritical ? (
              <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-bounce" />
            ) : isWolfClose ? (
              <AlertTriangle className="w-4 h-4 text-yellow-950" />
            ) : (
              <span className="text-sm">🐺</span>
            )}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] uppercase tracking-wider font-black">
                {isWolfCritical ? 'DANGER! WOLF SPRINT!' : isWolfClose ? 'WOLF CLOSING IN!' : 'CHASING WOLF'}
              </span>
              <span className="text-xs sm:text-sm font-game font-black tabular-nums">
                {stats.wolfDistance.toFixed(1)} m behind
              </span>
            </div>
          </div>

          {/* Active Power-Ups Badges */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {stats.hasShield && (
              <div className="flex items-center gap-1 bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black border border-emerald-300 shadow-sm animate-pulse">
                <Shield className="w-3 h-3 fill-white" />
                <span>SHIELD ACTIVE</span>
              </div>
            )}
            {stats.activePowerUps.map((p) => (
              <div
                key={p.type}
                className="flex items-center gap-1 bg-sky-500/90 text-white px-2 py-0.5 rounded-lg text-[10px] font-black border border-sky-300 shadow-sm"
              >
                {p.type === 'MAGNET' ? <Magnet className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                <span>{Math.ceil(p.remaining)}s</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Coins & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Character's Collectible Snack Counter */}
          <div className="flex items-center gap-2 bg-amber-500/90 border-2 border-yellow-200 text-amber-950 px-3.5 py-1.5 rounded-2xl shadow-lg font-game font-black text-base sm:text-lg">
            <span className="text-sm">{activeCharConfig.collectibleEmoji}</span>
            <span className="tabular-nums text-yellow-950">{stats.coins}</span>
          </div>

          {/* Touch Buttons Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleTouchButtons();
            }}
            title="Toggle on-screen touch buttons"
            className={`p-2.5 rounded-2xl border-2 transition-transform active:scale-95 cursor-pointer shadow-md ${
              showTouchButtons
                ? 'bg-amber-400 border-yellow-200 text-amber-950'
                : 'bg-slate-900/75 border-slate-700 text-slate-300'
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-2xl border-2 border-slate-700 transition-transform active:scale-95 cursor-pointer shadow-md"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onPause();
            }}
            className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl border-2 border-red-300 transition-transform active:scale-95 cursor-pointer shadow-md font-bold"
            aria-label="Pause Game"
          >
            <Pause className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>

      {/* Center Subtle Hint Line for first few seconds */}
      {stats.distance < 45 && (
        <div className="self-center bg-slate-900/80 border border-slate-700/80 text-white px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs animate-pulse">
          Swipe or Keys: Left/Right to Dodge · Up to Jump · Down to Slide under signs!
        </div>
      )}

      {/* Bottom Area */}
      <div className="w-full flex justify-between items-end pointer-events-none" />
    </div>
  );
};
