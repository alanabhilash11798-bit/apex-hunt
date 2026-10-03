import React, { useState } from 'react';
import {
  Play,
  Users,
  User,
  Shield,
  Crosshair,
  Settings,
  Zap,
  Flame,
  Wind,
  Target,
  Sparkles,
  ChevronRight,
  Palette,
  CheckCircle,
  Award,
  Flag,
  Car
} from 'lucide-react';
import { CHAMPIONS, WEAPONS, MAP_LOCATIONS } from '../../game/constants';
import {
  GameMode,
  CharacterChampion,
  CharacterCustomization,
  TacticalMission
} from '../../types/game';

interface LobbyMenuProps {
  selectedChampion: CharacterChampion;
  onSelectChampion: (champ: CharacterChampion) => void;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartMatch: () => void;
  onOpenSettings: () => void;
  customization?: CharacterCustomization;
  onUpdateCustomization?: (c: CharacterCustomization) => void;
  missions?: TacticalMission[];
  onClaimMission?: (id: string) => void;
  playerLevel?: number;
  playerXp?: number;
  onLaunchRacing?: () => void;
}

const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  suitColor: '#06b6d4',
  accentColor: '#38bdf8',
  visorGlow: '#22c55e',
  camoPattern: 'hex'
};

const DEFAULT_MISSIONS: TacticalMission[] = [
  {
    id: 'm1',
    title: 'First Blood & Outpost Recon',
    description: 'Eliminate 1 enemy in any battle royale match',
    goal: 1,
    current: 1,
    rewardXp: 500,
    completed: true,
    claimed: false
  },
  {
    id: 'm2',
    title: 'Precision Marksman',
    description: 'Land 3 headshots with AR or Sniper rifle',
    goal: 3,
    current: 2,
    rewardXp: 800,
    completed: false,
    claimed: false
  },
  {
    id: 'm3',
    title: 'High-Speed Cyber Patrol',
    description: 'Drive a rover or bike for 400m across the map',
    goal: 400,
    current: 400,
    rewardXp: 600,
    completed: true,
    claimed: false
  },
  {
    id: 'm4',
    title: 'Apex Champion Survivor',
    description: 'Finish in the Top 3 survivors in Solo or Squad BR',
    goal: 1,
    current: 1,
    rewardXp: 1200,
    completed: true,
    claimed: false
  }
];

export const LobbyMenu: React.FC<LobbyMenuProps> = ({
  selectedChampion,
  onSelectChampion,
  selectedMode,
  onSelectMode,
  onStartMatch,
  onOpenSettings,
  customization = DEFAULT_CUSTOMIZATION,
  onUpdateCustomization = () => {},
  missions = DEFAULT_MISSIONS,
  onClaimMission = () => {},
  playerLevel = 8,
  playerXp = 2400,
  onLaunchRacing
}) => {
  const [activeTab, setActiveTab] = useState<'lobby' | 'champions' | 'customize' | 'missions' | 'armory' | 'intel'>('lobby');

  const modes: { id: GameMode; name: string; subtitle: string; icon: React.ReactNode; count: string }[] = [
    {
      id: 'solo',
      name: 'Solo BR',
      subtitle: '24 Survivors · Free For All',
      icon: <User className="w-4 h-4" />,
      count: '24 Players'
    },
    {
      id: 'duo',
      name: 'Duo BR',
      subtitle: '12 Teams · 1 AI Squadmate',
      icon: <Users className="w-4 h-4" />,
      count: '12 Teams'
    },
    {
      id: 'squad',
      name: 'Squad BR',
      subtitle: '6 Teams · 3 AI Squadmates',
      icon: <Shield className="w-4 h-4" />,
      count: '6 Teams'
    },
    {
      id: 'tdm',
      name: 'Team Combat',
      subtitle: '4v4 Neon Haven Arena · Instant Respawn',
      icon: <Crosshair className="w-4 h-4" />,
      count: '4v4 TDM'
    },
    {
      id: 'racing',
      name: 'Highway 3D',
      subtitle: 'Endless Traffic Racer · Bikes & Cars',
      icon: <Car className="w-4 h-4" />,
      count: 'Speed Rush'
    }
  ];

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* Background Hero Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/src/assets/images/br_lobby_hero_art_1790869862296.jpg"
          alt="Apex Isle Battle Royale"
          className="w-full h-full object-cover object-top opacity-35 scale-105 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40" />
      </div>

      {/* TOP BAR CONTRACT: 3 Zones (Brand - Nav Links - Primary Actions) */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-display font-black text-slate-950 text-lg shadow-[0_0_12px_rgba(6,182,212,0.6)]">
            A
          </div>
          <span className="text-xl font-display font-black tracking-wider text-white">
            APEX ISLE
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('lobby')}
            className={`transition-colors py-1 ${
              activeTab === 'lobby'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mission Deck
          </button>
          <button
            onClick={() => setActiveTab('champions')}
            className={`transition-colors py-1 ${
              activeTab === 'champions'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Champions
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'customize'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Customization</span>
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'missions'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Daily Ops</span>
          </button>
          <button
            onClick={() => setActiveTab('armory')}
            className={`transition-colors py-1 ${
              activeTab === 'armory'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Armory
          </button>
          <button
            onClick={() => setActiveTab('intel')}
            className={`transition-colors py-1 ${
              activeTab === 'intel'
                ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Island Intel
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
            title="Settings & Controls"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={selectedMode === 'racing' && onLaunchRacing ? onLaunchRacing : onStartMatch}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm tracking-wide active:scale-95 transition-all ${
              selectedMode === 'racing'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            {selectedMode === 'racing' ? (
              <>
                <Car className="w-4 h-4 fill-slate-950" />
                <span>RACE HIGHWAY 3D</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>DEPLOY NOW</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 flex-1 px-6 py-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {/* TAB 1: MISSION DECK (LOBBY) */}
        {activeTab === 'lobby' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero & Launch Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>APEX BATTLE ROYALE</span>
                <span>·</span>
                <span>SEASON 1: STORM COLLAPSE</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-tight">
                DROP IN. GEAR UP. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  SURVIVE THE ZONE.
                </span>
              </h1>

              <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                Leap from the sky carrier onto an expansive tropical island outpost.
                Scavenge high-tier tactical weapons, armor vests, and energy batteries.
                Pilot cyber buggies and outmaneuver the shrinking storm ring to claim victory.
              </p>

              {/* Mode Select Segmented Tabs */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Select Game Mode
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-w-xl">
                  {modes.map(m => {
                    const isSelected = selectedMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onSelectMode(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {m.icon}
                        <span className="font-display font-bold text-xs tracking-wide text-center">
                          {m.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 text-center">
                          {m.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Large Deploy CTA Button */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={selectedMode === 'racing' && onLaunchRacing ? onLaunchRacing : onStartMatch}
                  style={{ borderColor: '#fd5353' }}
                  className={`px-10 py-4 rounded-2xl font-display font-black text-lg tracking-wider active:scale-95 transition-all flex items-center gap-3 border border-[#fd5353] ${
                    selectedMode === 'racing'
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                      : selectedMode === 'tdm'
                      ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                      : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                  }`}
                >
                  {selectedMode === 'racing' ? (
                    <>
                      <Car className="w-5 h-5 fill-slate-950" />
                      <span>RACE 3D HIGHWAY</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>{selectedMode === 'tdm' ? 'ENTER 4v4 ARENA' : 'LAUNCH BATTLE ROYALE'}</span>
                    </>
                  )}
                </button>

                <div className="flex flex-col text-xs font-mono text-slate-400">
                  <span className="text-slate-200 font-bold uppercase">{selectedMode.toUpperCase()} MISSION</span>
                  <span>
                    {selectedMode === 'racing'
                      ? 'Endless traffic dodge · Bikes & Cars'
                      : selectedMode === 'tdm'
                      ? 'Neon Haven Arena · 4v4 TDM'
                      : 'Apex Isle Island · 24 Survivors'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Champion Selection & Quick Preview */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Assigned Champion
                  </span>
                  <button
                    onClick={() => setActiveTab('champions')}
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Change Champion <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Champion Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div
                    style={{ backgroundColor: selectedChampion.primaryColor }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-slate-950 shadow-lg"
                  >
                    {selectedChampion.name[0]}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-lg font-display font-bold text-white">
                      {selectedChampion.name}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      {selectedChampion.title}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {selectedChampion.passiveName} · {selectedChampion.passiveDesc}
                    </span>
                  </div>
                </div>

                {/* Quick Champion Switcher Row */}
                <div className="grid grid-cols-4 gap-2">
                  {CHAMPIONS.map(c => {
                    const isSelected = selectedChampion.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectChampion(c)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: c.primaryColor }}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-xs font-display font-bold text-slate-200">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Roster Showcase Art Thumbnail */}
                <div className="rounded-xl overflow-hidden border border-slate-800 aspect-video relative">
                  <img
                    src="/src/assets/images/br_character_roster_art_1790869884556.jpg"
                    alt="Tactical Champion Lineup"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs font-mono text-slate-300">
                      Original Champions of Apex Isle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAMPIONS ROSTER */}
        {activeTab === 'champions' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                  CHAMPION ROSTER
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Choose your tactical operative with unique passive abilities and playstyles.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('lobby')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                Back to Mission Deck
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CHAMPIONS.map(c => {
                const isSelected = selectedChampion.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectChampion(c)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          style={{ backgroundColor: c.primaryColor }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-xl text-slate-950 shadow"
                        >
                          {c.name[0]}
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-bold text-white">
                            {c.name}
                          </h3>
                          <span className="text-xs font-mono text-cyan-400">
                            {c.title}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-mono font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span>PASSIVE: {c.passiveName}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {c.passiveDesc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3">
                      <span>Speed: {Math.round(c.speedMultiplier * 100)}%</span>
                      <span>·</span>
                      <span>Armor Bonus: +{c.armorBonus} Max Shield</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2.5: CHARACTER CUSTOMIZATION */}
        {activeTab === 'customize' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                  <Palette className="w-6 h-6 text-cyan-400" />
                  <span>HERO CUSTOMIZATION STUDIO</span>
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Customize combat suit armor, visor optics glow, and tactical camouflage patterns.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('lobby')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                Back to Mission Deck
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Color & Pattern Controls */}
              <div className="lg:col-span-7 flex flex-col gap-6 bg-slate-900/70 p-6 rounded-3xl border border-slate-800">
                {/* Suit Primary Color */}
                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-3 font-bold">
                    1. Combat Suit Primary Armor
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { hex: '#06b6d4', name: 'Cyber Cyan' },
                      { hex: '#ef4444', name: 'Crimson' },
                      { hex: '#10b981', name: 'Emerald' },
                      { hex: '#f59e0b', name: 'Apex Gold' },
                      { hex: '#8b5cf6', name: 'Void Purple' },
                      { hex: '#3b82f6', name: 'Cobalt' }
                    ].map(c => {
                      const isSelected = customization.suitColor === c.hex;
                      return (
                        <button
                          key={c.hex}
                          onClick={() => onUpdateCustomization({ ...customization, suitColor: c.hex })}
                          style={{ backgroundColor: c.hex }}
                          className={`h-12 rounded-xl flex items-center justify-center transition-transform ${
                            isSelected ? 'ring-4 ring-white scale-105 shadow-lg' : 'hover:scale-95 opacity-80 hover:opacity-100'
                          }`}
                          title={c.name}
                        >
                          {isSelected && <CheckCircle className="w-5 h-5 text-white drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visor Optics Glow */}
                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-3 font-bold">
                    2. Tactical Visor & HUD Glow
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { hex: '#00f0ff', name: 'Neon Cyan' },
                      { hex: '#ef4444', name: 'Laser Red' },
                      { hex: '#4ade80', name: 'Acid Green' },
                      { hex: '#facc15', name: 'Solar Gold' },
                      { hex: '#c084fc', name: 'Plasma Violet' }
                    ].map(v => {
                      const isSelected = customization.visorGlow === v.hex;
                      return (
                        <button
                          key={v.hex}
                          onClick={() => onUpdateCustomization({ ...customization, visorGlow: v.hex })}
                          style={{ backgroundColor: v.hex }}
                          className={`h-10 rounded-xl flex items-center justify-center transition-transform ${
                            isSelected ? 'ring-4 ring-white scale-105 shadow-[0_0_15px_currentColor]' : 'hover:scale-95 opacity-80 hover:opacity-100'
                          }`}
                          title={v.name}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-black drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Camouflage Pattern */}
                <div>
                  <label className="text-xs font-mono text-slate-300 uppercase tracking-wider block mb-3 font-bold">
                    3. Camouflage Finish
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'solid', label: 'Solid Stealth' },
                      { id: 'hex', label: 'Urban Hex' },
                      { id: 'carbon', label: 'Carbon Weave' },
                      { id: 'tiger', label: 'Golden Tiger' }
                    ].map(cam => {
                      const isSelected = customization.camoPattern === cam.id;
                      return (
                        <button
                          key={cam.id}
                          onClick={() => onUpdateCustomization({ ...customization, camoPattern: cam.id as any })}
                          className={`p-3 rounded-xl border text-xs font-display font-bold transition-all text-center ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cam.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Operative Preview Card */}
              <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Live Operative Preview
                </span>

                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col items-center justify-center gap-4 overflow-hidden">
                  {/* Stylized Avatar Silhouette with Chosen Customization Colors */}
                  <div className="relative flex flex-col items-center">
                    {/* Head with Visor */}
                    <div className="w-14 h-16 rounded-xl bg-slate-800 border-2 border-slate-700 relative flex items-center justify-center shadow-lg">
                      {/* Visor Glow */}
                      <div
                        style={{ backgroundColor: customization.visorGlow }}
                        className="w-10 h-3 rounded-sm shadow-[0_0_12px_currentColor]"
                      />
                    </div>

                    {/* Torso with Custom Suit Color */}
                    <div
                      style={{ backgroundColor: customization.suitColor }}
                      className="w-20 h-24 rounded-2xl mt-1 shadow-2xl flex items-center justify-center border-2 border-slate-900"
                    >
                      <div className="w-12 h-14 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-center text-xs font-display font-black text-white">
                        {selectedChampion.name[0]}
                      </div>
                    </div>

                    {/* Legs */}
                    <div className="flex gap-2 mt-1">
                      <div className="w-6 h-16 bg-slate-900 rounded-lg border border-slate-800" />
                      <div className="w-6 h-16 bg-slate-900 rounded-lg border border-slate-800" />
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <div className="text-lg font-display font-bold text-white">
                      {selectedChampion.name}
                    </div>
                    <div className="text-xs font-mono text-cyan-400">
                      PATTERN: {customization.camoPattern.toUpperCase()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onUpdateCustomization({
                    suitColor: selectedChampion.primaryColor,
                    accentColor: selectedChampion.secondaryColor,
                    visorGlow: selectedChampion.secondaryColor,
                    camoPattern: 'hex'
                  })}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                >
                  Reset to Champion Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2.7: TACTICAL MISSIONS */}
        {activeTab === 'missions' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
                  <Flag className="w-6 h-6 text-amber-400" />
                  <span>TACTICAL DAILY OPS & BOUNTIES</span>
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Complete combat objectives across game modes to earn XP and level up your operative.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('lobby')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                Back to Mission Deck
              </button>
            </div>

            {/* Rank / Level Progression Header */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-display font-black text-2xl shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  {playerLevel}
                </div>
                <div>
                  <div className="text-lg font-display font-bold text-white">
                    LEVEL {playerLevel} · TITAN BRIGADE
                  </div>
                  <div className="text-xs font-mono text-amber-400">
                    SEASON RANK: ELITE VANGUARD
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full md:w-72 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>SEASON XP</span>
                  <span className="text-white font-bold">{playerXp} / 3,000 XP</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-700 overflow-hidden p-0.5">
                  <div
                    style={{ width: `${Math.min(100, (playerXp / 3000) * 100)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                  />
                </div>
              </div>
            </div>

            {/* Missions List */}
            <div className="flex flex-col gap-3.5">
              {missions.map(m => {
                const isReady = m.current >= m.goal;
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl mt-0.5 ${
                        m.claimed
                          ? 'bg-slate-800 text-slate-500'
                          : isReady
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                          : 'bg-slate-800 text-cyan-400'
                      }`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-display font-bold text-white">
                            {m.title}
                          </h4>
                          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                            +{m.rewardXp} XP
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {m.description}
                        </p>
                        <div className="w-48 h-2 rounded-full bg-slate-950 border border-slate-800 mt-2.5 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, (m.current / m.goal) * 100)}%` }}
                            className={`h-full rounded-full ${
                              isReady ? 'bg-emerald-400' : 'bg-cyan-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {m.current} / {m.goal}
                      </span>
                      {m.claimed ? (
                        <span className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-mono font-bold">
                          CLAIMED ✓
                        </span>
                      ) : isReady ? (
                        <button
                          onClick={() => onClaimMission(m.id)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95 transition-all"
                        >
                          CLAIM REWARD
                        </button>
                      ) : (
                        <span className="px-4 py-2 rounded-xl bg-slate-800/50 text-slate-500 text-xs font-mono">
                          IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ARMORY */}
        {activeTab === 'armory' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                  TACTICAL WEAPONS ARSENAL
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Ballistic blueprints and specifications deployed across Apex Isle.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('lobby')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                Back to Mission Deck
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.values(WEAPONS).map(w => (
                <div
                  key={w.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {w.type}
                      </span>
                      <h3 className="text-base font-display font-bold text-white">
                        {w.name}
                      </h3>
                    </div>
                    <div
                      style={{ backgroundColor: w.color }}
                      className="w-3 h-3 rounded-full shadow"
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                    {w.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Damage</div>
                      <div className="font-bold text-cyan-400">{w.damage}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Fire Rate</div>
                      <div className="font-bold text-cyan-400">{w.fireRate}/s</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase">Mag Size</div>
                      <div className="font-bold text-cyan-400">{w.magazineSize}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ISLAND INTEL */}
        {activeTab === 'intel' && (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-white tracking-wide">
                  APEX ISLE POINTS OF INTEREST
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Tactical dropsite reconnaissance, vehicle bays, and high-value loot zones.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('lobby')}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
              >
                Back to Mission Deck
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MAP_LOCATIONS.map(poi => (
                <div
                  key={poi.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3.5"
                >
                  <div
                    style={{ backgroundColor: poi.color }}
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-base font-display font-bold text-white">
                      {poi.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {poi.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span>Apex Isle 3D Battle Royale</span>
          <span>·</span>
          <span>Smooth Mobile & Desktop Controls</span>
        </div>
        <div>
          <span>Non-graphic tactical competition</span>
        </div>
      </footer>
    </div>
  );
};
