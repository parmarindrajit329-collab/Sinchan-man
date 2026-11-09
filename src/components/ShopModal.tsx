import React from 'react';
import { X, ShoppingBag, Magnet, Shield, Sparkles, Coins } from 'lucide-react';
import { sounds } from '../audio/SoundManager';

interface ShopModalProps {
  totalCoins: number;
  magnetLevel: number;
  shieldLevel: number;
  multLevel: number;
  onUpgrade: (type: 'MAGNET' | 'SHIELD' | 'MULT', cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  totalCoins,
  magnetLevel,
  shieldLevel,
  multLevel,
  onUpgrade,
  onClose,
}) => {
  const magnetCost = magnetLevel * 120;
  const shieldCost = shieldLevel * 150;
  const multCost = multLevel * 140;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-200 backdrop-blur-xs">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh] text-white">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-game font-black text-yellow-300">POWER-UP SHOP</h2>
          </div>

          <div className="flex items-center gap-3">
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

        <div className="flex flex-col gap-3 my-4 overflow-y-auto">
          {/* Magnet Upgrade */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400">
                <Magnet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Coin Magnet</h3>
                <p className="text-xs text-slate-400">Draws all nearby coins. Lvl {magnetLevel}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (totalCoins >= magnetCost) {
                  sounds.playPowerup();
                  onUpgrade('MAGNET', magnetCost);
                } else {
                  sounds.playHit();
                }
              }}
              disabled={totalCoins < magnetCost}
              className={`px-3 py-2 rounded-xl font-game font-black text-xs shrink-0 flex items-center gap-1.5 transition-transform ${
                totalCoins >= magnetCost
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{magnetCost}</span>
            </button>
          </div>

          {/* Shield Upgrade */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Guardian Shield</h3>
                <p className="text-xs text-slate-400">Blocks 1 crash & pushes wolf back. Lvl {shieldLevel}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (totalCoins >= shieldCost) {
                  sounds.playPowerup();
                  onUpgrade('SHIELD', shieldCost);
                } else {
                  sounds.playHit();
                }
              }}
              disabled={totalCoins < shieldCost}
              className={`px-3 py-2 rounded-xl font-game font-black text-xs shrink-0 flex items-center gap-1.5 transition-transform ${
                totalCoins >= shieldCost
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{shieldCost}</span>
            </button>
          </div>

          {/* 2X Multiplier Upgrade */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">2X Star Multiplier</h3>
                <p className="text-xs text-slate-400">Doubles all scored run points. Lvl {multLevel}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (totalCoins >= multCost) {
                  sounds.playPowerup();
                  onUpgrade('MULT', multCost);
                } else {
                  sounds.playHit();
                }
              }}
              disabled={totalCoins < multCost}
              className={`px-3 py-2 rounded-xl font-game font-black text-xs shrink-0 flex items-center gap-1.5 transition-transform ${
                totalCoins >= multCost
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{multCost}</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl mt-auto transition-colors cursor-pointer"
        >
          Close Shop
        </button>
      </div>
    </div>
  );
};
