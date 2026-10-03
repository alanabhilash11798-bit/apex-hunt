import React from 'react';

interface ScopeOverlayProps {
  active: boolean;
}

export const ScopeOverlay: React.FC<ScopeOverlayProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
      {/* Outer black vignette masking */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />

      {/* Circular optic aperture */}
      <div className="relative w-[85vh] h-[85vh] max-w-[620px] max-h-[620px] rounded-full border-4 border-slate-700/80 shadow-[0_0_120px_rgba(0,0,0,0.95)] overflow-hidden bg-transparent">
        {/* Optic glass tint */}
        <div className="absolute inset-0 bg-cyan-950/10 pointer-events-none" />

        {/* Tactical Crosshair Lines */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-slate-900/90 -translate-x-1/2" />
        <div className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-slate-900/90 -translate-y-1/2" />

        {/* Center reticle glowing red dot */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] -translate-x-1/2 -translate-y-1/2" />

        {/* Windage / Mil-dot elevation ticks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pt-12">
          <div className="w-6 h-[1px] bg-slate-700/80" />
          <div className="w-10 h-[1px] bg-slate-700/80" />
          <div className="w-6 h-[1px] bg-slate-700/80" />
          <div className="w-14 h-[1px] bg-slate-700/80" />
          <div className="w-6 h-[1px] bg-slate-700/80" />
        </div>

        {/* Horizontal Stadia Marks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-5">
          <div className="h-4 w-[1px] bg-slate-700/80" />
          <div className="h-6 w-[1px] bg-slate-700/80" />
          <div className="h-4 w-[1px] bg-slate-700/80" />
          <div className="w-16" /> {/* Center space */}
          <div className="h-4 w-[1px] bg-slate-700/80" />
          <div className="h-6 w-[1px] bg-slate-700/80" />
          <div className="h-4 w-[1px] bg-slate-700/80" />
        </div>

        {/* Optical HUD metadata */}
        <div className="absolute top-8 left-12 text-[10px] font-mono tracking-widest text-cyan-400/80 font-bold">
          MAG 4.0X // HD OPTIC
        </div>
        <div className="absolute bottom-8 right-12 text-[10px] font-mono tracking-widest text-emerald-400/80 font-bold">
          ELEV 0.00 MIL // CALIBRATED
        </div>
      </div>
    </div>
  );
};
