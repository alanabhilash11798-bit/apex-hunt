import React, { useRef, useState, useEffect } from 'react';
import {
  Crosshair,
  RotateCcw,
  ArrowUp,
  Car,
  Heart,
  Volume2,
  ChevronDown
} from 'lucide-react';
import { WeaponDef, LootItem } from '../../types/game';

interface MobileControlsProps {
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
  isDriving: boolean;
  canEnterVehicle: boolean;
  lootNearby: LootItem | null;
  activeWeapon: WeaponDef;
  weaponSlots: (WeaponDef | null)[];
  activeSlotIndex: number;
  ammoCount: number;
  isAiming: boolean;
  isCrouched: boolean;
  isDropping: boolean;
  onDeploy: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
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
  isDriving,
  canEnterVehicle,
  lootNearby,
  activeWeapon,
  weaponSlots,
  activeSlotIndex,
  ammoCount,
  isAiming,
  isCrouched,
  isDropping,
  onDeploy
}) => {
  // Joystick State
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickTouchId, setJoystickTouchId] = useState<number | null>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const joystickCenterRef = useRef({ x: 0, y: 0 });

  // Camera Touch State
  const lastTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);

  // Left Joystick Touch Handlers
  const handleJoystickStart = (e: React.TouchEvent) => {
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      joystickCenterRef.current = { x: cx, y: cy };
      setJoystickTouchId(touch.identifier);

      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;
      const maxR = rect.width / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, maxR);
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * (clampedDist / maxR);
      const ny = Math.sin(angle) * (clampedDist / maxR);

      setStickPos({ x: nx * (maxR * 0.75), y: ny * (maxR * 0.75) });
      onMove(-ny, nx);
    }
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        const { x: cx, y: cy } = joystickCenterRef.current;
        const maxR = 48;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, maxR);
        const angle = Math.atan2(dy, dx);
        const nx = Math.cos(angle) * (clampedDist / maxR);
        const ny = Math.sin(angle) * (clampedDist / maxR);

        setStickPos({ x: nx * (maxR * 0.75), y: ny * (maxR * 0.75) });
        onMove(-ny, nx);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        setJoystickTouchId(null);
        setStickPos({ x: 0, y: 0 });
        onMove(0, 0);
        break;
      }
    }
  };

  // Right Side Camera Aim Drag Zone
  const handleAimTouchStart = (e: React.TouchEvent) => {
    if (lastTouchRef.current !== null) return;
    const touch = e.changedTouches[0];
    lastTouchRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
  };

  const handleAimTouchMove = (e: React.TouchEvent) => {
    if (!lastTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lastTouchRef.current.id) {
        const dx = touch.clientX - lastTouchRef.current.x;
        const dy = touch.clientY - lastTouchRef.current.y;
        lastTouchRef.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
        onLookDelta(dx, dy);
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent) => {
    if (!lastTouchRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lastTouchRef.current.id) {
        lastTouchRef.current = null;
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* Right-half Camera Touch Surface */}
      <div
        onTouchStart={handleAimTouchStart}
        onTouchMove={handleAimTouchMove}
        onTouchEnd={handleAimTouchEnd}
        onTouchCancel={handleAimTouchEnd}
        className="absolute top-0 right-0 w-3/5 h-full pointer-events-auto"
      />

      {/* Deploy Button during drop sequence */}
      {isDropping && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={onDeploy}
            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-cyan-300 animate-pulse tracking-wider"
          >
            DEPLOY / DROP (SPACE)
          </button>
        </div>
      )}

      {/* Floating Virtual Joystick (Lower-Left) */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className="relative w-28 h-28 rounded-full bg-slate-950/45 backdrop-blur-sm border-2 border-slate-700/60 shadow-xl flex items-center justify-center"
        >
          {/* Base arrows indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white text-[10px] font-mono pointer-events-none">
            WASD
          </div>
          {/* Thumb stick knob */}
          <div
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border border-cyan-300 shadow-md transition-transform duration-75"
          />
        </div>
      </div>

      {/* Interactive Action Buttons (Right & Bottom-Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto">
        {/* Drive / Exit Vehicle Button */}
        {(canEnterVehicle || isDriving) && (
          <button
            onClick={onInteract}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 text-slate-950 font-bold shadow-lg border border-amber-300 active:scale-95 transition-transform"
          >
            <Car className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider">{isDriving ? 'Exit Vehicle' : 'Drive (E)'}</span>
          </button>
        )}

        {/* Horn if driving */}
        {isDriving && (
          <button
            onClick={onHonk}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-amber-400 text-amber-300 flex items-center justify-center active:scale-95 shadow-md"
            title="Honk Horn"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}

        {/* Pickup Loot Button */}
        {lootNearby && !isDriving && (
          <button
            onClick={onInteract}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium shadow-lg border border-cyan-300 active:scale-95 transition-transform animate-bounce"
          >
            <span className="text-xs">Take [{lootNearby.name}] (E)</span>
          </button>
        )}

        {/* Action Button Grid */}
        <div className="flex items-end gap-3">
          {/* Quick Heal Button */}
          <button
            onClick={onUseHeal}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-emerald-500/80 text-emerald-400 flex flex-col items-center justify-center active:scale-95 shadow-md"
            title="Use Medkit / Shield Cell (Key: 5)"
          >
            <Heart className="w-5 h-5" />
            <span className="text-[8px] font-mono">HEAL</span>
          </button>

          {/* Reload Button */}
          <button
            onClick={onReload}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-600 text-slate-200 flex flex-col items-center justify-center active:scale-95 shadow-md"
            title="Reload Weapon (Key: R)"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[8px] font-mono">R</span>
          </button>

          {/* Crouch Button */}
          <button
            onClick={onCrouchToggle}
            className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center active:scale-95 shadow-md ${
              isCrouched
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-slate-900/80 border-slate-600 text-slate-300'
            }`}
            title="Crouch (Key: C)"
          >
            <ChevronDown className="w-5 h-5" />
            <span className="text-[8px] font-mono">CROUCH</span>
          </button>

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-14 h-14 rounded-full bg-slate-800/90 border border-cyan-500/60 text-cyan-300 flex flex-col items-center justify-center active:scale-95 shadow-lg"
            title="Jump (Key: Space)"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[8px] font-mono">JUMP</span>
          </button>

          {/* ADS / Scope Zoom Button */}
          <button
            onClick={onToggleAim}
            className={`w-14 h-14 rounded-full border flex flex-col items-center justify-center active:scale-95 shadow-lg ${
              isAiming
                ? 'bg-cyan-500/40 border-cyan-300 text-cyan-200 ring-2 ring-cyan-400'
                : 'bg-slate-900/90 border-slate-600 text-slate-300'
            }`}
            title="Aim Down Sights (Right Click)"
          >
            <Crosshair className="w-6 h-6" />
            <span className="text-[8px] font-mono">AIM</span>
          </button>

          {/* Primary FIRE Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onFireDown();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onFireUp();
            }}
            onMouseDown={onFireDown}
            onMouseUp={onFireUp}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 border-2 border-red-300 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 flex flex-col items-center justify-center select-none"
            title="Shoot Weapon (Left Click)"
          >
            <span className="font-display font-black text-sm tracking-wider">FIRE</span>
            <span className="text-[10px] font-mono text-red-200">{ammoCount}</span>
          </button>
        </div>
      </div>

      {/* Quick Weapon Slots (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
        {weaponSlots.map((w, idx) => {
          if (!w) return null;
          const isActive = idx === activeSlotIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectSlot(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              <span className="text-[10px] text-slate-400 mr-1.5">[{idx + 1}]</span>
              {w.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
