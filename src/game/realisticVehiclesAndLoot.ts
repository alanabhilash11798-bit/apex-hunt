import * as THREE from 'three';
import { LootItem } from '../types/game';
import { RealisticTextureFactory } from './realisticTextures';

export interface VehicleEntity {
  id: string;
  type: 'car' | 'bike';
  mesh: THREE.Group;
  wheels: THREE.Mesh[];
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  speed: number;
  maxSpeed: number;
  steerAngle: number;
  isOccupied: boolean;
  occupantIsPlayer: boolean;
  hp: number;
  headlights: THREE.SpotLight[];
}

// 1. Realistic Cyber Offroad Tactical Rover / Buggy
export function buildRealisticRover(id: string, x: number, y: number, z: number): VehicleEntity {
  const group = new THREE.Group();
  const gunmetal = RealisticTextureFactory.createGunmetalTexture();

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Tactical navy/cyan coat
    roughness: 0.35,
    metalness: 0.7,
    bumpMap: gunmetal,
    bumpScale: 0.02
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.85
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x0a0f1d,
    roughness: 0.9,
    metalness: 0.1
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.95,
    roughness: 0.15
  });

  // Main Chassis & Hood
  const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 4.6), chassisMat);
  mainChassis.position.y = 0.9;
  mainChassis.castShadow = true;
  group.add(mainChassis);

  // Sloped Hood
  const hoodGeom = new THREE.BoxGeometry(2.1, 0.45, 1.8);
  const hood = new THREE.Mesh(hoodGeom, chassisMat);
  hood.position.set(0, 1.15, 1.2);
  hood.rotation.x = -0.15;
  hood.castShadow = true;
  group.add(hood);

  // Heavy Tubular Steel Roll Cage
  const cage = new THREE.Group();
  // A-pillars, roof, B-pillars
  [-0.95, 0.95].forEach(cx => {
    const aPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), frameMat);
    aPillar.position.set(cx, 1.7, 0.5);
    aPillar.rotation.x = 0.45;
    cage.add(aPillar);

    const bPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), frameMat);
    bPillar.position.set(cx, 1.8, -1.4);
    bPillar.rotation.x = -0.2;
    cage.add(bPillar);

    const roofRail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8), frameMat);
    roofRail.rotation.x = Math.PI / 2;
    roofRail.position.set(cx, 2.15, -0.45);
    cage.add(roofRail);
  });

  // Crossbars
  const crossFront = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8), frameMat);
  crossFront.rotation.z = Math.PI / 2;
  crossFront.position.set(0, 2.15, 0.45);
  cage.add(crossFront);

  const crossRear = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.9, 8), frameMat);
  crossRear.rotation.z = Math.PI / 2;
  crossRear.position.set(0, 2.15, -1.35);
  cage.add(crossRear);

  group.add(cage);

  // Front Heavy Bull-Bar Bumper & Winch
  const bullBar = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.55, 0.5), frameMat);
  bullBar.position.set(0, 0.7, 2.45);
  bullBar.castShadow = true;
  group.add(bullBar);

  const winch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.6, 10), frameMat);
  winch.rotation.z = Math.PI / 2;
  winch.position.set(0, 0.65, 2.72);
  group.add(winch);

  // Roof LED Light Bar
  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.16, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9 })
  );
  lightBar.position.set(0, 2.26, 0.42);
  group.add(lightBar);

  const ledStripe = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.08, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  ledStripe.position.set(0, 2.26, 0.55);
  group.add(ledStripe);

  // Cockpit Seats & Steering Wheel
  [-0.45, 0.45].forEach(sx => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.6), frameMat);
    seat.position.set(sx, 1.4, -0.4);
    group.add(seat);
  });

  const steeringWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.035, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
  );
  steeringWheel.position.set(0.45, 1.45, 0.25);
  steeringWheel.rotation.x = -Math.PI / 4;
  group.add(steeringWheel);

  // Rear Mounted Spare Tire
  const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.42, 14), tireMat);
  spareTire.rotation.x = 0.35;
  spareTire.position.set(0, 1.45, -2.35);
  spareTire.castShadow = true;
  group.add(spareTire);

  // 4 Knobby All-Terrain Wheels with Alloy Rims
  const wheels: THREE.Mesh[] = [];
  const wheelOffsets = [
    { x: -1.35, y: 0.62, z: 1.55 },
    { x: 1.35, y: 0.62, z: 1.55 },
    { x: -1.35, y: 0.62, z: -1.55 },
    { x: 1.35, y: 0.62, z: -1.55 }
  ];

  wheelOffsets.forEach(pos => {
    const wheelGroup = new THREE.Group();

    // Tire outer rubber
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.52, 16), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim inner hub
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.54, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Center lug nuts
    const hubCap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.56, 8), frameMat);
    hubCap.rotation.z = Math.PI / 2;
    wheelGroup.add(hubCap);

    wheelGroup.position.set(pos.x, pos.y, pos.z);
    group.add(wheelGroup);
    wheels.push(tire);
  });

  // High-Intensity Spotlights
  const headlights: THREE.SpotLight[] = [];
  [-0.85, 0.85].forEach(hx => {
    const light = new THREE.SpotLight(0xfffaed, 2.5, 60, Math.PI / 5, 0.3);
    light.position.set(hx, 1.1, 2.6);
    light.target.position.set(hx, 0.2, 22);
    group.add(light);
    group.add(light.target);
    headlights.push(light);
  });

  group.position.set(x, y, z);

  return {
    id,
    type: 'car',
    mesh: group,
    wheels,
    position: new THREE.Vector3(x, y, z),
    velocity: new THREE.Vector3(),
    rotationY: 0,
    speed: 0,
    maxSpeed: 44,
    steerAngle: 0,
    isOccupied: false,
    occupantIsPlayer: false,
    hp: 420,
    headlights
  };
}

// 2. Realistic Cyber Combat Motocross / Superbike
export function buildRealisticBike(id: string, x: number, y: number, z: number): VehicleEntity {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Racing Crimson
    roughness: 0.3,
    metalness: 0.8
  });

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.45,
    metalness: 0.9
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.9,
    metalness: 0.05
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Golden alloy rims
    metalness: 0.95,
    roughness: 0.2
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1
  });

  // Aerodynamic Monocoque Body & Tank
  const tank = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 1.4), bodyMat);
  tank.position.set(0, 1.15, 0.1);
  tank.rotation.x = -0.15;
  tank.castShadow = true;
  group.add(tank);

  // Front Racing Fairing with Windscreen
  const fairing = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 6), bodyMat);
  fairing.rotation.x = Math.PI / 2 + 0.3;
  fairing.position.set(0, 1.25, 1.05);
  fairing.castShadow = true;
  group.add(fairing);

  // Tinted Windscreen
  const windscreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.38, 0.08),
    new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, transmission: 0.6, roughness: 0.1, transparent: true, opacity: 0.85 })
  );
  windscreen.position.set(0, 1.55, 0.92);
  windscreen.rotation.x = -0.45;
  group.add(windscreen);

  // Handlebars & Grips
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 8), chromeMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.48, 0.75);
  group.add(handlebar);

  // Grips
  [-0.52, 0.52].forEach(gx => {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.18, 8), frameMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.set(gx, 1.48, 0.75);
    group.add(grip);
  });

  // Inverted Front Telescopic Shocks Fork
  [-0.18, 0.18].forEach(fx => {
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.35, 8), chromeMat);
    fork.rotation.x = 0.42;
    fork.position.set(fx, 0.85, 1.15);
    fork.castShadow = true;
    group.add(fork);
  });

  // Exposed Cyber Trellis Frame & Engine Block
  const engine = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 0.85), frameMat);
  engine.position.set(0, 0.68, -0.05);
  engine.castShadow = true;
  group.add(engine);

  // Titanium High-Mount Exhaust Pipe
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 1.2, 8), chromeMat);
  exhaust.rotation.x = -0.55;
  exhaust.position.set(0.32, 0.95, -0.85);
  group.add(exhaust);

  // Dual High-Performance Motorcycle Wheels (Front & Rear)
  const wheels: THREE.Mesh[] = [];
  const wheelConfigs = [
    { x: 0, y: 0.52, z: 1.5, r: 0.54, w: 0.28 },   // Front wheel
    { x: 0, y: 0.55, z: -1.35, r: 0.58, w: 0.36 }  // Rear wider drive wheel
  ];

  wheelConfigs.forEach(pos => {
    const wheelGroup = new THREE.Group();

    // Tire
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(pos.r, pos.r, pos.w, 18), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim & Spokes
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(pos.r * 0.65, pos.r * 0.65, pos.w + 0.02, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    // Disc Brake Rotor
    const brakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(pos.r * 0.45, pos.r * 0.45, pos.w + 0.04, 12), chromeMat);
    brakeDisc.rotation.z = Math.PI / 2;
    wheelGroup.add(brakeDisc);

    wheelGroup.position.set(pos.x, pos.y, pos.z);
    group.add(wheelGroup);
    wheels.push(tire);
  });

  // Projector LED Headlights
  const headlights: THREE.SpotLight[] = [];
  [-0.14, 0.14].forEach(hx => {
    const light = new THREE.SpotLight(0xfffaed, 2.8, 65, Math.PI / 6, 0.25);
    light.position.set(hx, 1.3, 1.55);
    light.target.position.set(hx, 0.2, 24);
    group.add(light);
    group.add(light.target);
    headlights.push(light);
  });

  group.position.set(x, y, z);

  return {
    id,
    type: 'bike',
    mesh: group,
    wheels,
    position: new THREE.Vector3(x, y, z),
    velocity: new THREE.Vector3(),
    rotationY: 0,
    speed: 0,
    maxSpeed: 56, // Fast agility & speed!
    steerAngle: 0,
    isOccupied: false,
    occupantIsPlayer: false,
    hp: 260,
    headlights
  };
}

// 3. High-Fidelity 3D Dropped Items (Military Pelican Crates, Detailed Weapons, Helmets, Armor)
export function buildRealisticLoot(item: LootItem): THREE.Group {
  const group = new THREE.Group();

  const rarityColor =
    item.rarity === 'legendary'
      ? 0xf59e0b
      : item.rarity === 'epic'
      ? 0xa855f7
      : item.rarity === 'rare'
      ? 0x06b6d4
      : 0x22c55e;

  const hexColor = new THREE.Color(rarityColor);

  // Tactical Ground Hover Beacon Ring with Pulsing Sub-Rings
  const ringGeom = new THREE.RingGeometry(0.5, 0.75, 24);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 0.05;
  group.add(ring);

  // Outer segmented cyber ring
  const outerRingGeom = new THREE.RingGeometry(0.9, 1.05, 32);
  outerRingGeom.rotateX(-Math.PI / 2);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
  outerRing.position.y = 0.04;
  group.add(outerRing);

  // Vertical Light Beacon Pillar shooting high into the sky
  const pillarGeom = new THREE.CylinderGeometry(0.06, 0.12, 9.0, 10);
  const pillarMat = new THREE.MeshBasicMaterial({
    color: hexColor,
    transparent: true,
    opacity: 0.42
  });
  const pillar = new THREE.Mesh(pillarGeom, pillarMat);
  pillar.position.y = 4.5;
  group.add(pillar);

  const isDeathBox = item.name.toLowerCase().includes('crate') || item.id.startsWith('deathbox');

  if (isDeathBox) {
    // Photorealistic Heavy Military Tactical Pelican Supply Chest / Death Locker
    const crateGroup = new THREE.Group();

    // Main Case Shell
    const crateBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.75, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0x1f2937, // Tactical dark slate polymer
        roughness: 0.4,
        metalness: 0.6
      })
    );
    crateBody.position.y = 0.38;
    crateBody.castShadow = true;
    crateGroup.add(crateBody);

    // Lid Bevel
    const crateLid = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.14, 0.84),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.8 })
    );
    crateLid.position.y = 0.78;
    crateLid.castShadow = true;
    crateGroup.add(crateLid);

    // Yellow Hazard Warning Chevrons on Top
    const hazardStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.02, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    hazardStripe.position.set(0, 0.86, 0);
    crateGroup.add(hazardStripe);

    // Biometric Keypad LED Status Light
    const keypadLed = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.04),
      new THREE.MeshBasicMaterial({ color: hexColor })
    );
    keypadLed.position.set(0, 0.52, 0.42);
    crateGroup.add(keypadLed);

    // Reinforced Steel Corner Armor Brackets
    [-0.58, 0.58].forEach(cx => {
      [-0.38, 0.38].forEach(cz => {
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.65, 0.12),
          new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.2 })
        );
        bracket.position.set(cx, 0.4, cz);
        crateGroup.add(bracket);
      });
    });

    // Dual Heavy Clamping Latches
    [-0.35, 0.35].forEach(lx => {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.24, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
      );
      latch.position.set(lx, 0.65, 0.43);
      crateGroup.add(latch);
    });

    // Floating Holographic Rarity Emblem above the crate
    const holoHolo = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.MeshBasicMaterial({ color: hexColor, wireframe: true })
    );
    holoHolo.position.y = 1.35;
    crateGroup.add(holoHolo);

    group.add(crateGroup);
  } else if (item.type === 'weapon') {
    // Holographic Tactical Weapons Display
    const weaponPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.52, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.15 })
    );
    weaponPedestal.position.y = 0.1;
    group.add(weaponPedestal);

    // 3D Miniature High-Detail Firearm tailored to weapon ID
    const gun = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x181e29, metalness: 0.92, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });

    const wId = (item.weaponId || '').toLowerCase();

    if (wId === 'barrett' || wId === 'sniper') {
      // Long Anti-Materiel / Precision Sniper Rifle
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 1.25), gunMat);
      gun.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.1, 10), chromeMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.05, 1.05);
      gun.add(barrel);
      // Dual Scope
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10), gunMat);
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.18, 0.1);
      gun.add(scope);
      // Muzzle Brake
      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.16), chromeMat);
      brake.position.set(0, 0.05, 1.6);
      gun.add(brake);
    } else if (wId === 'shotgun' || wId === 'spas12') {
      // Tactical Combat Shotgun with Ribbed Barrel & Heat Shield
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 1.05), gunMat);
      gun.add(body);
      const twinBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.78, 10), chromeMat);
      twinBarrel.rotation.x = Math.PI / 2;
      twinBarrel.position.set(0, 0.06, 0.85);
      gun.add(twinBarrel);
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.32), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      pump.position.set(0, -0.04, 0.65);
      gun.add(pump);
    } else if (wId === 'vector' || wId === 'smg' || wId === 'p90') {
      // Compact Bullpup / High-Rate SMG with Silencer
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.26, 0.72), gunMat);
      gun.add(body);
      const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.48, 12), gunMat);
      silencer.rotation.x = Math.PI / 2;
      silencer.position.set(0, 0.04, 0.58);
      gun.add(silencer);
      const redDot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.15), new THREE.MeshBasicMaterial({ color: hexColor }));
      redDot.position.set(0, 0.19, 0.05);
      gun.add(redDot);
    } else if (wId === 'deagle' || wId === 'pistol') {
      // Heavy Magnum Hand Cannon Sidearm
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.48), chromeMat);
      gun.add(slide);
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.15), gunMat);
      grip.position.set(0, -0.16, -0.1);
      grip.rotation.x = 0.22;
      gun.add(grip);
    } else {
      // Tactical Assault Rifle (SCAR / Pulse AR)
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.95), gunMat);
      gun.add(body);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.68, 8), chromeMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.04, 0.75);
      gun.add(barrel);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.18), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      mag.position.set(0, -0.2, 0.12);
      mag.rotation.x = 0.2;
      gun.add(mag);
      const holo = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: hexColor }));
      holo.position.set(0, 0.16, 0.1);
      gun.add(holo);
    }

    // Glowing Holographic Aura Ring
    const holoRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.025, 8, 24),
      new THREE.MeshBasicMaterial({ color: hexColor })
    );
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.y = 0.55;
    group.add(holoRing);

    gun.position.y = 0.68;
    gun.rotation.y = Math.PI / 4;
    group.add(gun);
  } else if (item.type === 'armor') {
    // 3D Ballistic Plate Carrier Vest
    const vest = new THREE.Mesh(
      new THREE.BoxGeometry(0.64, 0.72, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    vest.position.y = 0.68;
    vest.castShadow = true;
    group.add(vest);

    // Ceramic Plate Insignia
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.44, 0.46),
      new THREE.MeshStandardMaterial({ color: hexColor, emissive: hexColor, emissiveIntensity: 0.4 })
    );
    plate.position.set(0, 0.68, 0.02);
    group.add(plate);
  } else if (item.type === 'helmet') {
    // 3D FAST Combat Ballistic Helmet
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
    );
    helmet.position.y = 0.58;
    helmet.castShadow = true;
    group.add(helmet);

    // Glowing Visor
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.16, 0.28),
      new THREE.MeshBasicMaterial({ color: hexColor })
    );
    visor.position.set(0, 0.56, 0.18);
    group.add(visor);
  } else if (item.type === 'heal') {
    // Tactical Medical Trauma Kit
    const medCase = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.48, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    medCase.position.y = 0.55;
    medCase.castShadow = true;
    group.add(medCase);

    // Red Cross Emblem
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.34), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross1.position.set(0, 0.55, 0.01);
    group.add(cross1);

    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.34), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    cross2.position.set(0, 0.55, 0.01);
    group.add(cross2);
  } else if (item.type === 'shield') {
    // Energy Shield Battery Cell
    const cell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.68, 14),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6, roughness: 0.2 })
    );
    cell.position.y = 0.55;
    cell.castShadow = true;
    group.add(cell);

    // Metal Caps
    [-0.34, 0.34].forEach(cy => {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.12, 14),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
      );
      cap.position.y = 0.55 + cy;
      group.add(cap);
    });
  } else {
    // Ammo or Default Military Ammo Crate
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.38, 0.42),
      new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.6 })
    );
    crate.position.y = 0.45;
    crate.castShadow = true;
    group.add(crate);
  }

  group.position.set(item.position[0], item.position[1], item.position[2]);
  return group;
}

// 4. Photorealistic Military Transport Aircraft (C-130 / Gunship Dropship)
export function buildRealisticCarrierAircraft(): THREE.Group {
  const dropship = new THREE.Group();
  const propellers: THREE.Mesh[] = [];

  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0x273444, // Military tactical air-force grey
    metalness: 0.75,
    roughness: 0.32
  });

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.35
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.25
  });

  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.85,
    roughness: 0.2
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.8,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.9
  });

  const thrusterGlowMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

  // 1. Aerodynamic Heavy Fuselage (Tubular main cargo hull with rounded nose)
  const mainHull = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 6.2, 54, 20),
    fuselageMat
  );
  mainHull.rotation.x = Math.PI / 2;
  mainHull.castShadow = true;
  dropship.add(mainHull);

  // Nose Radome Cone
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(5.8, 14, 20),
    fuselageMat
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, 34);
  nose.castShadow = true;
  dropship.add(nose);

  // 2. Multi-Pane Cockpit Flight Deck Canopy
  const cockpit = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 2.2, 7.5),
    glassMat
  );
  cockpit.position.set(0, 4.2, 24);
  cockpit.rotation.x = -0.22;
  dropship.add(cockpit);

  // 3. High-Mounted Massive Transport Wingspan
  const wings = new THREE.Mesh(
    new THREE.BoxGeometry(72, 0.95, 12),
    wingMat
  );
  wings.position.set(0, 5.2, 2);
  wings.castShadow = true;
  dropship.add(wings);

  // Wingtip Winglets
  [-36, 36].forEach((wx, i) => {
    const winglet = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 4.8), wingMat);
    winglet.position.set(wx, 7.0, 2);
    winglet.rotation.z = i === 0 ? 0.3 : -0.3;
    dropship.add(winglet);
  });

  // 4. Quad Turboprop Engines with Spinning Propeller Blades
  const enginePositions = [-26, -14, 14, 26];
  enginePositions.forEach(ex => {
    // Engine Nacelle Pod
    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.7, 1.9, 9.5, 14),
      engineMat
    );
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(ex, 4.2, 6);
    nacelle.castShadow = true;
    dropship.add(nacelle);

    // Propeller Spinner Hub
    const propHub = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 })
    );
    propHub.rotation.x = -Math.PI / 2;
    propHub.position.set(ex, 4.2, 11.2);
    dropship.add(propHub);

    // 4-Blade Spinning Propeller Assembly
    const propGroup = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.01, 0.01),
      bladeMat
    );
    propGroup.position.set(ex, 4.2, 11);

    // 4 Blades
    for (let b = 0; b < 4; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 5.2, 0.06),
        bladeMat
      );
      blade.rotation.z = (b * Math.PI) / 2;
      propGroup.add(blade);

      // Yellow Blade Tips
      const tip = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.6, 0.07),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      tip.position.y = 2.4;
      blade.add(tip);
    }
    dropship.add(propGroup);
    propellers.push(propGroup);

    // Exhaust Core behind nacelle
    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 2.2, 12),
      engineMat
    );
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(ex, 4.2, 0.5);
    dropship.add(exhaust);
  });

  // 5. Dual Jet Afterburner Assist Engines (Auxiliary Boosters)
  [-7.5, 7.5].forEach(jx => {
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.2, 11, 14),
      fuselageMat
    );
    jet.rotation.x = Math.PI / 2;
    jet.position.set(jx, -1.8, -4);
    jet.castShadow = true;
    dropship.add(jet);

    // Glowing Jet Plasma Cone
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 8.5, 12),
      thrusterGlowMat
    );
    flame.rotation.x = -Math.PI / 2;
    flame.position.set(jx, -1.8, -12);
    dropship.add(flame);
  });

  // 6. Huge T-Tail Vertical Stabilizer & Horizontal Tailplanes
  const verticalTail = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 14, 11),
    wingMat
  );
  verticalTail.position.set(0, 11.5, -21);
  verticalTail.rotation.x = -0.32;
  verticalTail.castShadow = true;
  dropship.add(verticalTail);

  const horizontalTail = new THREE.Mesh(
    new THREE.BoxGeometry(26, 0.7, 6.5),
    wingMat
  );
  horizontalTail.position.set(0, 17.5, -23);
  horizontalTail.castShadow = true;
  dropship.add(horizontalTail);

  // 7. Open Rear Cargo Deployment Ramp
  const ramp = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.35, 9.0),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 })
  );
  ramp.position.set(0, -2.4, -28);
  ramp.rotation.x = 0.38; // Sloped down ready for paradrop!
  dropship.add(ramp);

  // Interior Green "JUMP / GO" Jump Lights inside Cargo Hold
  [-2.8, 2.8].forEach(lx => {
    const jumpLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e }) // Glowing Green Ready Light
    );
    jumpLight.rotation.x = Math.PI / 2;
    jumpLight.position.set(lx, 1.2, -22);
    dropship.add(jumpLight);
  });

  // Navigation Wingtip Strobe Lights
  const portLight = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  portLight.position.set(-36.2, 5.2, 2);
  dropship.add(portLight);

  const starLight = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  starLight.position.set(36.2, 5.2, 2);
  dropship.add(starLight);

  // Store propellers on userData for dynamic animation in ThreeEngine
  dropship.userData.propellers = propellers;

  return dropship;
}
