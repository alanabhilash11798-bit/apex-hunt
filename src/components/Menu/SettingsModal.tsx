import React from 'react';
import { X, Volume2, MousePointer, Smartphone, Keyboard } from 'lucide-react';
import { GameSettings } from '../../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-display font-bold text-white tracking-wide">
            GAME SETTINGS & CONTROLS
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-5">
          {/* Master Sound Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Master Sound FX Volume
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Mouse Aim Sensitivity (Fast Screen Look) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MousePointer className="w-4 h-4 text-cyan-400" />
                Desktop Mouse Sensitivity (Look Speed)
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.mouseSensitivity * 10000)}</span>
            </div>
            <input
              type="range"
              min="0.002"
              max="0.035"
              step="0.001"
              value={settings.mouseSensitivity}
              onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Mobile Touch Sensitivity */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                Mobile Touch Aim Sensitivity
              </span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.touchSensitivity * 10000)}</span>
            </div>
            <input
              type="range"
              min="0.004"
              max="0.040"
              step="0.002"
              value={settings.touchSensitivity}
              onChange={(e) => onUpdateSettings({ touchSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Keyboard Controls Reference */}
        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs font-display font-semibold text-slate-200">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>DESKTOP KEYMAP REFERENCE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div><span className="text-cyan-400">WASD</span> : Move Character / Drive</div>
            <div><span className="text-cyan-400">Mouse</span> : Look / Aim</div>
            <div><span className="text-cyan-400">Left Click</span> : Shoot</div>
            <div><span className="text-cyan-400">Right Click</span> : ADS / Zoom</div>
            <div><span className="text-cyan-400">Space</span> : Jump / Leap / Glider</div>
            <div><span className="text-cyan-400">C</span> : Crouch</div>
            <div><span className="text-cyan-400">R</span> : Reload Weapon</div>
            <div><span className="text-cyan-400">E</span> : Interact / Loot / Enter Vehicle</div>
            <div><span className="text-cyan-400">H</span> : Honk Vehicle Horn</div>
            <div><span className="text-cyan-400">M</span> : Tactical Full Map</div>
            <div><span className="text-cyan-400">1 - 4</span> : Switch Weapon Slots</div>
            <div><span className="text-cyan-400">5</span> : Quick Medkit / Shield Cell</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-sm tracking-wide transition-colors"
        >
          SAVE & CLOSE
        </button>
      </div>
    </div>
  );
};
