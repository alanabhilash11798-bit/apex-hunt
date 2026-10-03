import React from 'react';
import { X, Navigation, Shield, AlertTriangle } from 'lucide-react';
import { MAP_LOCATIONS, ISLAND_RADIUS } from '../../game/constants';
import { SafeZoneState } from '../../types/game';

interface FullMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerX: number;
  playerZ: number;
  playerYaw: number;
  safeZone: SafeZoneState;
  squadmates?: { x: number; z: number; name: string }[];
}

export const FullMapModal: React.FC<FullMapModalProps> = ({
  isOpen,
  onClose,
  playerX,
  playerZ,
  playerYaw,
  safeZone,
  squadmates = []
}) => {
  if (!isOpen) return null;

  // Convert world coordinates [-300, 300] to percentage [0, 100]
  const worldToMapPercent = (wx: number, wz: number) => {
    const half = ISLAND_RADIUS;
    const px = ((wx + half) / (half * 2)) * 100;
    const pz = ((wz + half) / (half * 2)) * 100;
    return {
      x: Math.max(0, Math.min(100, px)),
      y: Math.max(0, Math.min(100, pz))
    };
  };

  const playerPos = worldToMapPercent(playerX, playerZ);
  const currentCenter = worldToMapPercent(safeZone.currentCenter[0], safeZone.currentCenter[1]);
  const currentRadiusPercent = (safeZone.currentRadius / (ISLAND_RADIUS * 2)) * 100;

  const nextCenter = worldToMapPercent(safeZone.nextCenter[0], safeZone.nextCenter[1]);
  const nextRadiusPercent = (safeZone.nextRadius / (ISLAND_RADIUS * 2)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-display font-bold tracking-wide text-white">
              APEX ISLE TACTICAL SATELLITE MAP
            </h2>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                Storm Zone
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-white">
                <span className="w-2 h-2 rounded-full border border-white inline-block" />
                Next Safe Ring
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body Container */}
        <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
          {/* Island Satellite Texture */}
          <img
            src="/src/assets/images/br_island_satellite_map_1790869873475.jpg"
            alt="Apex Isle Satellite Map"
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />

          {/* Tactical Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:10%_10%] pointer-events-none" />

          {/* SVG Overlay for Safe Zones */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Next Safe Zone (White Dashed) */}
            <circle
              cx={`${nextCenter.x}%`}
              cy={`${nextCenter.y}%`}
              r={`${nextRadiusPercent}%`}
              fill="rgba(255, 255, 255, 0.04)"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Current Storm (Cyan boundary) */}
            <circle
              cx={`${currentCenter.x}%`}
              cy={`${currentCenter.y}%`}
              r={`${currentRadiusPercent}%`}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
            />
          </svg>

          {/* POI Labels */}
          {MAP_LOCATIONS.map(poi => {
            const p = worldToMapPercent(poi.x, poi.z);
            return (
              <div
                key={poi.id}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] border border-black" />
                <span className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700/80 text-[10px] font-display font-semibold text-slate-200 tracking-wider shadow whitespace-nowrap">
                  {poi.name}
                </span>
              </div>
            );
          })}

          {/* Teammates on Map */}
          {squadmates.map((sq, idx) => {
            const p = worldToMapPercent(sq.x, sq.z);
            return (
              <div
                key={idx}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-black">
                  {idx + 1}
                </div>
              </div>
            );
          })}

          {/* Player Position Indicator */}
          <div
            style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
          >
            <div
              style={{ transform: `rotate(${-playerYaw * (180 / Math.PI)}deg)` }}
              className="transition-transform duration-75"
            >
              <Navigation className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,1)]" />
            </div>
            <div className="absolute -top-5 px-1 py-0.5 rounded bg-cyan-900/90 text-[9px] font-mono font-bold text-cyan-200">
              YOU
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            <span>Stay inside the circle to avoid electric storm damage.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Close (M / ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
