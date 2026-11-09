import React from 'react';
import { X, Check, Lock, Zap, Coins, Sparkles, ChevronRight, ShieldAlert } from 'lucide-react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../three/characters/CharacterRegistry';
import { sounds } from '../audio/SoundManager';

interface CharacterGalleryModalProps {
  selectedCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  totalCoins: number;
  onSelectCharacter: (charId: CharacterId) => void;
  onUnlockCharacter: (charId: CharacterId, cost: number) => void;
  onClose: () => void;
  onStartRun: () => void;
}

export const CharacterGalleryModal: React.FC<CharacterGalleryModalProps> = ({
  selectedCharacter,
  unlockedCharacters,
  totalCoins,
  onSelectCharacter,
  onUnlockCharacter,
  onClose,
  onStartRun,
}) => {
  const [previewId, setPreviewId] = React.useState<CharacterId>(selectedCharacter);

  const previewConfig = CHARACTERS[previewId];
  const isUnlocked = unlockedCharacters.includes(previewId);
  const isSelected = selectedCharacter === previewId;
  const canAfford = totalCoins >= previewConfig.price;

  const handleCardClick = (charId: CharacterId) => {
    sounds.playClick();
    setPreviewId(charId);
    onSelectCharacter(charId); // updates live 3D preview model
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 animate-in fade-in duration-200 backdrop-blur-xs">
      <div className="relative bg-slate-900 border-4 border-yellow-400 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-game font-black text-yellow-300 drop-shadow-[0_2px_0_#b45309]">
              HERO GALLERY
            </h2>
            <p className="text-xs text-slate-300">Choose your champion to outrun the wolf!</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins Badge */}
            <div className="flex items-center gap-1.5 bg-amber-500/90 text-amber-950 px-3 py-1 rounded-xl font-game font-black text-sm">
              <Coins className="w-4 h-4 fill-amber-950" />
              <span className="tabular-nums">{totalCoins}</span>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Character Carousel Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3">
          {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
            const config = CHARACTERS[id];
            const unlocked = unlockedCharacters.includes(id);
            const active = previewId === id;

            return (
              <button
                key={id}
                onClick={() => handleCardClick(id)}
                className={`relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-yellow-400/20 border-yellow-400 scale-105 shadow-md shadow-yellow-500/20'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                }`}
              >
                {!unlocked && (
                  <div className="absolute top-1 right-1 bg-black/70 p-0.5 rounded-full text-yellow-400">
                    <Lock className="w-3 h-3" />
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1 shadow-inner"
                  style={{ backgroundColor: `${config.primaryColor}33`, borderColor: config.primaryColor }}
                >
                  {config.collectibleEmoji}
                </div>
                <span className="text-[11px] font-bold text-center leading-tight truncate w-full">
                  {config.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hero Showcase Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg border-2"
            style={{ backgroundColor: `${previewConfig.primaryColor}22`, borderColor: previewConfig.primaryColor }}
          >
            {previewConfig.collectibleEmoji}
          </div>

          <div className="flex flex-col text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl sm:text-2xl font-game font-black text-white">{previewConfig.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                {previewConfig.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{previewConfig.subtitle}</p>
            <p className="text-xs text-slate-300 italic mb-3">"{previewConfig.description}"</p>

            {/* Stat Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-slate-400">Speed:</span>
                <span className="text-yellow-300 font-bold">+{previewConfig.speedBonus}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Coins:</span>
                <span className="text-amber-300 font-bold">+{previewConfig.coinBonus}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ability Badge */}
        <div className="my-3 px-3 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl flex items-center gap-2 text-xs text-yellow-200">
          <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>
            <strong>Special Perk: </strong>
            {previewConfig.ability}
          </span>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="mt-auto pt-2 flex gap-3">
          {isUnlocked ? (
            <button
              onClick={() => {
                sounds.playClick();
                onSelectCharacter(previewId);
                onStartRun();
              }}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-game font-black text-lg rounded-2xl border-2 border-green-300 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isSelected ? 'RUN WITH THIS HERO!' : 'SELECT & RUN!'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (canAfford) {
                  sounds.playPowerup();
                  onUnlockCharacter(previewId, previewConfig.price);
                } else {
                  sounds.playHit();
                }
              }}
              disabled={!canAfford}
              className={`flex-1 py-3.5 font-game font-black text-lg rounded-2xl border-2 transition-transform flex items-center justify-center gap-2 ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 border-yellow-200 shadow-md active:scale-95 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-75'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span>UNLOCK FOR {previewConfig.price} COINS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
