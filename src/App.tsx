import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThreeEngine } from './game/threeEngine';
import { soundEngine } from './audio/soundEngine';
import { CHAMPIONS, WEAPONS } from './game/constants';
import {
  GameMode,
  CharacterChampion,
  PlayerStats,
  SafeZoneState,
  KillFeedItem,
  LootItem,
  GameSettings,
  WeaponDef,
  ScreenDamageNumber,
  TargetEnemyInfo
} from './types/game';
import { LobbyMenu } from './components/Menu/LobbyMenu';
import { GameHUD } from './components/HUD/GameHUD';
import { VictoryDefeatModal } from './components/Menu/VictoryDefeatModal';
import { SettingsModal } from './components/Menu/SettingsModal';

export default function App() {
  const [screen, setScreen] = useState<'lobby' | 'playing' | 'postmatch' | 'racing'>('lobby');
  const [selectedChampion, setSelectedChampion] = useState<CharacterChampion>(CHAMPIONS[0]);
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<ScreenDamageNumber[]>([]);
  const [targetEnemy, setTargetEnemy] = useState<TargetEnemyInfo | null>(null);

  // Settings - High Speed Cursor Movement & Snappy Screen Rotation
  const [settings, setSettings] = useState<GameSettings>({
    mouseSensitivity: 0.0125, // Fast snappy cursor speed
    touchSensitivity: 0.0145,
    soundVolume: 0.7,
    musicVolume: 0.5,
    showFps: false,
    fieldOfView: 75
  });

  // Active Game State
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeEngine | null>(null);

  // HUD Reactive States
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 100,
    armorLevel: 1,
    helmetLevel: 1,
    backpackLevel: 1,
    kills: 0,
    damageDealt: 0,
    aliveCount: 24,
    rank: 24,
    survivalTime: 0
  });

  const [safeZone, setSafeZone] = useState<SafeZoneState>({
    currentCenter: [0, 0],
    currentRadius: 280,
    nextCenter: [0, 0],
    nextRadius: 210,
    phase: 0,
    maxPhases: 4,
    timer: 35,
    state: 'waiting',
    dps: 2
  });

  const [killFeed, setKillFeed] = useState<KillFeedItem[]>([]);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponDef>(WEAPONS.ar);
  const [weaponSlots, setWeaponSlots] = useState<(WeaponDef | null)[]>([WEAPONS.ar, WEAPONS.pistol, WEAPONS.melee, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [ammoInMag, setAmmoInMag] = useState(30);
  const [ammoReserve, setAmmoReserve] = useState(120);
  const [isReloading, setIsReloading] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isCrouched, setIsCrouched] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  const [isDropping, setIsDropping] = useState(true);
  const [isGliding, setIsGliding] = useState(false);
  const [canEnterVehicle, setCanEnterVehicle] = useState(false);
  const [lootNearby, setLootNearby] = useState<LootItem | null>(null);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 180, z: 0 });
  const [playerYaw, setPlayerYaw] = useState(0);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);

  // Visual cues
  const [isHitmarkerActive, setIsHitmarkerActive] = useState(false);
  const [isHeadshotHit, setIsHeadshotHit] = useState(false);
  const [isDamagedFlash, setIsDamagedFlash] = useState(false);

  // Teammates & Vehicles for Radar
  const [squadmates, setSquadmates] = useState<{ x: number; z: number; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ x: number; z: number }[]>([]);

  // Update Settings handler
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.soundVolume !== undefined) {
        soundEngine.setVolume(newSettings.soundVolume);
      }
      if (engineRef.current) {
        if (newSettings.mouseSensitivity !== undefined) {
          engineRef.current.mouseSensitivity = newSettings.mouseSensitivity;
        }
        if (newSettings.touchSensitivity !== undefined) {
          engineRef.current.touchSensitivity = newSettings.touchSensitivity;
        }
      }
      return updated;
    });
  };

  // Launch Game Match
  const startMatch = useCallback(() => {
    if (selectedMode === 'racing') {
      setScreen('racing');
      return;
    }
    setScreen('playing');
    setKillFeed([]);
    setIsVictory(false);
    setIsDropping(true);
    setIsGliding(false);
    setIsDriving(false);
  }, [selectedMode]);

  const launchRacing = useCallback(() => {
    setScreen('racing');
  }, []);

  // Initialize ThreeEngine on 'playing'
  useEffect(() => {
    if (screen !== 'playing' || !canvasContainerRef.current) return;

    const engine = new ThreeEngine();
    engineRef.current = engine;
    engine.mouseSensitivity = settings.mouseSensitivity;
    engine.touchSensitivity = settings.touchSensitivity;

    // Attach callbacks
    engine.onUpdateStats = (newStats) => {
      setStats({ ...newStats });
      setCurrentWeapon(engine.currentWeapon);
      setWeaponSlots([...engine.weaponSlots]);
      setActiveSlotIndex(engine.activeSlotIndex);
      setAmmoInMag(engine.ammoInMag[engine.currentWeapon.id] ?? 0);
      setAmmoReserve(engine.ammoReserve[engine.currentWeapon.id] ?? 0);
      setIsReloading(engine.isReloading);
      setIsAiming(engine.isAiming);
      setIsCrouched(engine.isCrouched);
      setIsDriving(engine.isDriving);
      setIsDropping(engine.isDropping);
      setIsGliding(engine.isGliding);
      if (engine.currentVehicle) {
        setVehicleSpeed(Math.abs(engine.currentVehicle.speed));
      } else {
        setVehicleSpeed(0);
      }
    };

    engine.onZoneUpdate = (newZone) => {
      setSafeZone({ ...newZone });
    };

    engine.onKillFeed = (item) => {
      setKillFeed(prev => [...prev.slice(-6), item]);
    };

    engine.onLootPrompt = (item) => {
      setLootNearby(item);
    };

    engine.onVehiclePrompt = (canEnter, isDrive) => {
      setCanEnterVehicle(canEnter);
      setIsDriving(isDrive);
    };

    engine.onHitConfirmed = (headshot) => {
      setIsHeadshotHit(headshot);
      setIsHitmarkerActive(true);
      setTimeout(() => setIsHitmarkerActive(false), 160);
    };

    engine.onDamaged = () => {
      setIsDamagedFlash(true);
      setTimeout(() => setIsDamagedFlash(false), 180);
    };

    engine.onDamageNumbersUpdate = (nums) => {
      setDamageNumbers([...nums]);
    };

    engine.onTargetEnemyUpdate = (enemy) => {
      setTargetEnemy(enemy);
    };

    engine.onMatchEnd = (victory, endStats) => {
      setIsVictory(victory);
      setStats(endStats);
      setScreen('postmatch');
    };

    // Init Engine
    engine.init(canvasContainerRef.current, selectedChampion, selectedMode);

    // Track Player & Radar sync timer
    const syncInterval = setInterval(() => {
      if (!engineRef.current) return;
      setPlayerPos({
        x: engineRef.current.playerPosition.x,
        y: engineRef.current.playerPosition.y,
        z: engineRef.current.playerPosition.z
      });
      setPlayerYaw(engineRef.current.cameraRotation.yaw);

      // Extract squadmates
      const sq = engineRef.current.bots
        .filter(b => b.isSquadmate && b.state !== 'dead')
        .map(b => ({ x: b.mesh.position.x, z: b.mesh.position.z, name: b.name }));
      setSquadmates(sq);

      // Extract vehicles
      const vh = engineRef.current.vehicles.map(v => ({ x: v.position.x, z: v.position.z }));
      setVehicles(vh);
    }, 100);

    return () => {
      clearInterval(syncInterval);
      engine.destroy();
      engineRef.current = null;
    };
  }, [screen, selectedChampion, selectedMode, settings.mouseSensitivity, settings.touchSensitivity]);

  // Desktop Keyboard & Mouse Listeners
  useEffect(() => {
    if (screen !== 'playing') return;

    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      const eng = engineRef.current;
      if (!eng) return;

      // Update movement
      let f = 0;
      let r = 0;
      if (keys['KeyW'] || keys['ArrowUp']) f += 1;
      if (keys['KeyS'] || keys['ArrowDown']) f -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) r += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) r -= 1;
      eng.moveForward = f;
      eng.moveRight = r;

      // Sprint with Shift
      eng.isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];

      // Jump with Space
      if (e.code === 'Space') {
        if (eng.isDropping) {
          eng.deployFromDropship();
        } else if (eng.isGliding) {
          eng.openGlider();
        } else {
          eng.isJumpPressed = true;
        }
      }

      // Crouch toggle with C
      if (e.code === 'KeyC') {
        eng.isCrouched = !eng.isCrouched;
        setIsCrouched(eng.isCrouched);
      }

      // Reload with R
      if (e.code === 'KeyR') {
        eng.reloadWeapon();
      }

      // Interact with E
      if (e.code === 'KeyE') {
        eng.interact();
      }

      // Honk with H
      if (e.code === 'KeyH') {
        eng.honkVehicleHorn();
      }

      // Weapon Slots 1, 2, 3, 4
      if (e.code === 'Digit1') eng.switchWeaponSlot(0);
      if (e.code === 'Digit2') eng.switchWeaponSlot(1);
      if (e.code === 'Digit3') eng.switchWeaponSlot(2);
      if (e.code === 'Digit4') eng.switchWeaponSlot(3);

      // Heal with 5
      if (e.code === 'Digit5') eng.useHealItem();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      const eng = engineRef.current;
      if (!eng) return;

      let f = 0;
      let r = 0;
      if (keys['KeyW'] || keys['ArrowUp']) f += 1;
      if (keys['KeyS'] || keys['ArrowDown']) f -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) r += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) r -= 1;
      eng.moveForward = f;
      eng.moveRight = r;

      eng.isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];
      if (e.code === 'Space') {
        eng.isJumpPressed = false;
      }
    };

    // Mouse Look (Pointer Lock Support)
    const handleMouseMove = (e: MouseEvent) => {
      const eng = engineRef.current;
      if (!eng) return;

      // Only track if pointer is locked or mouse button held
      if (document.pointerLockElement === canvasContainerRef.current || e.buttons > 0) {
        eng.cameraRotation.yaw -= e.movementX * eng.mouseSensitivity;
        eng.cameraRotation.pitch -= e.movementY * eng.mouseSensitivity;
        setPlayerYaw(eng.cameraRotation.yaw);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const eng = engineRef.current;
      if (!eng) return;

      // Request pointer lock on canvas click if not already
      if (document.pointerLockElement !== canvasContainerRef.current && canvasContainerRef.current) {
        canvasContainerRef.current.requestPointerLock?.();
      }

      if (e.button === 0) {
        // Left click: Fire weapon
        eng.isTriggerDown = true;
        eng.shootWeapon();
      } else if (e.button === 2) {
        // Right click: ADS Toggle
        eng.isAiming = !eng.isAiming;
        setIsAiming(eng.isAiming);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const eng = engineRef.current;
      if (!eng) return;
      if (e.button === 0) {
        eng.isTriggerDown = false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent right-click context menu during combat
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [screen]);

  // Mobile Handlers passed into GameHUD
  const handleMobileMove = (forward: number, right: number) => {
    if (engineRef.current) {
      engineRef.current.moveForward = forward;
      engineRef.current.moveRight = right;
    }
  };

  const handleMobileLook = (dx: number, dy: number) => {
    if (engineRef.current) {
      engineRef.current.cameraRotation.yaw -= dx * engineRef.current.touchSensitivity;
      engineRef.current.cameraRotation.pitch -= dy * engineRef.current.touchSensitivity;
      setPlayerYaw(engineRef.current.cameraRotation.yaw);
    }
  };

  const handleMobileFireDown = () => {
    if (engineRef.current) {
      engineRef.current.isTriggerDown = true;
      engineRef.current.shootWeapon();
    }
  };

  const handleMobileFireUp = () => {
    if (engineRef.current) {
      engineRef.current.isTriggerDown = false;
    }
  };

  const handleMobileJump = () => {
    if (engineRef.current) {
      if (engineRef.current.isDropping) {
        engineRef.current.deployFromDropship();
      } else if (engineRef.current.isGliding) {
        engineRef.current.openGlider();
      } else {
        engineRef.current.isJumpPressed = true;
        setTimeout(() => {
          if (engineRef.current) engineRef.current.isJumpPressed = false;
        }, 150);
      }
    }
  };

  const handleMobileCrouch = () => {
    if (engineRef.current) {
      engineRef.current.isCrouched = !engineRef.current.isCrouched;
      setIsCrouched(engineRef.current.isCrouched);
    }
  };

  const handleMobileReload = () => {
    if (engineRef.current) {
      engineRef.current.reloadWeapon();
    }
  };

  const handleMobileInteract = () => {
    if (engineRef.current) {
      engineRef.current.interact();
    }
  };

  const handleMobileToggleAim = () => {
    if (engineRef.current) {
      engineRef.current.isAiming = !engineRef.current.isAiming;
      setIsAiming(engineRef.current.isAiming);
    }
  };

  const handleMobileUseHeal = () => {
    if (engineRef.current) {
      engineRef.current.useHealItem();
    }
  };

  const handleMobileHonk = () => {
    if (engineRef.current) {
      engineRef.current.honkVehicleHorn();
    }
  };

  const handleMobileSelectSlot = (slot: number) => {
    if (engineRef.current) {
      engineRef.current.switchWeaponSlot(slot);
    }
  };

  const handleMobileDeploy = () => {
    if (engineRef.current) {
      engineRef.current.deployFromDropship();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* 3D Game Canvas Container */}
      <div
        ref={canvasContainerRef}
        className={`w-full h-full absolute inset-0 ${screen === 'playing' ? 'block' : 'hidden'}`}
      />

      {/* Screen 1: Lobby Menu */}
      {screen === 'lobby' && (
        <LobbyMenu
          selectedChampion={selectedChampion}
          onSelectChampion={setSelectedChampion}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          onStartMatch={startMatch}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLaunchRacing={launchRacing}
        />
      )}

      {/* Screen 2: Active In-Game HUD */}
      {screen === 'playing' && (
        <GameHUD
          stats={stats}
          safeZone={safeZone}
          killFeed={killFeed}
          champion={selectedChampion}
          currentWeapon={currentWeapon}
          weaponSlots={weaponSlots}
          activeSlotIndex={activeSlotIndex}
          ammoInMag={ammoInMag}
          ammoReserve={ammoReserve}
          isReloading={isReloading}
          isAiming={isAiming}
          isCrouched={isCrouched}
          isDriving={isDriving}
          isDropping={isDropping}
          isGliding={isGliding}
          canEnterVehicle={canEnterVehicle}
          lootNearby={lootNearby}
          playerPos={playerPos}
          playerYaw={playerYaw}
          squadmates={squadmates}
          vehicles={vehicles}
          isHitmarkerActive={isHitmarkerActive}
          isHeadshotHit={isHeadshotHit}
          isDamagedFlash={isDamagedFlash}
          vehicleSpeed={vehicleSpeed}
          damageNumbers={damageNumbers}
          targetEnemy={targetEnemy}
          onMove={handleMobileMove}
          onLookDelta={handleMobileLook}
          onFireDown={handleMobileFireDown}
          onFireUp={handleMobileFireUp}
          onJump={handleMobileJump}
          onCrouchToggle={handleMobileCrouch}
          onReload={handleMobileReload}
          onInteract={handleMobileInteract}
          onToggleAim={handleMobileToggleAim}
          onUseHeal={handleMobileUseHeal}
          onHonk={handleMobileHonk}
          onSelectSlot={handleMobileSelectSlot}
          onDeploy={handleMobileDeploy}
        />
      )}

      {/* Screen 2.5: Highway 3D Racing Game Mode */}
      {screen === 'racing' && (
        <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col z-50">
          {/* Top Bar for Mode Switching & Download */}
          <div className="h-12 bg-slate-900/95 border-b border-slate-800 px-4 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen('lobby')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                ← Back to Battle Royale Lobby
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="font-bold">CYBER HIGHWAY 3D</span>
                <span>·</span>
                <span className="text-slate-400">Endless Traffic Racer (Bikes & Cars)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/racing.html"
                download="racing.html"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                title="Download Standalone HTML file using Three.js r128"
              >
                Download racing.html
              </a>
              <a
                href="/racing.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Open Fullscreen ↗
              </a>
            </div>
          </div>

          {/* Embedded Fullscreen 3D Racing Canvas */}
          <div className="flex-1 w-full relative">
            <iframe
              src="/racing.html"
              title="Cyber Highway 3D Racing Game"
              className="w-full h-full border-0 absolute inset-0"
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      )}

      {/* Screen 3: Victory / Defeat Post-Match Modal */}
      <VictoryDefeatModal
        isOpen={screen === 'postmatch'}
        isVictory={isVictory}
        stats={stats}
        champion={selectedChampion}
        onPlayAgain={startMatch}
        onReturnToLobby={() => setScreen('lobby')}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
