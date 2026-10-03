import * as THREE from 'three';
import { WEAPONS, MAP_LOCATIONS, SAFE_ZONE_PHASES, CHAMPIONS } from './constants';
import {
  GameMode,
  LootItem,
  PlayerStats,
  SafeZoneState,
  KillFeedItem,
  WeaponDef,
  CharacterChampion,
  ScreenDamageNumber,
  TargetEnemyInfo,
  CharacterCustomization
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { RealisticTextureFactory } from './realisticTextures';
import { buildRealisticSoldier, RealisticCharacterComponents } from './realisticSoldier';
import {
  buildRealisticRover,
  buildRealisticBike,
  buildRealisticLoot,
  buildRealisticCarrierAircraft,
  VehicleEntity
} from './realisticVehiclesAndLoot';

export interface BotEntity {
  id: string;
  name: string;
  isSquadmate: boolean;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  weapon: WeaponDef;
  targetPos: THREE.Vector3;
  state: 'dropping' | 'looting' | 'patrol' | 'combat' | 'retreating' | 'dead';
  targetEnemy: THREE.Vector3 | null;
  shootCooldown: number;
  accuracy: number;
  armorLevel: number;
  parachuteMesh?: THREE.Group;
  isGrounded: boolean;
  healthBarGroup?: THREE.Group;
  hpBarMesh?: THREE.Mesh;
  leftLeg?: THREE.Group | THREE.Mesh;
  rightLeg?: THREE.Group | THREE.Mesh;
  leftArm?: THREE.Group | THREE.Mesh;
  rightArm?: THREE.Group | THREE.Mesh;
  spineGroup?: THREE.Group;
  animTime?: number;
}

export interface BulletTracer {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  distanceTraveled: number;
  maxDistance: number;
  damage: number;
  isPlayerBullet: boolean;
  weaponType: string;
  isRocket?: boolean;
  shooterName: string;
  shooterBotId?: string;
}

export interface ActiveDamageNumber {
  id: string;
  text: string;
  worldPos: THREE.Vector3;
  life: number;
  maxLife: number;
  isHeadshot: boolean;
  isShield: boolean;
}

export class ThreeEngine {
  public container: HTMLElement | null = null;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Callbacks
  public onUpdateStats?: (stats: PlayerStats) => void;
  public onKillFeed?: (item: KillFeedItem) => void;
  public onZoneUpdate?: (zone: SafeZoneState) => void;
  public onMatchEnd?: (victory: boolean, stats: PlayerStats) => void;
  public onHitConfirmed?: (isHeadshot: boolean) => void;
  public onLootPrompt?: (item: LootItem | null) => void;
  public onVehiclePrompt?: (canEnter: boolean, isDriving: boolean) => void;
  public onDamaged?: () => void;
  public onDamageNumbersUpdate?: (nums: ScreenDamageNumber[]) => void;
  public onTargetEnemyUpdate?: (enemy: TargetEnemyInfo | null) => void;

  // Game Settings - High-Speed Fast Responsive Look
  public mouseSensitivity = 0.0125;
  public touchSensitivity = 0.0145;

  // Player State
  public champion: CharacterChampion = CHAMPIONS[0];
  public gameMode: GameMode = 'solo';
  public characterCustomization: CharacterCustomization = {
    suitColor: '#06b6d4',
    accentColor: '#38bdf8',
    visorGlow: '#00f0ff',
    camoPattern: 'hex'
  };
  public playerMesh!: THREE.Group;
  public playerComponents?: RealisticCharacterComponents;
  private playerAnimTime = 0;
  private oceanMaterial?: THREE.MeshStandardMaterial;
  private oceanNormalMap?: THREE.CanvasTexture;
  private cloudsGroup?: THREE.Group;
  public playerParachuteMesh!: THREE.Group;
  public playerHealthBarGroup?: THREE.Group;
  public playerHpBarMesh?: THREE.Mesh;
  public playerPosition = new THREE.Vector3(0, 180, 0);
  public playerVelocity = new THREE.Vector3(0, 0, 0);
  public cameraRotation = { yaw: 0, pitch: 0 };
  public isGrounded = false;
  public isDropping = true;
  public isGliding = false;
  public isCrouched = false;
  public isAiming = false;
  public isSprinting = false;
  public isDriving = false;
  public currentVehicle: VehicleEntity | null = null;

  // Player Combat
  public currentWeapon: WeaponDef = WEAPONS.ar;
  public weaponSlots: (WeaponDef | null)[] = [WEAPONS.ar, WEAPONS.pistol, WEAPONS.melee, null];
  public activeSlotIndex = 0;
  public ammoInMag: Record<string, number> = {
    ar: WEAPONS.ar.magazineSize,
    scarl: WEAPONS.scarl?.magazineSize || 28,
    smg: WEAPONS.smg.magazineSize,
    vector: WEAPONS.vector?.magazineSize || 32,
    p90: WEAPONS.p90?.magazineSize || 50,
    shotgun: WEAPONS.shotgun.magazineSize,
    spas12: WEAPONS.spas12?.magazineSize || 8,
    sniper: WEAPONS.sniper.magazineSize,
    barrett: WEAPONS.barrett?.magazineSize || 5,
    pistol: WEAPONS.pistol.magazineSize,
    deagle: WEAPONS.deagle?.magazineSize || 7,
    rocket: WEAPONS.rocket.magazineSize,
    dmr: 18,
    minigun: 100,
    carbine: 32,
    crossbow: 4,
    melee: 1
  };
  public ammoReserve: Record<string, number> = {
    ar: 120,
    scarl: 120,
    smg: 150,
    vector: 180,
    p90: 200,
    shotgun: 32,
    spas12: 40,
    sniper: 20,
    barrett: 20,
    pistol: 60,
    deagle: 42,
    rocket: 4,
    dmr: 60,
    minigun: 300,
    carbine: 120,
    crossbow: 24,
    melee: 0
  };
  public isReloading = false;
  public reloadTimer = 0;
  public shootCooldown = 0;
  public recoilKick = 0;

  // Player Stats
  public hp = 100;
  public maxHp = 100;
  public shield = 50;
  public maxShield = 100;
  public armorLevel = 1; // 0=none, 1=Lv1(50), 2=Lv2(75), 3=Lv3(100)
  public helmetLevel = 1;
  public backpackLevel = 1;
  public kills = 0;
  public damageDealt = 0;
  public aliveCount = 24;
  public survivalTime = 0;
  public isGameOver = false;

  // World Elements
  public bots: BotEntity[] = [];
  public vehicles: VehicleEntity[] = [];
  public lootItems: LootItem[] = [];
  public bullets: BulletTracer[] = [];
  public activeDamageNumbers: ActiveDamageNumber[] = [];
  public colliders: THREE.Box3[] = [];
  public terrainHeights: { x: number; z: number; h: number }[] = [];

  // Zone Storm - Scaled for Massive 1600x1600 Island
  public safeZone: SafeZoneState = {
    currentCenter: [0, 0],
    currentRadius: 620,
    nextCenter: [0, 0],
    nextRadius: 420,
    phase: 0,
    maxPhases: SAFE_ZONE_PHASES.length,
    timer: SAFE_ZONE_PHASES[0].waitTime,
    state: 'waiting',
    dps: SAFE_ZONE_PHASES[0].dps
  };
  private stormMesh!: THREE.Mesh;
  private nextZoneMesh!: THREE.LineLoop;

  // Airdrop
  private airdrops: { mesh: THREE.Group; targetY: number; landed: boolean }[] = [];

  // Dropship - Extended Trans-Island Trajectory
  private dropshipMesh!: THREE.Group;
  private dropshipPos = new THREE.Vector3(-850, 310, -650);
  private dropshipTarget = new THREE.Vector3(850, 310, 650);
  private dropshipProgress = 0;

  // Controls input cache
  public moveForward = 0;
  public moveRight = 0;
  public isTriggerDown = false;
  public isJumpPressed = false;
  private footstepTimer = 0;
  private stormDamageTimer = 0;

  public init(
    container: HTMLElement,
    champion: CharacterChampion,
    gameMode: GameMode,
    customization?: CharacterCustomization
  ) {
    this.container = container;
    this.champion = champion;
    this.gameMode = gameMode;
    if (customization) {
      this.characterCustomization = customization;
    }

    if (this.gameMode === 'tdm') {
      this.isDropping = false;
      this.isGliding = false;
      this.playerPosition.set(0, 2, 0);
      this.aliveCount = 8;
    }

    // Apply champion passive adjustments
    this.maxShield = 100 + champion.armorBonus;
    this.shield = 50 + champion.armorBonus;

    // 1. Scene & Camera with vibrant light-blue sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x76c3f8); // Radiant light-blue sky horizon
    this.scene.fog = new THREE.FogExp2(0xaee2ff, 0.00075); // Clean light blue aerial perspective

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 3500);

    // 2. High-Performance PBR Renderer with ACES Filmic Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 3. Lighting & Atmosphere
    this.setupLighting();

    // 4. Build Massive Island World (1100x1100 Terrain, Ocean, POIs, Foliage)
    this.buildTerrain();
    this.buildOcean();
    this.buildMapLocations();
    this.buildVegetation();

    // 5. Safe Zone Storm Visuals
    this.buildStormVisuals();

    // 6. Spawn High-Detail Vehicles (Cars & Bikes)
    this.spawnVehicles();

    // 7. Spawn Ground Loot with Photorealistic 3D Models
    this.spawnWorldLoot();

    // 8. Player & Dropship
    this.buildDropship();
    this.buildPlayer();

    // 9. Spawn Bots
    this.spawnBots();

    // Setup initial camera
    this.updateCamera(0.016);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start Loop
    this.clock.start();
    this.animate();
  }

  private setupLighting() {
    // 1. Natural Atmospheric Light-Blue Sky Dome with Rayleigh Scattering
    const skyGeo = new THREE.SphereGeometry(1800, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: RealisticTextureFactory.createSkyDomeTexture(),
      side: THREE.BackSide
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyDome);

    // 2. Soft Volumetric Clouds drifting in Upper Atmosphere
    this.cloudsGroup = new THREE.Group();
    for (let c = 0; c < 36; c++) {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0.0,
        transparent: true,
        opacity: 0.85
      });
      for (let p = 0; p < 6; p++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(32 + Math.random() * 24, 1), cloudMat);
        puff.position.set((Math.random() - 0.5) * 85, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 75);
        cloud.add(puff);
      }
      const angle = Math.random() * Math.PI * 2;
      const r = 260 + Math.random() * 680;
      cloud.position.set(Math.cos(angle) * r, 240 + Math.random() * 60, Math.sin(angle) * r);
      this.cloudsGroup.add(cloud);
    }
    this.scene.add(this.cloudsGroup);

    // 3. Natural Ambient Hemisphere Lighting (Radiant sky blue zenith + earth bounce)
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x22381f, 1.05);
    hemiLight.position.set(0, 450, 0);
    this.scene.add(hemiLight);

    // 4. Sun Directional Light with Soft Shadow Cascades
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(340, 520, 260);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 1400;
    sunLight.shadow.bias = -0.0004;
    const d = 480;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);
  }

  // Super Massive Island Terrain Generation with Photorealistic Multi-Layer Textures
  private buildTerrain() {
    const size = 1600;
    const segments = 140;
    const geom = new THREE.PlaneGeometry(size, size, segments, segments);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      // Height formulas: High Citadel center, hills around, slopes down to beach
      let h = 0;
      if (distFromCenter < 720) {
        const falloff = 1 - Math.pow(distFromCenter / 720, 1.8);
        const centerMound = Math.sin((x / 720) * Math.PI) * Math.cos((z / 720) * Math.PI) * 32;
        const ridges = Math.sin(x * 0.018) * Math.cos(z * 0.018) * 8.0;
        h = Math.max(0, (centerMound + ridges + 5) * falloff);
      } else {
        h = -4; // Below water
      }

      pos.setY(i, h);
      this.terrainHeights.push({ x, z, h });
    }
    geom.computeVertexNormals();

    const terrainTex = RealisticTextureFactory.createTerrainTexture();
    const terrainNorm = RealisticTextureFactory.createTerrainNormalMap();

    const mat = new THREE.MeshStandardMaterial({
      map: terrainTex,
      normalMap: terrainNorm,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 0.84,
      metalness: 0.08,
      flatShading: false
    });

    const terrainMesh = new THREE.Mesh(geom, mat);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // Sand rim around massive island
    const beachGeom = new THREE.RingGeometry(670, 745, 84);
    beachGeom.rotateX(-Math.PI / 2);
    const beachMat = new THREE.MeshStandardMaterial({
      color: 0xecd5ab,
      roughness: 0.88,
      metalness: 0.02
    });
    const beachMesh = new THREE.Mesh(beachGeom, beachMat);
    beachMesh.position.y = 0.2;
    beachMesh.receiveShadow = true;
    this.scene.add(beachMesh);
  }

  private buildOcean() {
    const waterGeom = new THREE.PlaneGeometry(3800, 3800);
    waterGeom.rotateX(-Math.PI / 2);

    const oceanNorm = RealisticTextureFactory.createOceanNormalMap();
    this.oceanNormalMap = oceanNorm;

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      normalMap: oceanNorm,
      normalScale: new THREE.Vector2(1.1, 1.1),
      roughness: 0.12,
      metalness: 0.52,
      transparent: true,
      opacity: 0.88
    });
    this.oceanMaterial = waterMat;

    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.y = -0.6;
    this.scene.add(water);
  }

  // Get approximate ground height at any (x, z)
  public getGroundHeight(x: number, z: number): number {
    const dist = Math.sqrt(x * x + z * z);
    if (dist >= 720) return -0.5;
    const falloff = 1 - Math.pow(dist / 720, 1.8);
    const centerMound = Math.sin((x / 720) * Math.PI) * Math.cos((z / 720) * Math.PI) * 32;
    const ridges = Math.sin(x * 0.018) * Math.cos(z * 0.018) * 8.0;
    return Math.max(0, (centerMound + ridges + 5) * falloff);
  }

  // Procedural Buildings & POIs across the Massive Map
  private buildMapLocations() {
    MAP_LOCATIONS.forEach(poi => {
      const baseY = this.getGroundHeight(poi.x, poi.z);

      if (poi.id === 'citadel') {
        this.createTower(poi.x, baseY, poi.z, 16, 26, 0x475569);
        this.createBuilding(poi.x - 22, baseY, poi.z + 14, 15, 9, 15, 0x64748b);
        this.createBuilding(poi.x + 22, baseY, poi.z - 14, 15, 9, 15, 0x64748b);
      } else if (poi.id === 'haven') {
        this.createBuilding(poi.x, baseY, poi.z, 22, 22, 22, 0x1e293b, 0x06b6d4);
        this.createBuilding(poi.x + 26, baseY, poi.z - 18, 16, 14, 16, 0x334155, 0x06b6d4);
        this.createBuilding(poi.x - 24, baseY, poi.z + 20, 16, 18, 16, 0x334155, 0x38bdf8);
      } else if (poi.id === 'port') {
        this.createBuilding(poi.x, baseY, poi.z, 32, 11, 20, 0x475569);
        const colors = [0xef4444, 0x3b82f6, 0xeab308, 0x10b981];
        for (let i = 0; i < 8; i++) {
          const cx = poi.x + (i % 4) * 9 - 14;
          const cz = poi.z + Math.floor(i / 4) * 14 + 18;
          this.createContainer(cx, baseY, cz, colors[i % colors.length]);
        }
      } else if (poi.id === 'hangar') {
        this.createBuilding(poi.x, baseY, poi.z, 38, 13, 28, 0x334155, 0xec4899);
        this.createTower(poi.x + 24, baseY, poi.z + 18, 5, 18, 0x475569);
      } else if (poi.id === 'radar') {
        this.createTower(poi.x, baseY, poi.z, 14, 28, 0x475569, 0x8b5cf6);
        this.createBuilding(poi.x + 18, baseY, poi.z - 12, 14, 6, 14, 0x334155);
      } else if (poi.id === 'refinery') {
        this.createTower(poi.x - 16, baseY, poi.z, 10, 19, 0x334155, 0xef4444);
        this.createTower(poi.x + 16, baseY, poi.z, 10, 19, 0x334155, 0xef4444);
        this.createBuilding(poi.x, baseY, poi.z + 20, 20, 8, 14, 0x1e293b);
      } else if (poi.id === 'temple') {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const px = poi.x + Math.cos(angle) * 18;
          const pz = poi.z + Math.sin(angle) * 18;
          this.createTower(px, baseY, pz, 4, 10, 0x78716c);
        }
        this.createBuilding(poi.x, baseY, poi.z, 14, 6, 14, 0xa8a29e);
      } else if (poi.id === 'palms') {
        this.createTower(poi.x, baseY, poi.z, 5, 14, 0x713f12);
        this.createBuilding(poi.x - 18, baseY, poi.z, 9, 5, 9, 0x9a3412);
        this.createBuilding(poi.x + 18, baseY, poi.z + 8, 9, 5, 9, 0x9a3412);
      } else {
        this.createBuilding(poi.x, baseY, poi.z, 18, 9, 16, 0x78350f);
        this.createTower(poi.x + 18, baseY, poi.z - 14, 5, 16, 0xb45309);
      }

      // Add a road segment/path around POI
      const roadGeom = new THREE.RingGeometry(28, 33, 24);
      roadGeom.rotateX(-Math.PI / 2);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const road = new THREE.Mesh(roadGeom, roadMat);
      road.position.set(poi.x, baseY + 0.05, poi.z);
      this.scene.add(road);
    });
  }

  private createBuilding(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: number,
    neonColor?: number
  ) {
    const group = new THREE.Group();
    const geom = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.2
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Neon accent strips
    if (neonColor) {
      const stripGeom = new THREE.BoxGeometry(w + 0.2, 0.4, d + 0.2);
      const stripMat = new THREE.MeshBasicMaterial({ color: neonColor });
      const strip = new THREE.Mesh(stripGeom, stripMat);
      strip.position.y = h;
      group.add(strip);
    }

    // Doorway cut / entrance marker
    const doorGeom = new THREE.BoxGeometry(2.4, 3.2, 0.2);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, 1.6, d / 2 + 0.05);
    group.add(door);

    group.position.set(x, y, z);
    this.scene.add(group);

    // Add bounding box collider
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push(box);
  }

  private createTower(x: number, y: number, z: number, radius: number, h: number, color: number, neonColor?: number) {
    const group = new THREE.Group();
    const geom = new THREE.CylinderGeometry(radius * 0.85, radius, h, 12);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (neonColor) {
      const ringGeom = new THREE.TorusGeometry(radius + 0.2, 0.2, 8, 16);
      ringGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({ color: neonColor });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = h * 0.8;
      group.add(ring);
    }

    group.position.set(x, y, z);
    this.scene.add(group);

    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push(box);
  }

  private createContainer(x: number, y: number, z: number, color: number) {
    const geom = new THREE.BoxGeometry(3.6, 3.2, 7.5);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.5 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y + 1.6, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.colliders.push(new THREE.Box3().setFromObject(mesh));
  }

  // Foliage & Rocks across the Massive Battleground
  private buildVegetation() {
    // Palm Trees & Conifers
    const treeCount = 280;
    const trunkGeom = new THREE.CylinderGeometry(0.3, 0.55, 6, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
    const foliageGeom = new THREE.ConeGeometry(3.2, 7, 7);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

    for (let i = 0; i < treeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 660;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = this.getGroundHeight(x, z);

      if (y > 0.5) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = 3;
        trunk.castShadow = true;
        tree.add(trunk);

        const leaves = new THREE.Mesh(foliageGeom, foliageMat);
        leaves.position.y = 7.5;
        leaves.castShadow = true;
        tree.add(leaves);

        tree.position.set(x, y, z);
        this.scene.add(tree);

        // Small collision box for trunk
        const box = new THREE.Box3();
        box.setFromCenterAndSize(new THREE.Vector3(x, y + 2, z), new THREE.Vector3(1.2, 4, 1.2));
        this.colliders.push(box);
      }
    }

    // Rocks / Boulders for cover
    const rockGeom = new THREE.DodecahedronGeometry(2.4, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 660;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = this.getGroundHeight(x, z);
      if (y > 0.2) {
        const rock = new THREE.Mesh(rockGeom, rockMat);
        rock.position.set(x, y + 1.2, z);
        rock.scale.set(1 + Math.random() * 0.8, 0.8 + Math.random() * 0.5, 1 + Math.random() * 0.8);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
        this.colliders.push(new THREE.Box3().setFromObject(rock));
      }
    }
  }

  // Safe Zone Storm Mesh
  private buildStormVisuals() {
    // Outer shrinking storm cylinder scaled for massive arena
    const stormGeom = new THREE.CylinderGeometry(620, 620, 240, 48, 1, true);
    const stormMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Electric cyan/blue
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      wireframe: false
    });
    this.stormMesh = new THREE.Mesh(stormGeom, stormMat);
    this.stormMesh.position.set(0, 110, 0);
    this.scene.add(this.stormMesh);

    // Next Safe Zone Ring Indicator (white pulsing line on the ground)
    const points: THREE.Vector3[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * 420, 0.5, Math.sin(theta) * 420));
    }
    const nextLineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const nextLineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    this.nextZoneMesh = new THREE.LineLoop(nextLineGeom, nextLineMat);
    this.scene.add(this.nextZoneMesh);
  }

  // Drivable High-Detail Vehicles (Realistic Rovers & Combat Superbikes placed across the whole massive map)
  private spawnVehicles() {
    const vehicleSpawns: { x: number; z: number; type: 'car' | 'bike' }[] = [
      // 1. Cyber Port Terminal
      { x: 480, z: -440, type: 'car' },
      { x: 460, z: -410, type: 'bike' },
      { x: 510, z: -460, type: 'bike' },
      // 2. Neon Haven Metropolis
      { x: -440, z: -380, type: 'car' },
      { x: -420, z: -350, type: 'bike' },
      { x: -460, z: -400, type: 'bike' },
      // 3. Titan Airbase & Runway
      { x: 520, z: 240, type: 'car' },
      { x: 550, z: 270, type: 'bike' },
      { x: 490, z: 210, type: 'bike' },
      // 4. Valkyrie Chemical Refinery
      { x: 340, z: 560, type: 'car' },
      { x: 310, z: 530, type: 'bike' },
      // 5. Apex Radar Array
      { x: -540, z: 420, type: 'car' },
      { x: -510, z: 390, type: 'bike' },
      // 6. Sunken Temple Ruins
      { x: -460, z: -120, type: 'bike' },
      // 7. Paradise Cove Marina
      { x: -80, z: -660, type: 'bike' },
      { x: -110, z: -630, type: 'bike' },
      { x: -50, z: -680, type: 'car' },
      // 8. Sol Dunes Military Outpost
      { x: 80, z: 680, type: 'car' },
      { x: 110, z: 650, type: 'bike' },
      // 9. Blackwatch Missile Silo
      { x: -620, z: 160, type: 'car' },
      { x: -590, z: 130, type: 'bike' },
      // 10. Skybridge Highway Interchange
      { x: 260, z: -220, type: 'bike' },
      { x: 280, z: -190, type: 'car' },
      // 11. Obsidian Valley Quarry
      { x: -280, z: 540, type: 'bike' },
      // 12. Aegis Naval Drydocks
      { x: 640, z: -140, type: 'car' },
      { x: 610, z: -110, type: 'bike' },
      // 13. High Citadel Central Fortress
      { x: 30, z: 40, type: 'bike' },
      { x: -40, z: -30, type: 'car' },
      // 14. Nexus Monorail Hub
      { x: -320, z: -580, type: 'bike' },
      // 15. Ironwood Frontier Outpost
      { x: 420, z: -60, type: 'bike' }
    ];

    vehicleSpawns.forEach((sp, idx) => {
      const y = this.getGroundHeight(sp.x, sp.z);
      const vehicle = sp.type === 'bike'
        ? buildRealisticBike(`bike_${idx}`, sp.x, y + 0.5, sp.z)
        : buildRealisticRover(`car_${idx}`, sp.x, y + 0.8, sp.z);

      this.scene.add(vehicle.mesh);
      this.vehicles.push(vehicle);
    });
  }

  // World Ground Loot with High-Fidelity 3D Models & Diverse Weapon Arsenal
  private spawnWorldLoot() {
    const lootDefs: { weaponId: string; type: LootItem['type']; name: string; rarity: LootItem['rarity']; val: number }[] = [
      { weaponId: 'ar', type: 'weapon', name: 'Pulse-AR 24', rarity: 'rare', val: 0 },
      { weaponId: 'scarl', type: 'weapon', name: 'SCAR-Heavy 762', rarity: 'epic', val: 0 },
      { weaponId: 'smg', type: 'weapon', name: 'Havoc-SMG 9', rarity: 'common', val: 0 },
      { weaponId: 'vector', type: 'weapon', name: 'Vector-Apex 45', rarity: 'epic', val: 0 },
      { weaponId: 'p90', type: 'weapon', name: 'P90-Tactical PDW', rarity: 'rare', val: 0 },
      { weaponId: 'dmr', type: 'weapon', name: 'Titan-DMR 308', rarity: 'epic', val: 0 },
      { weaponId: 'barrett', type: 'weapon', name: 'Barrett .50 Cal BMG', rarity: 'legendary', val: 0 },
      { weaponId: 'deagle', type: 'weapon', name: 'Desert Eagle .50 AE', rarity: 'rare', val: 0 },
      { weaponId: 'spas12', type: 'weapon', name: 'SPAS-12 Tactical', rarity: 'rare', val: 0 },
      { weaponId: 'minigun', type: 'weapon', name: 'Gatling-Apex 50', rarity: 'legendary', val: 0 },
      { weaponId: 'carbine', type: 'weapon', name: 'Valkyrie Carbine', rarity: 'rare', val: 0 },
      { weaponId: 'crossbow', type: 'weapon', name: 'Phantom Crossbow', rarity: 'epic', val: 0 },
      { weaponId: 'shotgun', type: 'weapon', name: 'Thunder-SG 12', rarity: 'rare', val: 0 },
      { weaponId: 'sniper', type: 'weapon', name: 'Apex-Vortex DMR', rarity: 'epic', val: 0 },
      { weaponId: 'rocket', type: 'weapon', name: 'Plasma-Havoc RPG', rarity: 'legendary', val: 0 },
      { weaponId: '', type: 'armor', name: 'Shield Vest Lv 2', rarity: 'rare', val: 75 },
      { weaponId: '', type: 'armor', name: 'Shield Vest Lv 3', rarity: 'legendary', val: 100 },
      { weaponId: '', type: 'helmet', name: 'Combat Helmet Lv 2', rarity: 'rare', val: 2 },
      { weaponId: '', type: 'helmet', name: 'Combat Helmet Lv 3', rarity: 'legendary', val: 3 },
      { weaponId: '', type: 'heal', name: 'Medkit', rarity: 'rare', val: 100 },
      { weaponId: '', type: 'shield', name: 'Shield Battery', rarity: 'common', val: 50 },
      { weaponId: '', type: 'ammo', name: 'Energy Rounds', rarity: 'common', val: 60 }
    ];

    // Distribute loot around POIs and open terrain across the big island
    let itemId = 1;
    MAP_LOCATIONS.forEach(poi => {
      const count = 14;
      for (let i = 0; i < count; i++) {
        const offsetDist = 6 + Math.random() * 42;
        const angle = Math.random() * Math.PI * 2;
        const lx = poi.x + Math.cos(angle) * offsetDist;
        const lz = poi.z + Math.sin(angle) * offsetDist;
        const ly = this.getGroundHeight(lx, lz) + 0.4;

        const def = lootDefs[Math.floor(Math.random() * lootDefs.length)];
        this.addLootItem({
          id: `loot_${itemId++}`,
          name: def.name,
          type: def.type,
          weaponId: def.weaponId,
          rarity: def.rarity,
          value: def.val,
          position: [lx, ly, lz]
        });
      }
    });
  }

  public addLootItem(item: LootItem) {
    const group = buildRealisticLoot(item);
    this.scene.add(group);
    item.mesh = group;
    this.lootItems.push(item);
  }

  // Transport Carrier Dropship with Realistic Aerodynamic Stealth Design
  private buildDropship() {
    this.dropshipMesh = buildRealisticCarrierAircraft();
    this.dropshipMesh.position.copy(this.dropshipPos);
    this.dropshipMesh.lookAt(this.dropshipTarget);
    this.scene.add(this.dropshipMesh);
  }

  // Player 3D Realistic Character Model
  private buildPlayer() {
    const suitColor = this.characterCustomization?.suitColor || this.champion.primaryColor;
    const visorColor = this.characterCustomization?.visorGlow || this.champion.secondaryColor;
    const pattern = this.characterCustomization?.camoPattern || 'hex';

    this.playerComponents = buildRealisticSoldier({
      suitColor,
      visorColor,
      pattern,
      skinTone: 0xf6d7b0,
      isPlayer: true
    });

    this.playerMesh = this.playerComponents.rootMesh;
    this.playerHealthBarGroup = this.playerComponents.healthBarGroup;
    this.playerHpBarMesh = this.playerComponents.hpBarMesh;

    // Energy Parachute Glider (folded until deployed)
    this.playerParachuteMesh = new THREE.Group();
    const gliderGeom = new THREE.ConeGeometry(3.5, 1.2, 6, 1, true);
    gliderGeom.rotateX(Math.PI);
    const gliderMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.champion.secondaryColor),
      emissive: new THREE.Color(this.champion.secondaryColor),
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });
    const canopy = new THREE.Mesh(gliderGeom, gliderMat);
    canopy.position.y = 2.8;
    this.playerParachuteMesh.add(canopy);
    this.playerParachuteMesh.visible = false;
    this.playerMesh.add(this.playerParachuteMesh);

    this.playerMesh.position.copy(this.dropshipPos);
    this.scene.add(this.playerMesh);
  }

  // 3D Billboard: Clean green bar at the top of their head
  private createBotHealthBar(): {
    group: THREE.Group;
    hpBar: THREE.Mesh;
  } {
    const group = new THREE.Group();
    // Positioned directly at the top of their head
    group.position.set(0, 2.52, 0);

    // Slim dark backing
    const bgGeom = new THREE.PlaneGeometry(1.18, 0.12);
    const bgMat = new THREE.MeshBasicMaterial({
      color: 0x050811,
      side: THREE.DoubleSide
    });
    const bg = new THREE.Mesh(bgGeom, bgMat);
    group.add(bg);

    // Red damage backdrop underneath
    const redGeom = new THREE.PlaneGeometry(1.14, 0.08);
    const redMat = new THREE.MeshBasicMaterial({
      color: 0x991b1b,
      side: THREE.DoubleSide
    });
    const redBar = new THREE.Mesh(redGeom, redMat);
    redBar.position.z = 0.005;
    group.add(redBar);

    // Clean, vibrant neon green health bar at the top of their head
    const hpGeom = new THREE.PlaneGeometry(1.14, 0.08);
    const hpMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e, // Bright neon green
      side: THREE.DoubleSide
    });
    const hpBar = new THREE.Mesh(hpGeom, hpMat);
    hpBar.position.z = 0.01;
    group.add(hpBar);

    return { group, hpBar };
  }

  // Spawn Bot Enemies & Squadmates with Realistic Soldier Anatomy
  private spawnBots() {
    const botNames = [
      'Viper_7', 'EchoStrike', 'PhantomX', 'Ronin', 'Kage', 'ApexClaw',
      'BulletKing', 'ZeroTwo', 'StormRider', 'Spectre9', 'Nexus', 'Cypher',
      'Aero', 'BladeRunner', 'Talon', 'GhostSniper', 'Havoc', 'Rogue',
      'IronFist', 'Solari', 'NightHawk', 'Quantum', 'Glitch'
    ];

    const skinTones = [0xf6d7b0, 0xdfb48c, 0xfcd34d, 0xd4a373];
    const patterns: ('hex' | 'solid' | 'carbon' | 'tiger')[] = ['hex', 'carbon', 'tiger', 'solid'];

    const count = this.gameMode === 'tdm' ? 7 : 23;
    for (let i = 0; i < count; i++) {
      const isSquadmate = (this.gameMode === 'duo' && i === 0) ||
                          (this.gameMode === 'squad' && i < 3) ||
                          (this.gameMode === 'tdm' && i < 3);
      const botName = isSquadmate ? `Squadmate_${i + 1}` : botNames[i % botNames.length];

      const champColor = isSquadmate ? '#22c55e' : (i % 2 === 0 ? '#ef4444' : '#8b5cf6');
      const visorColor = isSquadmate ? '#22c55e' : '#ef4444';
      const botSkin = skinTones[i % skinTones.length];
      const botPattern = patterns[i % patterns.length];

      const botComponents = buildRealisticSoldier({
        suitColor: champColor,
        visorColor,
        pattern: botPattern,
        skinTone: botSkin,
        isPlayer: false
      });

      const botMesh = botComponents.rootMesh;

      // Parachute glider (folded/dropped)
      const paraGroup = new THREE.Group();
      const paraGeom = new THREE.ConeGeometry(2.8, 1, 6, 1, true);
      paraGeom.rotateX(Math.PI);
      const para = new THREE.Mesh(
        paraGeom,
        new THREE.MeshStandardMaterial({ color: new THREE.Color(champColor), side: THREE.DoubleSide })
      );
      para.position.y = 2.8;
      paraGroup.add(para);
      botMesh.add(paraGroup);

      // Start position near drop path across massive island (or arena ground in TDM)
      const dropOffset = (i / count);
      let spawnX = -580 + dropOffset * 1160 + (Math.random() - 0.5) * 140;
      let spawnZ = -440 + dropOffset * 880 + (Math.random() - 0.5) * 140;
      let spawnY = 220 + Math.random() * 30;

      if (this.gameMode === 'tdm') {
        const teamSide = isSquadmate ? -1 : 1;
        spawnX = teamSide * (22 + Math.random() * 20);
        spawnZ = (Math.random() - 0.5) * 45;
        spawnY = this.getGroundHeight(spawnX, spawnZ);
        paraGroup.visible = false;
      }

      botMesh.position.set(spawnX, spawnY, spawnZ);
      this.scene.add(botMesh);

      // Assign diverse weapon from arsenal
      const weaponKeys = ['ar', 'scarl', 'smg', 'vector', 'p90', 'shotgun', 'spas12', 'sniper', 'barrett', 'deagle', 'dmr', 'carbine'];
      const assignedWeapon = WEAPONS[weaponKeys[i % weaponKeys.length]] || WEAPONS.ar;

      this.bots.push({
        id: `bot_${i}`,
        name: botName,
        isSquadmate,
        mesh: botMesh,
        hp: 100,
        maxHp: 100,
        shield: 50,
        maxShield: 100,
        weapon: assignedWeapon,
        targetPos: new THREE.Vector3(spawnX, 0, spawnZ),
        state: this.gameMode === 'tdm' ? 'combat' : 'dropping',
        targetEnemy: null,
        shootCooldown: 0.5 + Math.random() * 1.5,
        accuracy: isSquadmate ? 0.75 : 0.6 + Math.random() * 0.2,
        armorLevel: 1,
        parachuteMesh: paraGroup,
        isGrounded: false,
        healthBarGroup: botComponents.healthBarGroup,
        hpBarMesh: botComponents.hpBarMesh,
        leftLeg: botComponents.leftLeg,
        rightLeg: botComponents.rightLeg,
        leftArm: botComponents.leftArm,
        rightArm: botComponents.rightArm,
        spineGroup: botComponents.spineGroup,
        animTime: Math.random() * 10
      });
    }
  }

  // Player Drop / Jump from Plane
  public deployFromDropship() {
    if (!this.isDropping) return;
    this.isDropping = false;
    this.isGliding = true;
    this.playerPosition.copy(this.dropshipMesh.position);
    this.playerVelocity.set(
      Math.sin(this.cameraRotation.yaw) * 15,
      -18,
      Math.cos(this.cameraRotation.yaw) * 15
    );
    this.playerParachuteMesh.visible = false;
    soundEngine.playJump();
  }

  public openGlider() {
    if (!this.isGrounded && this.playerPosition.y > 5) {
      this.isGliding = !this.isGliding;
      this.playerParachuteMesh.visible = this.isGliding;
    }
  }

  // Weapon Actions
  public switchWeaponSlot(slotIndex: number) {
    if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return;
    const w = this.weaponSlots[slotIndex];
    if (!w) return;
    this.activeSlotIndex = slotIndex;
    this.currentWeapon = w;
    this.isReloading = false;
    soundEngine.playLootPickup();
    this.broadcastStats();
  }

  public shootWeapon() {
    if (this.isDropping || this.isGliding || this.isDriving || this.isGameOver) return;
    if (this.isReloading) return;
    if (this.shootCooldown > 0) return;

    const ammo = this.ammoInMag[this.currentWeapon.id];
    if (this.currentWeapon.type !== 'melee' && ammo <= 0) {
      this.reloadWeapon();
      return;
    }

    // Fire weapon!
    this.shootCooldown = 1 / this.currentWeapon.fireRate;
    if (this.currentWeapon.type !== 'melee') {
      this.ammoInMag[this.currentWeapon.id]--;
    }

    // Recoil kick
    this.recoilKick = Math.min(0.04, this.recoilKick + 0.012);

    // Audio
    soundEngine.playGunshot(this.currentWeapon.type);

    // Calculate bullet trajectory from camera center
    const origin = this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.6, 0));
    const forward = new THREE.Vector3(
      -Math.sin(this.cameraRotation.yaw) * Math.cos(this.cameraRotation.pitch),
      Math.sin(this.cameraRotation.pitch),
      -Math.cos(this.cameraRotation.yaw) * Math.cos(this.cameraRotation.pitch)
    ).normalize();

    // Spread calculation
    let spreadFactor = this.currentWeapon.spread;
    if (this.isCrouched) spreadFactor *= 0.6;
    if (this.isAiming) spreadFactor *= 0.4;
    if (this.champion.id === 'whisper') spreadFactor *= 0.7; // Passive

    const pellets = this.currentWeapon.pelletCount || 1;
    for (let p = 0; p < pellets; p++) {
      const dir = forward.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor,
        (Math.random() - 0.5) * spreadFactor,
        (Math.random() - 0.5) * spreadFactor
      )).normalize();

      this.spawnBullet(origin, dir, this.currentWeapon, true, this.champion.name);
    }

    this.broadcastStats();
  }

  public reloadWeapon() {
    if (this.isReloading || this.currentWeapon.type === 'melee') return;
    const currentAmmo = this.ammoInMag[this.currentWeapon.id];
    const maxAmmo = this.currentWeapon.magazineSize;
    const reserve = this.ammoReserve[this.currentWeapon.id];
    if (currentAmmo >= maxAmmo || reserve <= 0) return;

    this.isReloading = true;
    let reloadDuration = this.currentWeapon.reloadTime;
    if (this.champion.id === 'blaze') reloadDuration *= 0.8; // Passive faster reload
    this.reloadTimer = reloadDuration;
    soundEngine.playReload();
  }

  private completeReload() {
    this.isReloading = false;
    const needed = this.currentWeapon.magazineSize - this.ammoInMag[this.currentWeapon.id];
    const available = Math.min(needed, this.ammoReserve[this.currentWeapon.id]);
    this.ammoInMag[this.currentWeapon.id] += available;
    this.ammoReserve[this.currentWeapon.id] -= available;
    this.broadcastStats();
  }

  // Bullet & Projectile Logic
  private spawnBullet(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    weapon: WeaponDef,
    isPlayer: boolean,
    shooterName: string = 'Player',
    shooterBotId?: string
  ) {
    const isRocket = weapon.type === 'rocket';
    const geom = isRocket ? new THREE.SphereGeometry(0.3, 6, 6) : new THREE.CylinderGeometry(0.04, 0.04, 0.8, 4);
    geom.rotateX(Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      color: isRocket ? 0xf97316 : new THREE.Color(weapon.color)
    });
    const bulletMesh = new THREE.Mesh(geom, mat);
    bulletMesh.position.copy(origin);
    bulletMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    this.scene.add(bulletMesh);

    this.bullets.push({
      mesh: bulletMesh,
      direction,
      speed: weapon.bulletSpeed,
      distanceTraveled: 0,
      maxDistance: weapon.range,
      damage: weapon.damage,
      isPlayerBullet: isPlayer,
      weaponType: weapon.type,
      isRocket,
      shooterName,
      shooterBotId
    });
  }

  // Interact: Loot Pickup or Enter/Exit Vehicle
  public interact() {
    // 1. Vehicle toggle
    if (this.isDriving) {
      this.exitVehicle();
      return;
    }

    const nearestVehicle = this.getNearestVehicle(4.5);
    if (nearestVehicle && !nearestVehicle.isOccupied) {
      this.enterVehicle(nearestVehicle);
      return;
    }

    // 2. Loot item pickup
    const nearestLoot = this.getNearestLoot(3.2);
    if (nearestLoot) {
      this.pickupLoot(nearestLoot);
    }
  }

  public enterVehicle(vehicle: VehicleEntity) {
    this.isDriving = true;
    this.currentVehicle = vehicle;
    vehicle.isOccupied = true;
    vehicle.occupantIsPlayer = true;
    this.playerMesh.visible = false;
    soundEngine.startVehicleEngine();
  }

  public exitVehicle() {
    if (!this.currentVehicle) return;
    this.isDriving = false;
    this.currentVehicle.isOccupied = false;
    this.currentVehicle.occupantIsPlayer = false;
    this.playerMesh.visible = true;
    this.playerPosition.copy(this.currentVehicle.position).add(new THREE.Vector3(2.5, 0, 0));
    this.currentVehicle = null;
    soundEngine.stopVehicleEngine();
  }

  public honkVehicleHorn() {
    if (this.isDriving) {
      soundEngine.playVehicleHorn();
    }
  }

  private getNearestVehicle(maxDist: number): VehicleEntity | null {
    let closest: VehicleEntity | null = null;
    let minDist = maxDist;
    this.vehicles.forEach(v => {
      const dist = v.position.distanceTo(this.playerPosition);
      if (dist < minDist) {
        minDist = dist;
        closest = v;
      }
    });
    return closest;
  }

  private getNearestLoot(maxDist: number): LootItem | null {
    let closest: LootItem | null = null;
    let minDist = maxDist;
    this.lootItems.forEach(item => {
      const pos = new THREE.Vector3(...item.position);
      const dist = pos.distanceTo(this.playerPosition);
      if (dist < minDist) {
        minDist = dist;
        closest = item;
      }
    });
    return closest;
  }

  private pickupLoot(item: LootItem) {
    soundEngine.playLootPickup();

    if (item.type === 'weapon' && item.weaponId) {
      const weaponDef = WEAPONS[item.weaponId];
      if (weaponDef) {
        this.weaponSlots[this.activeSlotIndex] = weaponDef;
        this.currentWeapon = weaponDef;
        this.ammoInMag[weaponDef.id] = weaponDef.magazineSize;
        this.ammoReserve[weaponDef.id] = (this.ammoReserve[weaponDef.id] || 0) + weaponDef.magazineSize * 2;
      }
    } else if (item.type === 'armor') {
      this.armorLevel = item.value === 100 ? 3 : item.value === 75 ? 2 : 1;
      this.maxShield = item.value + (this.champion.armorBonus || 0);
      this.shield = this.maxShield;
    } else if (item.type === 'helmet') {
      this.helmetLevel = item.value;
    } else if (item.type === 'heal') {
      this.hp = Math.min(this.maxHp, this.hp + item.value);
    } else if (item.type === 'shield') {
      this.shield = Math.min(this.maxShield, this.shield + item.value);
    } else if (item.type === 'ammo') {
      Object.keys(this.ammoReserve).forEach(k => {
        this.ammoReserve[k] += item.value;
      });
    }

    // Remove from scene
    if (item.mesh) {
      this.scene.remove(item.mesh);
    }
    this.lootItems = this.lootItems.filter(l => l.id !== item.id);
    this.broadcastStats();
  }

  // Quick healing consumable use
  public useHealItem() {
    if (this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 50);
      soundEngine.playLootPickup();
      this.broadcastStats();
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + 50);
      soundEngine.playLootPickup();
      this.broadcastStats();
    }
  }

  // Damage Application
  public damagePlayer(amount: number, isHeadshot: boolean = false, attackerName: string = 'Bot') {
    if (this.hp <= 0 || this.isGameOver) return;

    let finalDmg = amount;
    if (isHeadshot) {
      const red = this.helmetLevel === 3 ? 0.5 : this.helmetLevel === 2 ? 0.7 : 0.85;
      finalDmg *= 2.0 * red;
    }

    // Shield absorbs first
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, finalDmg);
      this.shield -= shieldAbsorb;
      finalDmg -= shieldAbsorb;
      if (this.shield <= 0) {
        soundEngine.playShieldBreak();
      }
    }

    if (finalDmg > 0) {
      this.hp -= finalDmg;
    }

    if (this.onDamaged) this.onDamaged();
    this.broadcastStats();

    if (this.hp <= 0) {
      this.hp = 0;
      this.handlePlayerDeath(attackerName);
    }
  }

  private handlePlayerDeath(killerName: string) {
    this.isGameOver = true;
    if (this.onKillFeed) {
      this.onKillFeed({
        id: `kill_${Date.now()}`,
        killerName,
        victimName: this.champion.name + ' (You)',
        weaponName: 'Plasma-AR',
        isHeadshot: false,
        isPlayerKill: false,
        timestamp: Date.now()
      });
    }

    const rank = this.aliveCount;
    if (this.onMatchEnd) {
      this.onMatchEnd(false, {
        hp: 0,
        maxHp: this.maxHp,
        shield: 0,
        maxShield: this.maxShield,
        armorLevel: this.armorLevel,
        helmetLevel: this.helmetLevel,
        backpackLevel: this.backpackLevel,
        kills: this.kills,
        damageDealt: Math.round(this.damageDealt),
        aliveCount: rank,
        rank,
        survivalTime: Math.round(this.survivalTime)
      });
    }
  }

  // Safe Zone Updates
  private updateSafeZone(delta: number) {
    if (this.safeZone.phase >= this.safeZone.maxPhases) return;

    this.safeZone.timer -= delta;
    if (this.safeZone.timer <= 0) {
      if (this.safeZone.state === 'waiting') {
        // Start shrinking
        this.safeZone.state = 'shrinking';
        const phaseDef = SAFE_ZONE_PHASES[this.safeZone.phase];
        this.safeZone.timer = phaseDef.shrinkTime;
        soundEngine.playZoneWarning();
      } else {
        // Finished shrinking this phase, advance
        this.safeZone.state = 'waiting';
        this.safeZone.phase++;
        if (this.safeZone.phase < this.safeZone.maxPhases) {
          const nextDef = SAFE_ZONE_PHASES[this.safeZone.phase];
          this.safeZone.timer = nextDef.waitTime;
          this.safeZone.currentRadius = this.safeZone.nextRadius;
          this.safeZone.currentCenter = [...this.safeZone.nextCenter];

          // Compute new random next center within current radius
          const offsetRadius = (this.safeZone.currentRadius - nextDef.radius) * 0.6;
          const angle = Math.random() * Math.PI * 2;
          this.safeZone.nextCenter = [
            this.safeZone.currentCenter[0] + Math.cos(angle) * offsetRadius,
            this.safeZone.currentCenter[1] + Math.sin(angle) * offsetRadius
          ];
          this.safeZone.nextRadius = nextDef.radius;
          this.safeZone.dps = nextDef.dps;

          // Spawn high tier airdrop near the new safe zone center
          this.spawnAirdrop(this.safeZone.nextCenter[0], this.safeZone.nextCenter[1]);
        }
      }
    }

    // Interpolate current radius during shrinking
    if (this.safeZone.state === 'shrinking') {
      const phaseDef = SAFE_ZONE_PHASES[this.safeZone.phase];
      const progress = 1 - (this.safeZone.timer / phaseDef.shrinkTime);
      const startR = this.safeZone.phase === 0 ? 280 : SAFE_ZONE_PHASES[this.safeZone.phase - 1].radius;
      const targetR = phaseDef.radius;
      this.safeZone.currentRadius = startR + (targetR - startR) * progress;
    }

    // Update 3D mesh scale
    this.stormMesh.scale.set(this.safeZone.currentRadius / 280, 1, this.safeZone.currentRadius / 280);
    this.stormMesh.position.set(this.safeZone.currentCenter[0], 80, this.safeZone.currentCenter[1]);

    // Update next zone wireframe
    this.nextZoneMesh.scale.set(this.safeZone.nextRadius / 210, 1, this.safeZone.nextRadius / 210);
    this.nextZoneMesh.position.set(this.safeZone.nextCenter[0], 0.6, this.safeZone.nextCenter[1]);

    // Check storm damage on player
    const distToCenter = Math.sqrt(
      Math.pow(this.playerPosition.x - this.safeZone.currentCenter[0], 2) +
      Math.pow(this.playerPosition.z - this.safeZone.currentCenter[1], 2)
    );

    if (distToCenter > this.safeZone.currentRadius && !this.isDropping) {
      this.stormDamageTimer += delta;
      if (this.stormDamageTimer >= 1.0) {
        this.stormDamageTimer = 0;
        let dps = this.safeZone.dps;
        if (this.champion.id === 'nova') dps *= 0.6; // Passive reduced storm damage
        this.damagePlayer(dps, false, 'The Storm');
      }
    }

    if (this.onZoneUpdate) {
      this.onZoneUpdate(this.safeZone);
    }
  }

  // Airdrop Spawn
  private spawnAirdrop(x: number, z: number) {
    const group = new THREE.Group();

    // Golden Crate
    const crateGeom = new THREE.BoxGeometry(2.4, 2.4, 2.4);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2
    });
    const crate = new THREE.Mesh(crateGeom, crateMat);
    group.add(crate);

    // Red smoke flare beacon on top
    const flareGeom = new THREE.CylinderGeometry(0.1, 0.4, 5, 8);
    const flareMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.7 });
    const flare = new THREE.Mesh(flareGeom, flareMat);
    flare.position.y = 3.5;
    group.add(flare);

    // Parachute
    const chuteGeom = new THREE.ConeGeometry(4.2, 1.8, 8, 1, true);
    chuteGeom.rotateX(Math.PI);
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0xef4444, side: THREE.DoubleSide });
    const chute = new THREE.Mesh(chuteGeom, chuteMat);
    chute.position.y = 5.5;
    group.add(chute);

    const groundY = this.getGroundHeight(x, z);
    group.position.set(x, 150, z);
    this.scene.add(group);

    this.airdrops.push({
      mesh: group,
      targetY: groundY + 1.2,
      landed: false
    });
  }

  // Main Game Loop Update
  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    if (!this.isGameOver) {
      this.survivalTime += delta;
    }

    // 1. Dropship progression across massive arena
    if (this.dropshipMesh) {
      if (this.isDropping) {
        this.dropshipProgress += delta * 0.038;
        this.dropshipMesh.position.lerpVectors(this.dropshipPos, this.dropshipTarget, this.dropshipProgress);

        // Position player inside military transport cargo bay looking down at the island
        this.playerMesh.position.copy(this.dropshipMesh.position).add(new THREE.Vector3(0, -1.8, -16));
        this.playerPosition.copy(this.playerMesh.position);

        if (this.dropshipProgress >= 0.88) {
          this.deployFromDropship();
        }
      } else {
        // Plane continues flying majestically across the sky into the distance
        if (this.dropshipProgress < 1.4) {
          this.dropshipProgress += delta * 0.038;
          this.dropshipMesh.position.lerpVectors(this.dropshipPos, this.dropshipTarget, this.dropshipProgress);
        }
      }

      // Spin turboprop propellers on the aircraft
      if (this.dropshipMesh.userData?.propellers) {
        this.dropshipMesh.userData.propellers.forEach((p: THREE.Object3D) => {
          p.rotation.z += delta * 42;
        });
      }
    }

    // 2. Safe Zone
    this.updateSafeZone(delta);

    // 3. Player Movement & Physics
    if (!this.isDropping) {
      if (this.isDriving && this.currentVehicle) {
        this.updateVehiclePhysics(delta);
      } else {
        this.updatePlayerMovement(delta);
      }
    }

    // 4. Weapons & Reloading
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }
    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.completeReload();
      }
    }
    if (this.recoilKick > 0) {
      this.recoilKick = Math.max(0, this.recoilKick - delta * 0.12);
    }

    // 5. Automatic Firing if trigger held down
    if (this.isTriggerDown && this.shootCooldown <= 0) {
      this.shootWeapon();
    }

    // 6. Update Bullets & Ballistics
    this.updateBullets(delta);

    // 7. Update AI Bots
    this.updateBots(delta);

    // 8. Update Airdrops
    this.updateAirdrops(delta);

    // 9. Update Loot Prompts
    this.updatePrompts();

    // 10. Update Camera
    this.updateCamera(delta);

    // 11. Update Floating Damage Numbers
    for (let i = this.activeDamageNumbers.length - 1; i >= 0; i--) {
      const d = this.activeDamageNumbers[i];
      d.life -= delta;
      d.worldPos.y += 1.8 * delta;
      if (d.life <= 0) {
        this.activeDamageNumbers.splice(i, 1);
      }
    }

    if (this.onDamageNumbersUpdate && this.camera) {
      const screenNums: ScreenDamageNumber[] = [];
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      for (const d of this.activeDamageNumbers) {
        const v = d.worldPos.clone().project(this.camera);
        if (v.z < 1) {
          screenNums.push({
            id: d.id,
            x: v.x * halfW + halfW,
            y: -(v.y * halfH) + halfH,
            text: d.text,
            isHeadshot: d.isHeadshot,
            isShield: d.isShield,
            opacity: Math.max(0, d.life / d.maxLife)
          });
        }
      }
      this.onDamageNumbersUpdate(screenNums);
    }

    // 12. Check Targeted Enemy for Reticle Nameplate
    if (this.onTargetEnemyUpdate && this.camera) {
      let targetedEnemy: TargetEnemyInfo | null = null;
      let minAngle = 0.16; // cone around crosshair

      const camDir = new THREE.Vector3();
      this.camera.getWorldDirection(camDir);

      for (const bot of this.bots) {
        if (bot.state === 'dead' || bot.isSquadmate) continue;
        const toBot = bot.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0)).sub(this.camera.position);
        const dist = toBot.length();
        if (dist < 110) {
          toBot.normalize();
          const angle = camDir.angleTo(toBot);
          if (angle < minAngle) {
            minAngle = angle;
            targetedEnemy = {
              name: bot.name,
              hp: Math.max(0, Math.round(bot.hp)),
              maxHp: bot.maxHp,
              shield: Math.max(0, Math.round(bot.shield)),
              maxShield: bot.maxShield,
              distance: Math.round(dist)
            };
          }
        }
      }
      this.onTargetEnemyUpdate(targetedEnemy);
    }

    // 12.5. Realistic Environmental Animations: Ocean waves & cloud drift
    if (this.oceanNormalMap) {
      this.oceanNormalMap.offset.x = (this.oceanNormalMap.offset.x + delta * 0.022) % 1.0;
      this.oceanNormalMap.offset.y = (this.oceanNormalMap.offset.y + delta * 0.016) % 1.0;
    }
    if (this.cloudsGroup) {
      this.cloudsGroup.rotation.y += delta * 0.0035;
    }

    // 13. Render
    this.renderer.render(this.scene, this.camera);
  };

  private updatePlayerMovement(delta: number) {
    const forward = new THREE.Vector3(
      -Math.sin(this.cameraRotation.yaw),
      0,
      -Math.cos(this.cameraRotation.yaw)
    ).normalize();

    const right = new THREE.Vector3(
      Math.cos(this.cameraRotation.yaw),
      0,
      -Math.sin(this.cameraRotation.yaw)
    ).normalize();

    // Speed calculation
    let speed = 8.5 * this.champion.speedMultiplier;
    if (this.isSprinting && !this.isAiming) speed *= 1.45;
    if (this.isCrouched) speed *= 0.55;
    if (this.isAiming) speed *= 0.65;
    if (this.currentWeapon.type === 'melee') speed *= 1.15; // Blade passive

    // Movement direction vector
    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, this.moveForward)
      .addScaledVector(right, this.moveRight);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();

      // Footsteps
      if (this.isGrounded) {
        this.footstepTimer += delta * (this.isSprinting ? 1.6 : 1.0);
        if (this.footstepTimer > 0.4) {
          this.footstepTimer = 0;
          if (this.champion.id !== 'whisper') {
            soundEngine.playFootstep();
          }
        }
      }
    }

    // Gliding vs Grounded Physics
    if (this.isGliding) {
      // Glider descent
      this.playerVelocity.y = -4.5;
      const glideSpeed = 16.0;
      this.playerPosition.x += (forward.x * this.moveForward + right.x * this.moveRight) * glideSpeed * delta;
      this.playerPosition.z += (forward.z * this.moveForward + right.z * this.moveRight) * glideSpeed * delta;
      this.playerPosition.y += this.playerVelocity.y * delta;

      const groundY = this.getGroundHeight(this.playerPosition.x, this.playerPosition.z);
      if (this.playerPosition.y <= groundY + 0.1) {
        this.playerPosition.y = groundY;
        this.isGliding = false;
        this.isGrounded = true;
        this.playerParachuteMesh.visible = false;
        soundEngine.playJump();
      }
    } else {
      // Normal ground walking & gravity
      this.playerPosition.x += moveDir.x * speed * delta;
      this.playerPosition.z += moveDir.z * speed * delta;

      // Jump
      if (this.isJumpPressed && this.isGrounded) {
        this.playerVelocity.y = 8.8;
        this.isGrounded = false;
        soundEngine.playJump();
      }

      // Gravity
      this.playerVelocity.y -= 22 * delta;
      this.playerPosition.y += this.playerVelocity.y * delta;

      const groundY = this.getGroundHeight(this.playerPosition.x, this.playerPosition.z);
      if (this.playerPosition.y <= groundY) {
        this.playerPosition.y = groundY;
        this.playerVelocity.y = 0;
        this.isGrounded = true;
      }
    }

    // World bounds clamp - Scaled for 1600x1600 Massive Island
    const maxBound = 740;
    this.playerPosition.x = Math.max(-maxBound, Math.min(maxBound, this.playerPosition.x));
    this.playerPosition.z = Math.max(-maxBound, Math.min(maxBound, this.playerPosition.z));

    // Update Player Mesh Position & Yaw
    this.playerMesh.position.copy(this.playerPosition);
    this.playerMesh.rotation.y = this.cameraRotation.yaw;

    // Crouch posture
    this.playerMesh.scale.y = this.isCrouched ? 0.72 : 1.0;

    // Realistic Player Limb & Combat Animations
    if (this.playerComponents) {
      const isMoving = moveDir.lengthSq() > 0.01 && this.isGrounded && !this.isDriving;
      if (isMoving) {
        this.playerAnimTime += delta * (this.isSprinting ? 14 : 9.5);
        const stride = this.isSprinting ? 0.75 : 0.52;

        this.playerComponents.leftLeg.rotation.x = Math.sin(this.playerAnimTime) * stride;
        this.playerComponents.rightLeg.rotation.x = -Math.sin(this.playerAnimTime) * stride;

        // Arm counter-swing if not aiming
        if (!this.isAiming) {
          this.playerComponents.leftArm.rotation.x = -Math.sin(this.playerAnimTime) * (stride * 0.45);
          this.playerComponents.rightArm.rotation.x = Math.sin(this.playerAnimTime) * (stride * 0.35);
        }

        // Subtle vertical torso bounce
        this.playerComponents.spineGroup.position.y = 0.1 + Math.abs(Math.sin(this.playerAnimTime * 2)) * 0.04;
      } else {
        // Idle breathing and settle
        this.playerAnimTime += delta * 2.5;
        this.playerComponents.leftLeg.rotation.x = THREE.MathUtils.lerp(this.playerComponents.leftLeg.rotation.x, 0, 0.15);
        this.playerComponents.rightLeg.rotation.x = THREE.MathUtils.lerp(this.playerComponents.rightLeg.rotation.x, 0, 0.15);
        this.playerComponents.spineGroup.position.y = THREE.MathUtils.lerp(
          this.playerComponents.spineGroup.position.y,
          0.1 + Math.sin(this.playerAnimTime) * 0.02,
          0.1
        );

        if (!this.isAiming) {
          this.playerComponents.rightArm.rotation.x = THREE.MathUtils.lerp(this.playerComponents.rightArm.rotation.x, 0, 0.15);
          this.playerComponents.leftArm.rotation.x = THREE.MathUtils.lerp(this.playerComponents.leftArm.rotation.x, 0, 0.15);
        }
      }

      // Pitch upper torso & rifle along camera pitch when aiming
      if (this.isAiming) {
        this.playerComponents.spineGroup.rotation.x = this.cameraRotation.pitch * 0.65;
      } else {
        this.playerComponents.spineGroup.rotation.x = 0;
      }
    }
  }

  private updateVehiclePhysics(delta: number) {
    if (!this.currentVehicle) return;
    const v = this.currentVehicle;
    const isBike = v.type === 'bike';

    // Acceleration & Braking - Superbikes have fast, agile acceleration!
    const accelRate = isBike ? 24 : 18;
    const drag = isBike ? 0.975 : 0.96;

    if (this.moveForward > 0) {
      v.speed = Math.min(v.maxSpeed, v.speed + accelRate * delta * (this.isSprinting ? 1.4 : 1.0));
    } else if (this.moveForward < 0) {
      v.speed = Math.max(-14, v.speed - accelRate * delta);
    } else {
      v.speed *= drag;
    }

    // Steering
    if (this.moveRight !== 0 && Math.abs(v.speed) > 0.5) {
      const steerSpeed = (isBike ? 2.9 : 2.2) * Math.sign(v.speed);
      v.rotationY -= this.moveRight * steerSpeed * delta;
    }

    // Dynamic Motorcycle Leaning into corners
    if (isBike) {
      const targetRoll = -this.moveRight * Math.min(0.45, Math.abs(v.speed) / 24);
      v.mesh.rotation.z = THREE.MathUtils.lerp(v.mesh.rotation.z, targetRoll, delta * 9);
    } else {
      v.mesh.rotation.z = THREE.MathUtils.lerp(v.mesh.rotation.z, 0, delta * 6);
    }

    // Move vehicle along its heading
    const forwardX = Math.sin(v.rotationY);
    const forwardZ = Math.cos(v.rotationY);

    v.position.x += forwardX * v.speed * delta;
    v.position.z += forwardZ * v.speed * delta;

    const groundY = this.getGroundHeight(v.position.x, v.position.z);
    v.position.y = groundY + (isBike ? 0.45 : 0.35);

    // Rotate wheels
    v.wheels.forEach(w => {
      w.rotation.x += (v.speed / 0.65) * delta;
    });

    v.mesh.position.copy(v.position);
    v.mesh.rotation.y = v.rotationY;

    // Audio update
    soundEngine.updateVehicleEngine(Math.abs(v.speed) / v.maxSpeed);

    // Collision with bots (Run-over damage!)
    this.bots.forEach(bot => {
      if (bot.state !== 'dead' && Math.abs(v.speed) > 12) {
        if (bot.mesh.position.distanceTo(v.position) < 3.2) {
          const impactDmg = Math.round(Math.abs(v.speed) * 3);
          this.damageBot(bot, impactDmg, false, 'Vehicle');
        }
      }
    });

    // Player stays inside vehicle position
    this.playerPosition.copy(v.position);
  }

  private updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      const stepDist = b.speed * delta;
      b.distanceTraveled += stepDist;
      b.mesh.position.addScaledVector(b.direction, stepDist);

      let hit = false;

      // 1. Check Bot hits (if player fired)
      if (b.isPlayerBullet) {
        for (const bot of this.bots) {
          if (bot.state === 'dead' || bot.isSquadmate) continue;
          const distToBot = b.mesh.position.distanceTo(bot.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
          if (distToBot < 1.35) {
            const isHead = b.mesh.position.y > bot.mesh.position.y + 1.8;
            this.damageBot(bot, b.damage, isHead, this.champion.name);
            hit = true;
            break;
          }
        }
      } else {
        // 2. Check Player hit (if bot fired and shooter is not squadmate)
        const shooterBot = this.bots.find(s => s.id === b.shooterBotId);
        const isShooterSquadmate = shooterBot ? shooterBot.isSquadmate : false;

        const distToPlayer = b.mesh.position.distanceTo(this.playerPosition.clone().add(new THREE.Vector3(0, 1.2, 0)));
        if (distToPlayer < 1.35 && !this.isDropping && !isShooterSquadmate) {
          const isHead = b.mesh.position.y > this.playerPosition.y + 1.8;
          this.damagePlayer(b.damage, isHead, b.shooterName || 'Bot');
          hit = true;
        }

        // 2b. Check other Bot hits! (Bots can kill each other!)
        if (!hit) {
          for (const targetBot of this.bots) {
            if (targetBot.state === 'dead' || targetBot.id === b.shooterBotId) continue;
            if (isShooterSquadmate && targetBot.isSquadmate) continue;

            const distToBot = b.mesh.position.distanceTo(targetBot.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
            if (distToBot < 1.35) {
              const isHead = b.mesh.position.y > targetBot.mesh.position.y + 1.8;
              this.damageBot(targetBot, b.damage, isHead, b.shooterName || 'Bot');
              hit = true;
              break;
            }
          }
        }
      }

      // 3. Ground / Terrain collision
      const groundY = this.getGroundHeight(b.mesh.position.x, b.mesh.position.z);
      if (b.mesh.position.y <= groundY) {
        hit = true;
      }

      if (hit || b.distanceTraveled >= b.maxDistance) {
        if (b.isRocket) {
          soundEngine.playExplosion();
          // Area damage
          if (b.isPlayerBullet) {
            this.bots.forEach(bot => {
              if (bot.state !== 'dead' && !bot.isSquadmate) {
                const d = bot.mesh.position.distanceTo(b.mesh.position);
                if (d < 8) {
                  this.damageBot(bot, Math.round(90 * (1 - d / 8)), false, this.champion.name);
                }
              }
            });
          }
        }
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
      }
    }
  }

  // Damage a bot
  public damageBot(bot: BotEntity, amount: number, isHeadshot: boolean, attackerName: string) {
    if (bot.state === 'dead') return;

    let finalDmg = amount;
    if (isHeadshot) finalDmg *= 2.0;

    const isShieldHit = bot.shield > 0;

    // Shield
    if (bot.shield > 0) {
      const absorb = Math.min(bot.shield, finalDmg);
      bot.shield -= absorb;
      finalDmg -= absorb;
    }
    if (finalDmg > 0) {
      bot.hp -= finalDmg;
    }

    const isPlayer = attackerName === this.champion.name;

    if (isPlayer) {
      // Audio hit marker for player
      soundEngine.playHitMarker(isHeadshot);
      if (this.onHitConfirmed) {
        this.onHitConfirmed(isHeadshot);
      }

      const recordedDmg = Math.round(isHeadshot ? amount * 2.0 : amount);
      this.damageDealt += recordedDmg;
      this.broadcastStats();

      // Spawn floating damage popup for player hits
      this.activeDamageNumbers.push({
        id: `dmg_${Date.now()}_${Math.random()}`,
        text: `-${recordedDmg}${isHeadshot ? ' CRIT!' : ''}`,
        worldPos: bot.mesh.position.clone().add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.7,
          2.5 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.7
        )),
        life: 0.95,
        maxLife: 0.95,
        isHeadshot,
        isShield: isShieldHit
      });

      // Target the player
      bot.targetEnemy = this.playerPosition.clone();
    } else {
      // Target the attacker bot that shot them!
      const attackerBot = this.bots.find(b => b.name === attackerName);
      if (attackerBot && attackerBot.state !== 'dead') {
        bot.targetEnemy = attackerBot.mesh.position.clone();
      }
    }

    bot.state = 'combat';

    if (bot.hp <= 0) {
      bot.hp = 0;
      bot.state = 'dead';
      this.eliminateBot(bot, attackerName, isHeadshot);
    }
  }

  private eliminateBot(bot: BotEntity, killerName: string, isHeadshot: boolean) {
    this.aliveCount--;

    // Spawn death loot box
    this.addLootItem({
      id: `deathbox_${Date.now()}`,
      name: `${bot.name} Crate`,
      type: 'weapon',
      weaponId: bot.weapon.id,
      rarity: 'epic',
      value: 100,
      position: [bot.mesh.position.x, bot.mesh.position.y + 0.3, bot.mesh.position.z]
    });

    // Digital dissolve effect / hide
    this.scene.remove(bot.mesh);

    const isPlayer = killerName === this.champion.name;
    if (isPlayer) {
      this.kills++;
    }

    if (this.onKillFeed) {
      this.onKillFeed({
        id: `kill_${Date.now()}_${Math.random()}`,
        killerName,
        victimName: bot.name,
        weaponName: bot.weapon.name,
        isHeadshot,
        isPlayerKill: isPlayer,
        timestamp: Date.now()
      });
    }

    this.broadcastStats();

    // Check Victory Condition!
    const enemiesAlive = this.bots.filter(b => b.state !== 'dead' && !b.isSquadmate).length;
    if (enemiesAlive === 0) {
      this.handleVictory();
    }
  }

  private handleVictory() {
    this.isGameOver = true;
    soundEngine.playVictoryFanfare();
    if (this.onMatchEnd) {
      this.onMatchEnd(true, {
        hp: this.hp,
        maxHp: this.maxHp,
        shield: this.shield,
        maxShield: this.maxShield,
        armorLevel: this.armorLevel,
        helmetLevel: this.helmetLevel,
        backpackLevel: this.backpackLevel,
        kills: this.kills,
        damageDealt: Math.round(this.damageDealt),
        aliveCount: 1,
        rank: 1,
        survivalTime: Math.round(this.survivalTime)
      });
    }
  }

  // Update AI Bots Behavior
  private updateBots(delta: number) {
    this.bots.forEach(bot => {
      if (bot.state === 'dead') return;

      // 1. Dropping Phase
      if (bot.state === 'dropping') {
        bot.mesh.position.y -= 20 * delta;
        const groundY = this.getGroundHeight(bot.mesh.position.x, bot.mesh.position.z);
        if (bot.mesh.position.y <= groundY) {
          bot.mesh.position.y = groundY;
          bot.state = 'looting';
          if (bot.parachuteMesh) {
            bot.mesh.remove(bot.parachuteMesh);
          }
        }
        return;
      }

      // 2. Safe zone constraint: move towards safe zone if outside
      const distToZone = Math.sqrt(
        Math.pow(bot.mesh.position.x - this.safeZone.currentCenter[0], 2) +
        Math.pow(bot.mesh.position.z - this.safeZone.currentCenter[1], 2)
      );

      if (distToZone > this.safeZone.currentRadius) {
        bot.targetPos.set(this.safeZone.currentCenter[0], 0, this.safeZone.currentCenter[1]);
        bot.state = 'patrol';
      }

      // Squadmate follow logic
      if (bot.isSquadmate) {
        const distToPlayer = bot.mesh.position.distanceTo(this.playerPosition);
        if (distToPlayer > 8) {
          bot.targetPos.copy(this.playerPosition).add(new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6));
        }
      }

      // 3. Movement towards targetPos
      const dir = bot.targetPos.clone().sub(bot.mesh.position);
      dir.y = 0;
      const isMoving = dir.length() > 2;

      if (isMoving) {
        dir.normalize();
        const speed = bot.isSquadmate ? 9.5 : 7.5;
        bot.mesh.position.addScaledVector(dir, speed * delta);
        bot.mesh.rotation.y = Math.atan2(dir.x, dir.z);

        // Smooth running leg/arm swing animation
        bot.animTime = (bot.animTime || 0) + delta * 11;
        if (bot.leftLeg && bot.rightLeg) {
          bot.leftLeg.rotation.x = Math.sin(bot.animTime) * 0.7;
          bot.rightLeg.rotation.x = -Math.sin(bot.animTime) * 0.7;
        }
        if (bot.leftArm) {
          bot.leftArm.rotation.x = -Math.PI / 6 - Math.sin(bot.animTime) * 0.55;
        }
      } else {
        // Idle breathing / standing pose
        bot.animTime = (bot.animTime || 0) + delta * 3;
        if (bot.leftLeg && bot.rightLeg) {
          bot.leftLeg.rotation.x = THREE.MathUtils.lerp(bot.leftLeg.rotation.x, 0, 0.15);
          bot.rightLeg.rotation.x = THREE.MathUtils.lerp(bot.rightLeg.rotation.x, 0, 0.15);
        }
        if (bot.leftArm) {
          bot.leftArm.rotation.x = THREE.MathUtils.lerp(
            bot.leftArm.rotation.x,
            -Math.PI / 6 + Math.sin(bot.animTime) * 0.08,
            0.15
          );
        }

        if (bot.state === 'patrol' || bot.state === 'looting') {
          // Pick new patrol point nearby
          const randAngle = Math.random() * Math.PI * 2;
          const randR = 15 + Math.random() * 30;
          bot.targetPos.set(
            bot.mesh.position.x + Math.cos(randAngle) * randR,
            0,
            bot.mesh.position.z + Math.sin(randAngle) * randR
          );
        }
      }

      // Ground height clamp
      bot.mesh.position.y = this.getGroundHeight(bot.mesh.position.x, bot.mesh.position.z);

      // 4. Combat Detection & Multi-Target Acquisition (Bots aggressively attack Player AND other Enemy Bots!)
      let currentTarget: { pos: THREE.Vector3; name: string } | null = null;
      let closestDist = 135;

      // 4a. Check Player
      if (!bot.isSquadmate && !this.isDropping) {
        const d = bot.mesh.position.distanceTo(this.playerPosition);
        if (d < closestDist) {
          closestDist = d;
          currentTarget = { pos: this.playerPosition.clone(), name: this.champion.name };
        }
      }

      // 4b. Check other enemy bots (AI vs AI Skirmishes)
      for (const other of this.bots) {
        if (other.id === bot.id || other.state === 'dead') continue;
        if (bot.isSquadmate && other.isSquadmate) continue;

        const d = bot.mesh.position.distanceTo(other.mesh.position);
        if (d < closestDist) {
          closestDist = d;
          currentTarget = { pos: other.mesh.position.clone(), name: other.name };
        }
      }

      if (currentTarget) {
        bot.targetEnemy = currentTarget.pos;
        bot.state = 'combat';

        // Face hostile target
        const aimDir = currentTarget.pos.clone().sub(bot.mesh.position).normalize();
        bot.mesh.rotation.y = Math.atan2(aimDir.x, aimDir.z);

        if (bot.spineGroup) {
          const aimY = (currentTarget.pos.y - bot.mesh.position.y) / Math.max(1, closestDist);
          bot.spineGroup.rotation.x = THREE.MathUtils.lerp(bot.spineGroup.rotation.x, -aimY * 0.45, 0.15);
        }

        // Shoot at target
        bot.shootCooldown -= delta;
        if (bot.shootCooldown <= 0) {
          bot.shootCooldown = 1 / bot.weapon.fireRate + Math.random() * 0.35;
          const origin = bot.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
          const bulletDir = aimDir.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * (1 - bot.accuracy),
            (Math.random() - 0.5) * (1 - bot.accuracy),
            (Math.random() - 0.5) * (1 - bot.accuracy)
          )).normalize();

          this.spawnBullet(origin, bulletDir, bot.weapon, false, bot.name, bot.id);
          if (bot.mesh.position.distanceTo(this.playerPosition) < 220) {
            soundEngine.playGunshot(bot.weapon.type);
          }
        }
      }

      // 5. Update Billboard Green Bar at the top of their head
      if (bot.healthBarGroup && bot.hpBarMesh) {
        bot.healthBarGroup.quaternion.copy(this.camera.quaternion);

        const dist = bot.mesh.position.distanceTo(this.playerPosition);
        const distScale = Math.max(1, Math.min(2.4, dist / 24));
        bot.healthBarGroup.scale.set(distScale, distScale, distScale);

        const hpRatio = Math.max(0.001, Math.min(1, bot.hp / bot.maxHp));
        bot.hpBarMesh.scale.x = hpRatio;
        bot.hpBarMesh.position.x = -0.56 + (1.12 * hpRatio) / 2;

        bot.healthBarGroup.visible = dist < 140;
      }
    });
  }

  // Airdrop falling update
  private updateAirdrops(delta: number) {
    this.airdrops.forEach(ad => {
      if (!ad.landed) {
        ad.mesh.position.y -= 12 * delta;
        if (ad.mesh.position.y <= ad.targetY) {
          ad.mesh.position.y = ad.targetY;
          ad.landed = true;

          // Spawn legendary loot around crate
          this.addLootItem({
            id: `airdrop_loot_${Date.now()}`,
            name: 'Plasma-Havoc RPG',
            type: 'weapon',
            weaponId: 'rocket',
            rarity: 'legendary',
            value: 120,
            position: [ad.mesh.position.x + 1.5, ad.targetY, ad.mesh.position.z]
          });
          this.addLootItem({
            id: `airdrop_armor_${Date.now()}`,
            name: 'Titan Shield Vest Lv 3',
            type: 'armor',
            rarity: 'legendary',
            value: 100,
            position: [ad.mesh.position.x - 1.5, ad.targetY, ad.mesh.position.z]
          });
        }
      }
    });
  }

  // Prompts for UI
  private updatePrompts() {
    // Loot
    const loot = this.getNearestLoot(3.0);
    if (this.onLootPrompt) {
      this.onLootPrompt(loot);
    }

    // Vehicle
    const vehicle = this.getNearestVehicle(4.5);
    if (this.onVehiclePrompt) {
      this.onVehiclePrompt(!!vehicle && !vehicle.isOccupied, this.isDriving);
    }
  }

  // Camera Third-Person Tracking (Ultra-Fast, Responsive Screen Look)
  private updateCamera(delta: number) {
    const fovTarget = this.isAiming ? (this.currentWeapon.type === 'sniper' ? 22 : 44) : 74;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, fovTarget, delta * 24);
    this.camera.updateProjectionMatrix();

    // 1. Cinematic Dropship Aircraft Camera (Active plane flight view while inside/riding)
    if (this.isDropping && this.dropshipMesh) {
      const flightHeading = Math.atan2(
        this.dropshipTarget.x - this.dropshipPos.x,
        this.dropshipTarget.z - this.dropshipPos.z
      );
      const camDist = 58;
      const camHeight = 18;
      const planePos = this.dropshipMesh.position;

      const targetCamPos = new THREE.Vector3(
        planePos.x - Math.sin(flightHeading) * camDist,
        planePos.y + camHeight,
        planePos.z - Math.cos(flightHeading) * camDist
      );
      this.camera.position.lerp(targetCamPos, delta * 12);
      this.camera.lookAt(planePos.clone().add(new THREE.Vector3(0, -3, 20)));
      return;
    }

    // 2. Vehicle Chase Camera (Tuned for high-speed bikes and heavy rovers)
    if (this.isDriving && this.currentVehicle) {
      const v = this.currentVehicle;
      const isBike = v.type === 'bike';
      const camDist = isBike ? 6.8 : 9.5;
      const camHeight = isBike ? 3.2 : 4.2;
      const targetCamPos = v.position.clone().add(new THREE.Vector3(
        -Math.sin(v.rotationY) * camDist,
        camHeight,
        -Math.cos(v.rotationY) * camDist
      ));
      this.camera.position.lerp(targetCamPos, delta * 14);
      this.camera.lookAt(v.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
      return;
    }

    // 3. Player TPS Shoulder Camera - Instant Snappy Screen Movement
    const eyeHeight = this.isCrouched ? 1.1 : 1.7;
    const targetLook = this.playerPosition.clone().add(new THREE.Vector3(0, eyeHeight, 0));

    // Distance and shoulder offset
    let dist = this.isAiming ? 1.6 : 3.8;
    let shoulderOffset = this.isAiming ? 0.6 : 0.75;
    if (this.isGliding) dist = 6.2;

    const yaw = this.cameraRotation.yaw;
    const pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraRotation.pitch + this.recoilKick));

    const cx = this.playerPosition.x - Math.sin(yaw) * Math.cos(pitch) * dist + Math.cos(yaw) * shoulderOffset;
    const cy = this.playerPosition.y + eyeHeight + Math.sin(pitch) * dist;
    const cz = this.playerPosition.z - Math.cos(yaw) * Math.cos(pitch) * dist - Math.sin(yaw) * shoulderOffset;

    this.camera.position.set(cx, Math.max(cy, this.getGroundHeight(cx, cz) + 0.4), cz);
    this.camera.lookAt(targetLook.clone().add(new THREE.Vector3(
      -Math.sin(yaw) * 40,
      Math.sin(pitch) * 40,
      -Math.cos(yaw) * 40
    )));
  }

  private broadcastStats() {
    if (this.playerHealthBarGroup && this.playerHpBarMesh) {
      this.playerHealthBarGroup.quaternion.copy(this.camera.quaternion);
      const hpRatio = Math.max(0.001, Math.min(1, this.hp / this.maxHp));
      this.playerHpBarMesh.scale.x = hpRatio;
      this.playerHpBarMesh.position.x = -0.56 + (1.12 * hpRatio) / 2;
    }

    if (this.onUpdateStats) {
      this.onUpdateStats({
        hp: this.hp,
        maxHp: this.maxHp,
        shield: this.shield,
        maxShield: this.maxShield,
        armorLevel: this.armorLevel,
        helmetLevel: this.helmetLevel,
        backpackLevel: this.backpackLevel,
        kills: this.kills,
        damageDealt: Math.round(this.damageDealt),
        aliveCount: this.aliveCount,
        rank: this.aliveCount,
        survivalTime: Math.round(this.survivalTime)
      });
    }
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    soundEngine.stopVehicleEngine();
    if (this.renderer && this.renderer.domElement && this.container) {
      try {
        this.container.removeChild(this.renderer.domElement);
      } catch {
        // Ignored
      }
    }
  }
}
