import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { SafeZoneState } from '../../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerYaw: number;
  safeZone: SafeZoneState;
  squadmates?: { x: number; z: number; name: string }[];
  vehicles?: { x: number; z: number }[];
  onOpenFullMap: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerYaw,
  safeZone,
  squadmates = [],
  vehicles = [],
  onOpenFullMap
}) => {
  // Radar radius in world units
  const radarRange = 130;
  const radarSize = 136; // px diameter
  const center = radarSize / 2;

  // Convert world delta to radar px
  const worldToRadar = (wx: number, wz: number) => {
    const dx = wx - playerX;
    const dz = wz - playerZ;
    const scale = radarSize / (radarRange * 2);
    return {
      x: center + dx * scale,
      y: center + dz * scale
    };
  };

  // Safe zone circles on radar
  const currentZoneCenter = worldToRadar(safeZone.currentCenter[0], safeZone.currentCenter[1]);
  const currentZoneRadiusPx = (safeZone.currentRadius / (radarRange * 2)) * radarSize;

  const nextZoneCenter = worldToRadar(safeZone.nextCenter[0], safeZone.nextCenter[1]);
  const nextZoneRadiusPx = (safeZone.nextRadius / (radarRange * 2)) * radarSize;

  return (
    <div
      onClick={onOpenFullMap}
      title="Click to open full tactical map (Key: M)"
      className="relative w-34 h-34 rounded-full border-2 border-slate-700/80 bg-slate-950/85 backdrop-blur-md overflow-hidden shadow-2xl cursor-pointer hover:border-cyan-400/80 transition-colors group select-none"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

      {/* Crosshairs */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-600/40 -translate-x-1/2" />
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-600/40 -translate-y-1/2" />

      {/* SVG Canvas for Zones and World Features */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Next Safe Zone (White dashed circle) */}
        <circle
          cx={nextZoneCenter.x}
          cy={nextZoneCenter.y}
          r={Math.max(1, nextZoneRadiusPx)}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.8"
        />

        {/* Current Storm Ring (Cyan circle) */}
        <circle
          cx={currentZoneCenter.x}
          cy={currentZoneCenter.y}
          r={Math.max(1, currentZoneRadiusPx)}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2"
          opacity="0.9"
        />
      </svg>

      {/* Nearby Vehicles */}
      {vehicles.map((v, idx) => {
        const p = worldToRadar(v.x, v.z);
        if (p.x < -10 || p.x > radarSize + 10 || p.y < -10 || p.y > radarSize + 10) return null;
        return (
          <div
            key={idx}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow"
            title="Vehicle"
          />
        );
      })}

      {/* Squadmates */}
      {squadmates.map((sq, idx) => {
        const p = worldToRadar(sq.x, sq.z);
        if (p.x < -10 || p.x > radarSize + 10 || p.y < -10 || p.y > radarSize + 10) return null;
        return (
          <div
            key={idx}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-lg"
            title={sq.name}
          />
        );
      })}

      {/* Center Player Marker with Heading Arrow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div
          style={{ transform: `rotate(${-playerYaw * (180 / Math.PI)}deg)` }}
          className="transition-transform duration-75"
        >
          <Navigation className="w-5 h-5 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
        </div>
      </div>

      {/* Map Button indicator */}
      <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[9px] font-mono font-semibold text-slate-300 bg-slate-900/80 px-1 py-0.5 rounded border border-slate-700">
        <MapPin className="w-2.5 h-2.5 text-cyan-400" />
        <span>MAP (M)</span>
      </div>
    </div>
  );
};
