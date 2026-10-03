import { WeaponDef, CharacterChampion } from '../types/game';

export const ISLAND_SIZE = 1600; // Super massive 1600x1600 battleground
export const ISLAND_RADIUS = 720;

export const WEAPONS: Record<string, WeaponDef> = {
  ar: {
    id: 'ar',
    name: 'Pulse-AR 24',
    type: 'ar',
    damage: 32,
    fireRate: 8, // 8 rounds/sec
    magazineSize: 30,
    reloadTime: 1.8,
    bulletSpeed: 240,
    spread: 0.025,
    range: 180,
    color: '#38bdf8', // sky cyan
    description: 'Versatile assault rifle with calibrated recoil and rapid bursts.'
  },
  scarl: {
    id: 'scarl',
    name: 'SCAR-Heavy 762',
    type: 'ar',
    damage: 42,
    fireRate: 7.2,
    magazineSize: 28,
    reloadTime: 2.0,
    bulletSpeed: 280,
    spread: 0.018,
    range: 220,
    color: '#fbbf24',
    description: 'Hard-hitting modular battle rifle with severe kinetic stopping impact.'
  },
  smg: {
    id: 'smg',
    name: 'Havoc-SMG 9',
    type: 'smg',
    damage: 20,
    fireRate: 14, // 14 rounds/sec
    magazineSize: 35,
    reloadTime: 1.4,
    bulletSpeed: 210,
    spread: 0.045,
    range: 110,
    color: '#f43f5e', // rose red
    description: 'Blistering fire rate weapon designed for intense close-quarters combat.'
  },
  vector: {
    id: 'vector',
    name: 'Vector-Apex 45',
    type: 'smg',
    damage: 18,
    fireRate: 20, // 20 rounds/sec shredder
    magazineSize: 32,
    reloadTime: 1.3,
    bulletSpeed: 230,
    spread: 0.035,
    range: 95,
    color: '#ec4899',
    description: 'Super-high cyclic rate submachine gun with Kriss Super V recoil mitigation.'
  },
  p90: {
    id: 'p90',
    name: 'P90-Tactical PDW',
    type: 'smg',
    damage: 22,
    fireRate: 15,
    magazineSize: 50,
    reloadTime: 2.2,
    bulletSpeed: 250,
    spread: 0.03,
    range: 130,
    color: '#a855f7',
    description: 'High-capacity bullpup personal defense weapon with 50-round horizontal magazine.'
  },
  dmr: {
    id: 'dmr',
    name: 'Titan-DMR 308',
    type: 'dmr',
    damage: 64,
    fireRate: 3.5,
    magazineSize: 18,
    reloadTime: 2.1,
    bulletSpeed: 310,
    spread: 0.012,
    range: 280,
    color: '#06b6d4',
    description: 'Designated marksman semi-auto rifle with lethal mid-to-long range stopping power.'
  },
  barrett: {
    id: 'barrett',
    name: 'Barrett .50 Cal BMG',
    type: 'sniper',
    damage: 135,
    fireRate: 0.65,
    magazineSize: 5,
    reloadTime: 3.2,
    bulletSpeed: 420,
    spread: 0.002,
    range: 480,
    color: '#ef4444',
    description: 'Anti-materiel heavy sniper rifle firing high-explosive .50 BMG cartridges.'
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle .50 AE',
    type: 'pistol',
    damage: 62,
    fireRate: 2.4,
    magazineSize: 7,
    reloadTime: 1.6,
    bulletSpeed: 260,
    spread: 0.015,
    range: 120,
    color: '#eab308',
    description: 'Magnum hand cannon chambered in .50 Action Express with massive punch.'
  },
  spas12: {
    id: 'spas12',
    name: 'SPAS-12 Tactical',
    type: 'shotgun',
    damage: 18, // per pellet (8 pellets = 144 max)
    fireRate: 1.8,
    magazineSize: 8,
    reloadTime: 2.4,
    bulletSpeed: 200,
    spread: 0.075,
    pelletCount: 8,
    range: 65,
    color: '#f97316',
    description: 'Military combat dual-mode shotgun with reinforced folding metal stock.'
  },
  minigun: {
    id: 'minigun',
    name: 'Gatling-Apex 50',
    type: 'minigun',
    damage: 22,
    fireRate: 20,
    magazineSize: 100,
    reloadTime: 3.8,
    bulletSpeed: 260,
    spread: 0.055,
    range: 170,
    color: '#eab308',
    description: 'Heavy rotary six-barrel minigun suppressing targets with a torrent of lead.'
  },
  carbine: {
    id: 'carbine',
    name: 'Valkyrie Carbine',
    type: 'carbine',
    damage: 36,
    fireRate: 9.5,
    magazineSize: 32,
    reloadTime: 1.6,
    bulletSpeed: 270,
    spread: 0.02,
    range: 210,
    color: '#3b82f6',
    description: 'High-velocity bullpup tactical carbine delivering pinpoint burst accuracy.'
  },
  crossbow: {
    id: 'crossbow',
    name: 'Phantom Crossbow',
    type: 'crossbow',
    damage: 88,
    fireRate: 1.2,
    magazineSize: 4,
    reloadTime: 2.4,
    bulletSpeed: 160,
    spread: 0.008,
    range: 150,
    color: '#10b981',
    description: 'Silent high-tension crossbow firing armor-piercing kinetic bolts.'
  },
  shotgun: {
    id: 'shotgun',
    name: 'Thunder-SG 12',
    type: 'shotgun',
    damage: 15, // per pellet (8 pellets = 120 total max)
    fireRate: 1.3,
    magazineSize: 6,
    reloadTime: 2.2,
    bulletSpeed: 180,
    spread: 0.085,
    pelletCount: 8,
    range: 55,
    color: '#eab308', // amber
    description: 'Heavy tactical pump shotgun delivering devastating point-blank burst.'
  },
  sniper: {
    id: 'sniper',
    name: 'Apex-Vortex DMR',
    type: 'sniper',
    damage: 95,
    fireRate: 0.9,
    magazineSize: 5,
    reloadTime: 2.6,
    bulletSpeed: 340,
    spread: 0.004,
    range: 350,
    color: '#a855f7', // purple
    description: 'High-caliber precision rifle with 4x optic zoom and high headshot multiplier.'
  },
  pistol: {
    id: 'pistol',
    name: 'Ion Blaster',
    type: 'pistol',
    damage: 26,
    fireRate: 4.5,
    magazineSize: 15,
    reloadTime: 1.2,
    bulletSpeed: 200,
    spread: 0.02,
    range: 90,
    color: '#10b981', // emerald
    description: 'Reliable high-capacity energy sidearm with quick draw and tight hipfire.'
  },
  rocket: {
    id: 'rocket',
    name: 'Plasma-Havoc RPG',
    type: 'rocket',
    damage: 110,
    fireRate: 0.6,
    magazineSize: 2,
    reloadTime: 3.2,
    bulletSpeed: 85,
    spread: 0.01,
    range: 200,
    color: '#f97316', // orange
    description: 'Heavy payload launcher firing explosive plasma shells with area damage.'
  },
  melee: {
    id: 'melee',
    name: 'Quantum Blade',
    type: 'melee',
    damage: 55,
    fireRate: 1.8,
    magazineSize: 1,
    reloadTime: 0,
    bulletSpeed: 0,
    spread: 0,
    range: 3.2,
    color: '#06b6d4', // cyan
    description: 'High-frequency energy blade for swift slashes and +15% sprint speed.'
  }
};

export const CHAMPIONS: CharacterChampion[] = [
  {
    id: 'blaze',
    name: 'Blaze',
    title: 'Vanguard Striker',
    passiveName: 'Adrenaline Surge',
    passiveDesc: '+10% Movement speed and 20% faster weapon reload.',
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    speedMultiplier: 1.10,
    armorBonus: 0,
    avatarSeed: 'blaze'
  },
  {
    id: 'nova',
    name: 'Nova',
    title: 'Zone Recon',
    passiveName: 'Storm Navigator',
    passiveDesc: 'Takes 40% reduced damage outside the safe zone and detects nearby airdrops.',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    speedMultiplier: 1.04,
    armorBonus: 0,
    avatarSeed: 'nova'
  },
  {
    id: 'titan',
    name: 'Titan',
    title: 'Armored Enforcer',
    passiveName: 'Reinforced Bulkhead',
    passiveDesc: 'Starts with +25 Max Shield and takes 25% less damage from explosive impacts.',
    primaryColor: '#84cc16',
    secondaryColor: '#10b981',
    speedMultiplier: 0.98,
    armorBonus: 25,
    avatarSeed: 'titan'
  },
  {
    id: 'whisper',
    name: 'Whisper',
    title: 'Shadow Ghost',
    passiveName: 'Silent Tread',
    passiveDesc: 'Footsteps produce minimal audio and weapon hipfire spread is reduced by 30%.',
    primaryColor: '#a855f7',
    secondaryColor: '#6366f1',
    speedMultiplier: 1.06,
    armorBonus: 0,
    avatarSeed: 'whisper'
  }
];

export const MAP_LOCATIONS = [
  { id: 'haven', name: 'Neon Haven Metropolis', x: -440, z: -380, color: '#06b6d4', desc: 'Futuristic urban highrises with high tier loot & rooftop sniper perches' },
  { id: 'port', name: 'Cyber Port Terminal', x: 480, z: -440, color: '#3b82f6', desc: 'Deepwater container terminal with gantry cranes, bikes, and depots' },
  { id: 'citadel', name: 'High Citadel Fortress', x: 0, z: 0, color: '#f59e0b', desc: 'Central mountain military fortress with multi-tier battle ramparts' },
  { id: 'hangar', name: 'Titan Airbase & Hangars', x: 520, z: 240, color: '#ec4899', desc: 'Sprawling military airstrip runway with weapon vaults and tactical rovers' },
  { id: 'radar', name: 'Apex Radar Array', x: -540, z: 420, color: '#8b5cf6', desc: 'High-altitude parabolic radar dish station commanding long-distance views' },
  { id: 'refinery', name: 'Valkyrie Chemical Refinery', x: 340, z: 560, color: '#ef4444', desc: 'Heavy industrial refinery with oil tanks, catwalks, and fuel pipelines' },
  { id: 'temple', name: 'Sunken Temple Ruins', x: -460, z: -120, color: '#10b981', desc: 'Ancient stone monolith sanctuary with secret weapon caches' },
  { id: 'palms', name: 'Paradise Cove Marina', x: -80, z: -660, color: '#eab308', desc: 'Sun-drenched coastal lagoon with sports superbikes & beach villas' },
  { id: 'dunes', name: 'Sol Dunes Outpost', x: 80, z: 680, color: '#f97316', desc: 'Desert perimeter military outpost with watchtowers and vehicle motorpool' },
  { id: 'bunker', name: 'Blackwatch Missile Silo', x: -620, z: 160, color: '#64748b', desc: 'Hardened underground nuclear missile bunker with legendary weapon crates' },
  { id: 'causeway', name: 'Skybridge Highway Interchange', x: 260, z: -220, color: '#38bdf8', desc: 'Suspension bridge highway hub with tactical offroaders & bikes' },
  { id: 'quarry', name: 'Obsidian Valley Quarry', x: -280, z: 540, color: '#a855f7', desc: 'Terraced open-pit industrial excavation with high ground sniping ledges' },
  { id: 'shipyard', name: 'Aegis Naval Drydocks', x: 640, z: -140, color: '#0284c7', desc: 'Submarine drydock facility stocked with military armament and rovers' },
  { id: 'windfarm', name: 'Cobalt Ridge Windmills', x: -160, z: 420, color: '#14b8a6', desc: 'Wind turbine ridge offering dense cover and high-tier vehicle spawns' },
  { id: 'monorail', name: 'Nexus Monorail Station', x: -320, z: -580, color: '#f43f5e', desc: 'Elevated transit terminal with rapid loot access and escape bikes' },
  { id: 'outpost', name: 'Ironwood Frontier Compound', x: 420, z: -60, color: '#84cc16', desc: 'Forest log perimeter base with sniper towers and supply lockers' }
];

export const SAFE_ZONE_PHASES = [
  { waitTime: 60, shrinkTime: 55, radius: 620, dps: 1.0 },
  { waitTime: 50, shrinkTime: 45, radius: 420, dps: 2.0 },
  { waitTime: 40, shrinkTime: 40, radius: 260, dps: 4.5 },
  { waitTime: 35, shrinkTime: 35, radius: 140, dps: 8.0 },
  { waitTime: 30, shrinkTime: 30, radius: 45, dps: 16.0 }
];
