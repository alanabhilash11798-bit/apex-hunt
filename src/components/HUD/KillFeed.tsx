import React from 'react';
import { Skull, Target } from 'lucide-react';
import { KillFeedItem } from '../../types/game';

interface KillFeedProps {
  items: KillFeedItem[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ items }) => {
  return (
    <div className="flex flex-col gap-1.5 items-end pointer-events-none select-none max-w-sm">
      {items.slice(-4).map(item => (
        <div
          key={item.id}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium backdrop-blur-md shadow-md border animate-fade-in transition-all ${
            item.isPlayerKill
              ? 'bg-amber-500/25 border-amber-400 text-amber-200'
              : 'bg-slate-900/75 border-slate-700/60 text-slate-300'
          }`}
        >
          <span className={`font-bold ${item.isPlayerKill ? 'text-amber-300' : 'text-slate-100'}`}>
            {item.killerName}
          </span>
          <span className="text-[10px] text-slate-400">[{item.weaponName}]</span>
          {item.isHeadshot && (
            <span title="Headshot">
              <Target className="w-3.5 h-3.5 text-red-400" />
            </span>
          )}
          <Skull className="w-3 h-3 text-slate-400" />
          <span className="text-slate-200">{item.victimName}</span>
        </div>
      ))}
    </div>
  );
};
