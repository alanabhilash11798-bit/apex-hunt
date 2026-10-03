import React, { useState, useEffect } from 'react';
import {
  Shield,
  Heart,
  Crosshair as AimIcon,
  Skull,
  Users,
  Compass,
  Gauge,
  Volume2
} from 'lucide-react';
import { Minimap } from './Minimap';
import { KillFeed } from './KillFeed';
import { ScopeOverlay } from './ScopeOverlay';
import { MobileControls } from './MobileControls';
import { FullMapModal } from '../Menu/FullMapModal';
import {
  PlayerStats,
  SafeZoneState,
  KillFeedItem,
  WeaponDef,
  LootItem,
  CharacterChampion,
  ScreenDamageNumber,
  TargetEnemyInfo
} from '../../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  safeZone: SafeZoneState;
  killFeed: KillFeedItem[];
  champion: CharacterChampion;
  currentWeapon: WeaponDef;
  weaponSlots: (WeaponDef | null)[];
  activeSlotIndex: number;
  ammoInMag: number;
  ammoReserve: number;
  isReloading: boolean;
  isAiming: boolean;
  isCrouched: boolean;
  isDriving: boolean;
  isDropping: boolean;
  isGliding: boolean;
  canEnterVehicle: boolean;
  lootNearby: LootItem | null;
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  squadmates?: { x: number; z: number; name: string }[];
  vehicles?: { x: number; z: number }[];
  isHitmarkerActive: boolean;
  isHeadshotHit: boolean;
  isDamagedFlash: boolean;
  vehicleSpeed: number;
  damageNumbers?: ScreenDamageNumber[];
  targetEnemy?: TargetEnemyInfo | null;
  // Controls Handlers
  onMove: (forward: number, right: number) => void;
  onLookDelta: (dx: number, dy: number) => void;
  onFireDown: () => void;
  onFireUp: () => void;
  onJump: () => void;
  onCrouchToggle: () => void;
  onReload: () => void;
  onInteract: () => void;
  onToggleAim: () => void;
  onUseHeal: () => void;
  onHonk: () => void;
  onSelectSlot: (slot: number) => void;
  onDeploy: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  safeZone,
  killFeed,
  champion,
  currentWeapon,
  weaponSlots,
  activeSlotIndex,
  ammoInMag,
  ammoReserve,
  isReloading,
  isAiming,
  isCrouched,
  isDriving,
  isDropping,
  isGliding,
  canEnterVehicle,
  lootNearby,
  playerPos,
  playerYaw,
  squadmates = [],
  vehicles = [],
  isHitmarkerActive,
  isHeadshotHit,
  isDamagedFlash,
  vehicleSpeed,
  damageNumbers = [],
  targetEnemy = null,
  onMove,
  onLookDelta,
  onFireDown,
  onFireUp,
  onJump,
  onCrouchToggle,
  onReload,
  onInteract,
  onToggleAim,
  onUseHeal,
  onHonk,
  onSelectSlot,
  onDeploy
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect mobile touch
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsMapOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const hpPercent = (stats.hp / stats.maxHp) * 100;
  const shieldPercent = (stats.shield / stats.maxShield) * 100;

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-10 font-sans">
      {/* Red Damage Vignette Flash */}
      <div
        className={`absolute inset-0 bg-red-600/25 pointer-events-none transition-opacity duration-200 ${
          isDamagedFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Sniper Scope Overlay when ADS with Sniper */}
      <ScopeOverlay active={isAiming && currentWeapon.type === 'sniper'} />

      {/* TOP BAR CONTRACT: 3 Zones (Alive/Kills - Zone Timer - Minimap/Feed) */}
      <header className="absolute top-4 left-4 right-4 flex items-start justify-between">
        {/* Zone 1: Survivors & Kills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <Users className="w-4 h-4 text-cyan-400" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-display font-bold text-white tabular-nums">
                {stats.aliveCount}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">ALIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <Skull className="w-4 h-4 text-rose-500" />
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-display font-bold text-white tabular-nums">
                {stats.kills}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">KILLS</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Safe Zone Shrink Timer */}
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-all ${
              safeZone.state === 'shrinking'
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
                : 'bg-slate-950/80 border-cyan-500/60 text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400 animate-spin [animation-duration:8s]" />
            <span className="text-xs font-mono font-bold tracking-wider">
              {safeZone.state === 'shrinking' ? 'ZONE SHRINKING' : 'SAFE ZONE'}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {formatTime(safeZone.timer)}
            </span>
          </div>
          <span className="mt-1 text-[10px] font-mono text-slate-400">
            Phase {safeZone.phase + 1} / {safeZone.maxPhases}
          </span>
        </div>

        {/* Zone 3: Radar Minimap & Killfeed */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          <Minimap
            playerX={playerPos.x}
            playerZ={playerPos.z}
            playerYaw={playerYaw}
            safeZone={safeZone}
            squadmates={squadmates}
            vehicles={vehicles}
            onOpenFullMap={() => setIsMapOpen(true)}
          />
          <KillFeed items={killFeed} />
        </div>
      </header>

      {/* Dropship Jump Banner */}
      {isDropping && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
          <div className="px-6 py-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">
              DROPSHIP OVER APEX ISLE
            </span>
            <p className="text-sm font-display font-bold text-white mt-0.5">
              Press [SPACE] or tap DEPLOY to Leap onto the Island!
            </p>
          </div>
          <button
            onClick={onDeploy}
            className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs tracking-wider shadow-lg active:scale-95 transition-transform"
          >
            DEPLOY NOW (SPACE)
          </button>
        </div>
      )}

      {/* Glider deployed status */}
      {isGliding && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-cyan-950/80 backdrop-blur-md border border-cyan-400 text-xs font-mono text-cyan-300">
          GLIDER ACTIVE · STEER TO LANDING SPOT
        </div>
      )}

      {/* Floating Damage Numbers */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {damageNumbers.map(d => (
          <div
            key={d.id}
            style={{
              left: `${d.x}px`,
              top: `${d.y}px`,
              opacity: d.opacity,
              transform: 'translate(-50%, -50%)'
            }}
            className={`absolute font-display font-black text-base md:text-xl select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] transition-transform duration-75 ${
              d.isHeadshot
                ? 'text-red-500 scale-125 [text-shadow:0_0_12px_rgba(239,68,68,1)]'
                : d.isShield
                ? 'text-cyan-300 [text-shadow:0_0_8px_rgba(6,182,212,0.9)]'
                : 'text-amber-300 [text-shadow:0_0_8px_rgba(245,158,11,0.9)]'
            }`}
          >
            {d.text}
          </div>
        ))}
      </div>

      {/* CENTER CROSSHAIR & ENEMY TARGET LOCK INDICATOR */}
      {(!isAiming || currentWeapon.type !== 'sniper') && !isDriving && !isDropping && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          {/* Tactical Target Locking Brackets when aiming at an enemy */}
          {targetEnemy && (
            <div className="absolute inset-0 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
              <div className="relative w-16 h-16 flex items-center justify-center animate-pulse">
                {/* 4 Corner Locking Brackets */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500 shadow-[0_0_8px_#ef4444]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500 shadow-[0_0_8px_#ef4444]" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500 shadow-[0_0_8px_#ef4444]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500 shadow-[0_0_8px_#ef4444]" />

                {/* Target Locked HUD Tag */}
                <div className="absolute -top-7 whitespace-nowrap text-[9px] font-mono font-black tracking-wider text-red-400 bg-slate-950/90 px-2 py-0.5 rounded border border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  TARGET ACQUIRED · {targetEnemy.distance}M
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Precision Crosshair */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Center Aim Dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-100 ${
                targetEnemy
                  ? 'bg-red-500 scale-125 shadow-[0_0_10px_#ef4444]'
                  : 'bg-white shadow-[0_0_4px_rgba(0,0,0,0.9)]'
              }`}
            />
            {/* Top Reticle Line */}
            <div
              className={`absolute w-[2px] transition-all duration-100 ${
                targetEnemy
                  ? '-top-4 h-3 bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : '-top-3.5 h-2.5 bg-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            />
            {/* Bottom Reticle Line */}
            <div
              className={`absolute w-[2px] transition-all duration-100 ${
                targetEnemy
                  ? '-bottom-4 h-3 bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : '-bottom-3.5 h-2.5 bg-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            />
            {/* Left Reticle Line */}
            <div
              className={`absolute h-[2px] transition-all duration-100 ${
                targetEnemy
                  ? '-left-4 w-3 bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : '-left-3.5 w-2.5 bg-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            />
            {/* Right Reticle Line */}
            <div
              className={`absolute h-[2px] transition-all duration-100 ${
                targetEnemy
                  ? '-right-4 w-3 bg-red-500 shadow-[0_0_8px_#ef4444]'
                  : '-right-3.5 w-2.5 bg-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              }`}
            />
          </div>

          {/* Hitmarker Flash "X" */}
          {isHitmarkerActive && (
            <div className="absolute inset-0 flex items-center justify-center animate-ping [animation-duration:150ms]">
              <div
                className={`w-6 h-6 border-2 rotate-45 ${
                  isHeadshotHit
                    ? 'border-red-500 shadow-[0_0_14px_#ef4444]'
                    : 'border-white shadow-[0_0_8px_#ffffff]'
                }`}
              />
            </div>
          )}
        </div>
      )}

      {/* Speedometer if driving */}
      {isDriving && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-5 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-500/60 shadow-xl flex items-center gap-4">
          <Gauge className="w-6 h-6 text-amber-400" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              CYBER ROVER SPEED
            </div>
            <div className="text-2xl font-display font-black text-amber-300 tabular-nums">
              {Math.round(vehicleSpeed * 2.2)} <span className="text-xs font-mono text-slate-400">KM/H</span>
            </div>
          </div>
          <button
            onClick={onHonk}
            className="p-2 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700 pointer-events-auto"
            title="Honk (H)"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* BOTTOM-LEFT: Health & Armor Vitality Bars */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2.5 max-w-xs pointer-events-auto">
        {/* Champion Name & Passive */}
        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: champion.primaryColor }}
            className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"
          />
          <span className="text-xs font-display font-bold text-white tracking-wider">
            {champion.name}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            [{champion.passiveName}]
          </span>
        </div>

        {/* Shield Bar (Cyan) */}
        <div className="flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {stats.armorLevel === 3
                  ? 'TITAN SHIELD LV.3'
                  : stats.armorLevel === 2
                  ? 'REINFORCED LV.2'
                  : 'ENERGY SHIELD LV.1'}
              </span>
            </span>
            <span className="tabular-nums font-bold text-white">
              {Math.round(stats.shield)} <span className="text-slate-400">/ {stats.maxShield}</span>
            </span>
          </div>

          <div className="relative w-64 h-3 rounded-full bg-slate-900 border border-slate-700/80 overflow-hidden p-0.5">
            <div
              style={{ width: `${Math.max(0, Math.min(100, shieldPercent))}%` }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-400 transition-all duration-150 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            />
            {/* Segment dividers (4 quarters) */}
            <div className="absolute inset-0 flex justify-between px-16 pointer-events-none opacity-40">
              <div className="w-[1px] h-full bg-black" />
              <div className="w-[1px] h-full bg-black" />
              <div className="w-[1px] h-full bg-black" />
            </div>
          </div>
        </div>

        {/* Health Bar (Green / Red when critical) */}
        <div className="flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Heart className={`w-3.5 h-3.5 ${hpPercent < 30 ? 'text-red-500 animate-bounce' : 'text-emerald-400'}`} />
              <span>{hpPercent < 30 ? 'CRITICAL HEALTH' : 'VITALITY HEALTH'}</span>
            </span>
            <span className="tabular-nums font-bold text-white">
              {Math.round(stats.hp)} <span className="text-slate-400">/ {stats.maxHp}</span>
            </span>
          </div>

          <div className="relative w-64 h-4 rounded-full bg-slate-900 border border-slate-700/80 overflow-hidden p-0.5">
            <div
              style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
              className={`h-full rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(34,197,94,0.8)] ${
                hpPercent < 30
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400'
              }`}
            />
            {/* Segment dividers (4 quarters) */}
            <div className="absolute inset-0 flex justify-between px-16 pointer-events-none opacity-40">
              <div className="w-[1.5px] h-full bg-black" />
              <div className="w-[1.5px] h-full bg-black" />
              <div className="w-[1.5px] h-full bg-black" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM-CENTER: Active Weapon Card (Desktop view) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 pointer-events-auto bg-slate-950/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {currentWeapon.type.toUpperCase()}
          </span>
          <span className="text-sm font-display font-bold text-white tracking-wide">
            {currentWeapon.name}
          </span>
        </div>

        <div className="w-[1px] h-8 bg-slate-700" />

        {/* Ammo Display */}
        <div className="flex items-baseline gap-1">
          {currentWeapon.type !== 'melee' ? (
            <>
              <span className="text-3xl font-display font-black text-cyan-400 tabular-nums">
                {ammoInMag}
              </span>
              <span className="text-sm font-mono text-slate-400 tabular-nums">
                / {ammoReserve}
              </span>
            </>
          ) : (
            <span className="text-sm font-mono text-cyan-300">MELEE</span>
          )}
        </div>

        {isReloading && (
          <span className="text-xs font-mono text-amber-400 animate-pulse ml-2">
            RELOADING...
          </span>
        )}
      </div>

      {/* Controls helper hint (desktop) */}
      <div className="absolute bottom-2 left-6 text-[10px] font-mono text-slate-300 hidden lg:block drop-shadow">
        WASD Move · Space Jump · C Crouch · R Reload · E Interact/Drive · Right-Click Aim · M Map
      </div>

      {/* Mobile Touch Controls Layer */}
      <MobileControls
        onMove={onMove}
        onLookDelta={onLookDelta}
        onFireDown={onFireDown}
        onFireUp={onFireUp}
        onJump={onJump}
        onCrouchToggle={onCrouchToggle}
        onReload={onReload}
        onInteract={onInteract}
        onToggleAim={onToggleAim}
        onUseHeal={onUseHeal}
        onHonk={onHonk}
        onSelectSlot={onSelectSlot}
        isDriving={isDriving}
        canEnterVehicle={canEnterVehicle}
        lootNearby={lootNearby}
        activeWeapon={currentWeapon}
        weaponSlots={weaponSlots}
        activeSlotIndex={activeSlotIndex}
        ammoCount={ammoInMag}
        isAiming={isAiming}
        isCrouched={isCrouched}
        isDropping={isDropping}
        onDeploy={onDeploy}
      />

      {/* Full Island Map Modal */}
      <FullMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        playerX={playerPos.x}
        playerZ={playerPos.z}
        playerYaw={playerYaw}
        safeZone={safeZone}
        squadmates={squadmates}
      />
    </div>
  );
};
