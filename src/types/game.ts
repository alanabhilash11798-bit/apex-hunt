export type GameMode = 'solo' | 'duo' | 'squad' | 'tdm' | 'racing';

export interface CharacterCustomization {
  suitColor: string;
  accentColor: string;
  visorGlow: string;
  camoPattern: 'solid' | 'hex' | 'carbon' | 'tiger';
}

export interface TacticalMission {
  id: string;
  title: string;
  description: string;
  goal: number;
  current: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export type WeaponType = 'ar' | 'smg' | 'shotgun' | 'sniper' | 'pistol' | 'rocket' | 'melee' | 'dmr' | 'minigun' | 'carbine' | 'crossbow';

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  reloadTime: number; // seconds
  bulletSpeed: number;
  spread: number;
  range: number;
  pelletCount?: number;
  color: string;
  description: string;
}

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface LootItem {
  id: string;
  name: string;
  type: 'weapon' | 'ammo' | 'armor' | 'helmet' | 'heal' | 'shield' | 'backpack';
  weaponId?: string;
  amount?: number;
  rarity: ItemRarity;
  value: number; // e.g. armor amount or heal amount
  position: [number, number, number];
  mesh?: any;
}

export interface CharacterChampion {
  id: string;
  name: string;
  title: string;
  passiveName: string;
  passiveDesc: string;
  primaryColor: string;
  secondaryColor: string;
  speedMultiplier: number;
  armorBonus: number;
  avatarSeed: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  armorLevel: number;
  helmetLevel: number;
  backpackLevel: number;
  kills: number;
  damageDealt: number;
  aliveCount: number;
  rank: number;
  survivalTime: number;
}

export interface SafeZoneState {
  currentCenter: [number, number];
  currentRadius: number;
  nextCenter: [number, number];
  nextRadius: number;
  phase: number;
  maxPhases: number;
  timer: number;
  state: 'waiting' | 'shrinking';
  dps: number;
}

export interface KillFeedItem {
  id: string;
  killerName: string;
  victimName: string;
  weaponName: string;
  isHeadshot: boolean;
  isPlayerKill: boolean;
  timestamp: number;
}

export interface GameSettings {
  mouseSensitivity: number;
  touchSensitivity: number;
  soundVolume: number;
  musicVolume: number;
  showFps: boolean;
  fieldOfView: number;
}

export interface ScreenDamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  isHeadshot: boolean;
  isShield: boolean;
  opacity: number;
}

export interface TargetEnemyInfo {
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  distance: number;
}
