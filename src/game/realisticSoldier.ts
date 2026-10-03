import * as THREE from 'three';
import { RealisticTextureFactory } from './realisticTextures';

export interface RealisticCharacterComponents {
  rootMesh: THREE.Group;
  spineGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponMesh: THREE.Group;
  healthBarGroup: THREE.Group;
  hpBarMesh: THREE.Mesh;
}

export interface CharacterVisualConfig {
  suitColor: string;
  visorColor: string;
  pattern: 'hex' | 'solid' | 'carbon' | 'tiger';
  skinTone: number;
  hasHelmet?: boolean;
  hasVisor?: boolean;
  isPlayer?: boolean;
  weaponType?: string;
}

export function buildRealisticSoldier(config: CharacterVisualConfig): RealisticCharacterComponents {
  const root = new THREE.Group();

  // Load realistic procedural textures
  const fabricTex = RealisticTextureFactory.createCombatFabricTexture(config.suitColor, config.pattern);
  const skinTex = RealisticTextureFactory.createSkinTexture(config.skinTone);
  const metalTex = RealisticTextureFactory.createGunmetalTexture();

  // High-Grade PBR Materials
  const uniformMat = new THREE.MeshStandardMaterial({
    map: fabricTex,
    roughness: 0.72,
    metalness: 0.12,
    bumpMap: fabricTex,
    bumpScale: 0.03
  });

  const armorVestMat = new THREE.MeshStandardMaterial({
    color: 0x18202c,
    roughness: 0.45,
    metalness: 0.55,
    bumpMap: metalTex,
    bumpScale: 0.02
  });

  const skinMat = new THREE.MeshStandardMaterial({
    map: skinTex,
    roughness: 0.58,
    metalness: 0.04
  });

  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x222a36,
    roughness: 0.38,
    metalness: 0.62
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.visorColor),
    emissive: new THREE.Color(config.visorColor),
    emissiveIntensity: 0.45,
    roughness: 0.1,
    metalness: 0.85,
    transmission: 0.3,
    transparent: true,
    opacity: 0.95
  });

  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.2
  });

  const weaponMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.28,
    metalness: 0.88,
    bumpMap: metalTex,
    bumpScale: 0.04
  });

  // 1. PELVIS & COMBAT BELT (Center of mass at Y = 1.05)
  const pelvisGroup = new THREE.Group();
  pelvisGroup.position.set(0, 1.05, 0);
  root.add(pelvisGroup);

  const beltGeom = new THREE.BoxGeometry(0.74, 0.22, 0.46);
  const belt = new THREE.Mesh(beltGeom, armorVestMat);
  belt.castShadow = true;
  pelvisGroup.add(belt);

  // Tactical Buckle
  const buckleGeom = new THREE.BoxGeometry(0.18, 0.16, 0.49);
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const buckle = new THREE.Mesh(buckleGeom, buckleMat);
  pelvisGroup.add(buckle);

  // Side Pistol Holster on right hip
  const holster = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.22), bootMat);
  holster.position.set(0.42, -0.1, 0.02);
  pelvisGroup.add(holster);

  // Holstered Handgun Grip
  const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.12), weaponMat);
  pistolGrip.position.set(0.44, 0.1, -0.02);
  pistolGrip.rotation.z = -0.15;
  pelvisGroup.add(pistolGrip);

  // 2. SPINE & TORSO (Plate Carrier & Chest)
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, 0.1, 0);
  pelvisGroup.add(spineGroup);

  // Undershirt anatomical torso
  const torsoGeom = new THREE.CylinderGeometry(0.36, 0.32, 0.72, 12);
  const torso = new THREE.Mesh(torsoGeom, uniformMat);
  torso.position.y = 0.36;
  torso.castShadow = true;
  spineGroup.add(torso);

  // Ballistic Ceramic Chest Plate Carrier
  const chestPlateGeom = new THREE.BoxGeometry(0.72, 0.58, 0.48);
  const chestPlate = new THREE.Mesh(chestPlateGeom, armorVestMat);
  chestPlate.position.set(0, 0.42, 0.03);
  chestPlate.castShadow = true;
  spineGroup.add(chestPlate);

  // MOLLE Tactical Webbing Strips on Plate Carrier
  for (let r = 0; r < 3; r++) {
    const molle = new THREE.Mesh(
      new THREE.BoxGeometry(0.66, 0.04, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    molle.position.set(0, 0.28 + r * 0.11, 0.28);
    spineGroup.add(molle);
  }

  // Triple 5.56 Rifle Magazine Pouches on Chest
  for (let m = -1; m <= 1; m++) {
    const magPouch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.12), armorVestMat);
    magPouch.position.set(m * 0.18, 0.34, 0.31);
    magPouch.castShadow = true;
    spineGroup.add(magPouch);
  }

  // Shoulder Epaulets / Straps
  [-0.32, 0.32].forEach(sx => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.36), armorVestMat);
    pad.position.set(sx, 0.68, 0);
    spineGroup.add(pad);
  });

  // Tactical Backpack / Hydration Carrier on Back
  const backpackGeom = new THREE.BoxGeometry(0.52, 0.62, 0.28);
  const backpack = new THREE.Mesh(backpackGeom, armorVestMat);
  backpack.position.set(0, 0.42, -0.32);
  backpack.castShadow = true;
  spineGroup.add(backpack);

  // Comms Radio with Antenna on left shoulder
  const radio = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.14), weaponMat);
  radio.position.set(-0.32, 0.72, -0.16);
  spineGroup.add(radio);

  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.42, 6),
    new THREE.MeshBasicMaterial({ color: 0x111827 })
  );
  antenna.position.set(-0.32, 0.94, -0.16);
  spineGroup.add(antenna);

  // 3. NECK & HEAD
  const neckGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.22, 10);
  const neck = new THREE.Mesh(neckGeom, skinMat);
  neck.position.set(0, 0.76, 0);
  spineGroup.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.94, 0);
  spineGroup.add(headGroup);

  // Anatomical Head (Cranium & Jaw)
  const headGeom = new THREE.BoxGeometry(0.42, 0.46, 0.44);
  const head = new THREE.Mesh(headGeom, skinMat);
  head.position.set(0, 0.08, 0);
  head.castShadow = true;
  headGroup.add(head);

  // Ears
  [-0.22, 0.22].forEach(ex => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.08), skinMat);
    ear.position.set(ex, 0.08, -0.02);
    headGroup.add(ear);
  });

  // FAST Ballistic Combat Helmet
  const helmetGeom = new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const helmet = new THREE.Mesh(helmetGeom, helmetMat);
  helmet.position.set(0, 0.16, -0.02);
  helmet.scale.set(1.02, 1.05, 1.08);
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Helmet NVG Mount Shroud on forehead
  const nvgShroud = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), weaponMat);
  nvgShroud.position.set(0, 0.28, 0.26);
  headGroup.add(nvgShroud);

  // Comms Headset Earpieces & Boom Mic
  [-0.25, 0.25].forEach((hx, i) => {
    const earpiece = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), helmetMat);
    earpiece.rotation.z = Math.PI / 2;
    earpiece.position.set(hx, 0.12, -0.02);
    headGroup.add(earpiece);

    if (i === 0) {
      // Mic boom on left ear
      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 6), weaponMat);
      mic.rotation.x = Math.PI / 3;
      mic.position.set(-0.25, 0.04, 0.12);
      headGroup.add(mic);
    }
  });

  // Tactical Polarized Visor with Metallic Bezel
  const visorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.32), helmetMat);
  visorFrame.position.set(0, 0.12, 0.14);
  headGroup.add(visorFrame);

  const visorLens = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.33), visorMat);
  visorLens.position.set(0, 0.12, 0.15);
  headGroup.add(visorLens);

  // 4. LEGS & COMBAT BOOTS
  const createLeg = (isLeft: boolean): THREE.Group => {
    const leg = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    leg.position.set(sign * 0.22, 0, 0);

    // Thigh with Camo Cargo Pants
    const thighGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.48, 10);
    const thigh = new THREE.Mesh(thighGeom, uniformMat);
    thigh.position.y = -0.24;
    thigh.castShadow = true;
    leg.add(thigh);

    // Thigh Pocket
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.18), uniformMat);
    pocket.position.set(sign * 0.17, -0.24, 0);
    leg.add(pocket);

    // Tactical Knee Pad
    const kneePad = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.14), armorVestMat);
    kneePad.position.set(0, -0.48, 0.11);
    kneePad.castShadow = true;
    leg.add(kneePad);

    // Shin / Calf
    const shinGeom = new THREE.CylinderGeometry(0.15, 0.13, 0.42, 10);
    const shin = new THREE.Mesh(shinGeom, uniformMat);
    shin.position.y = -0.68;
    shin.castShadow = true;
    leg.add(shin);

    // Rugged Combat Boot with Lugged Sole
    const bootUpper = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.38), bootMat);
    bootUpper.position.set(0, -0.88, 0.04);
    bootUpper.castShadow = true;
    leg.add(bootUpper);

    // Sole & Toe Tread
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.08, 0.44),
      new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.95 })
    );
    sole.position.set(0, -1.02, 0.07);
    sole.castShadow = true;
    leg.add(sole);

    return leg;
  };

  const leftLeg = createLeg(true);
  const rightLeg = createLeg(false);
  pelvisGroup.add(leftLeg);
  pelvisGroup.add(rightLeg);

  // 5. WEAPON (Modular Tactical Assault Rifle)
  const weaponGroup = new THREE.Group();

  // Receiver & Upper Rail
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.68), weaponMat);
  receiver.position.set(0, 0, 0);
  receiver.castShadow = true;
  weaponGroup.add(receiver);

  // Fluted Steel Barrel & Birdcage Flash Hider
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.52, 8), weaponMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, 0.58);
  barrel.castShadow = true;
  weaponGroup.add(barrel);

  const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8), weaponMat);
  muzzleBrake.rotation.x = Math.PI / 2;
  muzzleBrake.position.set(0, 0.02, 0.88);
  weaponGroup.add(muzzleBrake);

  // Picatinny Handguard with M-LOK slots
  const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.42), weaponMat);
  handguard.position.set(0, 0, 0.42);
  weaponGroup.add(handguard);

  // Angled Tactical Foregrip
  const foregrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.12), weaponMat);
  foregrip.position.set(0, -0.12, 0.48);
  foregrip.rotation.x = -0.25;
  weaponGroup.add(foregrip);

  // Curved 30-Round Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.18), weaponMat);
  mag.position.set(0, -0.22, 0.08);
  mag.rotation.x = 0.22;
  mag.castShadow = true;
  weaponGroup.add(mag);

  // Holographic Combat Optic Sight with Glass Lens
  const opticHousing = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.24), weaponMat);
  opticHousing.position.set(0, 0.16, 0.05);
  weaponGroup.add(opticHousing);

  const opticLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.09, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  opticLens.position.set(0, 0.16, 0.17);
  weaponGroup.add(opticLens);

  // Ergonomic Pistol Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.12), weaponMat);
  grip.position.set(0, -0.16, -0.18);
  grip.rotation.x = -0.35;
  weaponGroup.add(grip);

  // Telescopic Crane Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.34), weaponMat);
  stock.position.set(0, 0.02, -0.42);
  weaponGroup.add(stock);

  // Scale and position weapon in front of character
  weaponGroup.scale.set(0.9, 0.9, 0.9);

  // 6. ARMS & COMBAT GLOVES
  // Right Arm (Trigger Arm)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.44, 0.62, 0.04);

  const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.38, 8), uniformMat);
  rBicep.position.set(0, -0.18, 0);
  rightArm.add(rBicep);

  const rElbow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), armorVestMat);
  rElbow.position.set(0, -0.36, -0.04);
  rightArm.add(rElbow);

  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.36, 8), uniformMat);
  rForearm.position.set(0, -0.52, 0.08);
  rForearm.rotation.x = 0.55;
  rightArm.add(rForearm);

  const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.18), bootMat);
  rGlove.position.set(0, -0.66, 0.22);
  rightArm.add(rGlove);

  // Attach weapon into hands
  rightArm.add(weaponGroup);
  weaponGroup.position.set(0, -0.62, 0.36);
  weaponGroup.rotation.set(-0.25, 0, 0);

  spineGroup.add(rightArm);

  // Left Arm (Foregrip Support Arm)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.44, 0.62, 0.04);

  const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.38, 8), uniformMat);
  lBicep.position.set(0, -0.18, 0);
  leftArm.add(lBicep);

  const lElbow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), armorVestMat);
  lElbow.position.set(0, -0.36, -0.04);
  leftArm.add(lElbow);

  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.38, 8), uniformMat);
  lForearm.position.set(0.18, -0.48, 0.22);
  lForearm.rotation.set(0.75, -0.35, -0.4);
  leftArm.add(lForearm);

  const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.18), bootMat);
  lGlove.position.set(0.32, -0.58, 0.36);
  leftArm.add(lGlove);

  spineGroup.add(leftArm);

  // 7. CLEAN NEON GREEN BILLBOARD HEALTH BAR DIRECTLY AT THE TOP OF THE HEAD
  const healthBarGroup = new THREE.Group();
  healthBarGroup.position.set(0, 2.52, 0);

  // Dark backing plate
  const bgGeom = new THREE.PlaneGeometry(1.18, 0.12);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x050811, side: THREE.DoubleSide });
  const bg = new THREE.Mesh(bgGeom, bgMat);
  healthBarGroup.add(bg);

  // Under-layer red damage track
  const redGeom = new THREE.PlaneGeometry(1.14, 0.08);
  const redMat = new THREE.MeshBasicMaterial({ color: 0x991b1b, side: THREE.DoubleSide });
  const redBar = new THREE.Mesh(redGeom, redMat);
  redBar.position.z = 0.005;
  healthBarGroup.add(redBar);

  // Clean neon green health fill
  const hpGeom = new THREE.PlaneGeometry(1.14, 0.08);
  const hpMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide });
  const hpBarMesh = new THREE.Mesh(hpGeom, hpMat);
  hpBarMesh.position.z = 0.01;
  healthBarGroup.add(hpBarMesh);

  root.add(healthBarGroup);

  return {
    rootMesh: root,
    spineGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponMesh: weaponGroup,
    healthBarGroup,
    hpBarMesh
  };
}
