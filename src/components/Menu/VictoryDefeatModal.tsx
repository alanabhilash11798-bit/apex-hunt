import React from 'react';
import { Trophy, Skull, Crosshair, Clock, RotateCcw, Home } from 'lucide-react';
import { PlayerStats, CharacterChampion } from '../../types/game';

interface VictoryDefeatModalProps {
  isOpen: boolean;
  isVictory: boolean;
  stats: PlayerStats;
  champion: CharacterChampion;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isOpen,
  isVictory,
  stats,
  champion,
  onPlayAgain,
  onReturnToLobby
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center overflow-hidden">
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 ${
            isVictory ? 'bg-amber-400' : 'bg-rose-600'
          }`}
        />

        {/* Big Icon / Laurel */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl border ${
            isVictory
              ? 'bg-amber-500/20 border-amber-400 text-amber-400'
              : 'bg-rose-500/20 border-rose-500 text-rose-400'
          }`}
        >
          {isVictory ? (
            <Trophy className="w-10 h-10 animate-bounce" />
          ) : (
            <Skull className="w-10 h-10" />
          )}
        </div>

        {/* Title */}
        <h1
          className={`text-3xl font-display font-black tracking-wider uppercase ${
            isVictory ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]' : 'text-slate-100'
          }`}
        >
          {isVictory ? '#1 VICTORY ROYALE' : `PLACED #${stats.rank} / 24`}
        </h1>

        <p className="text-sm font-sans text-slate-400 mt-1 max-w-xs">
          {isVictory
            ? `Champion of Apex Isle! Unstoppable survival performance.`
            : `Better luck next drop. Re-arm and conquer the storm.`}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full my-6">
          <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <Skull className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Eliminations</span>
            <span className="text-xl font-display font-bold text-white tabular-nums">
              {stats.kills}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <Crosshair className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Damage</span>
            <span className="text-xl font-display font-bold text-white tabular-nums">
              {stats.damageDealt}
            </span>
          </div>

          <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <Clock className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Survived</span>
            <span className="text-xl font-display font-bold text-white tabular-nums">
              {formatTime(stats.survivalTime)}
            </span>
          </div>
        </div>

        {/* Champion summary */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-8">
          <span>Champion:</span>
          <span className="font-bold text-slate-200">{champion.name}</span>
          <span>·</span>
          <span>{champion.passiveName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onReturnToLobby}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-sm tracking-wide transition-colors border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>LOBBY</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all border border-cyan-400"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
