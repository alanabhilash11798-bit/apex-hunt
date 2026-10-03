import * as THREE from 'three';

// Procedural Canvas Texture Generator for Photorealistic 3D Graphics
export class RealisticTextureFactory {
  private static cache: Map<string, THREE.Texture> = new Map();

  // 1. Procedural Realistic Terrain Texture (Grass, Soil & Stone blend)
  public static createTerrainTexture(): THREE.CanvasTexture {
    const key = 'terrain_diffuse';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base rich meadow grass gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#2e7d32');
    grad.addColorStop(0.5, '#388e3c');
    grad.addColorStop(1, '#1b5e20');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Multi-frequency noise for grass blades, earth patches, and pebbles
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n1 = Math.sin(x * 0.08) * Math.cos(y * 0.08);
        const n2 = Math.sin(x * 0.25 + y * 0.15) * Math.cos(x * 0.1 - y * 0.2);
        const noise = (Math.random() - 0.5) * 26 + n1 * 20 + n2 * 14;

        data[idx] = Math.max(20, Math.min(90, data[idx] + noise * 0.6));       // R
        data[idx + 1] = Math.max(50, Math.min(160, data[idx + 1] + noise));    // G
        data[idx + 2] = Math.max(15, Math.min(70, data[idx + 2] + noise * 0.4)); // B
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Fine detail blades of grass & soil flecks
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 2800; i++) {
      const gx = Math.random() * size;
      const gy = Math.random() * size;
      const angle = (Math.random() - 0.5) * 0.8 - Math.PI / 2;
      const len = 4 + Math.random() * 8;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + Math.cos(angle) * len, gy + Math.sin(angle) * len);
      ctx.stroke();
    }

    // Occasional subtle earth dirt patches
    ctx.fillStyle = 'rgba(101, 67, 33, 0.22)';
    for (let i = 0; i < 40; i++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      const pr = 12 + Math.random() * 28;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    this.cache.set(key, tex);
    return tex;
  }

  // 2. Realistic Normal Map for Micro-Foliage / Soil Roughness
  public static createTerrainNormalMap(): THREE.CanvasTexture {
    const key = 'terrain_normal';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let i = 0; i < size * size * 4; i += 4) {
      // Normal vector mapped: R = X (128 + nx), G = Y (128 + ny), B = Z (255 approx)
      const nx = (Math.random() - 0.5) * 50;
      const ny = (Math.random() - 0.5) * 50;
      data[i] = Math.max(0, Math.min(255, 128 + nx));
      data[i + 1] = Math.max(0, Math.min(255, 128 + ny));
      data[i + 2] = 250;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24);
    this.cache.set(key, tex);
    return tex;
  }

  // 3. Realistic Military Camouflage & Ripstop Tactical Fabric Texture
  public static createCombatFabricTexture(baseColorHex: string, pattern: 'hex' | 'solid' | 'carbon' | 'tiger'): THREE.CanvasTexture {
    const key = `combat_fabric_${baseColorHex}_${pattern}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base tone
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, size, size);

    if (pattern === 'hex') {
      // Tactical Hexagonal Grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      const hexR = 18;
      const h = hexR * Math.sqrt(3);
      for (let y = 0; y < size + h; y += h) {
        for (let x = 0; x < size + hexR * 3; x += hexR * 3) {
          const drawHex = (cx: number, cy: number) => {
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = (a * Math.PI) / 3;
              const hx = cx + hexR * Math.cos(angle);
              const hy = cy + hexR * Math.sin(angle);
              if (a === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
            if (Math.random() > 0.6) {
              ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.09)';
              ctx.fill();
            }
          };
          drawHex(x, y);
          drawHex(x + hexR * 1.5, y + h / 2);
        }
      }
    } else if (pattern === 'carbon') {
      // Carbon Fiber Weave Pattern
      const cw = 8;
      for (let y = 0; y < size; y += cw) {
        for (let x = 0; x < size; x += cw) {
          const isEven = ((x / cw) + (y / cw)) % 2 === 0;
          ctx.fillStyle = isEven ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(x, y, cw, cw);
        }
      }
    } else if (pattern === 'tiger') {
      // Tactical Brush Strokes
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      for (let i = 0; i < 28; i++) {
        const tx = Math.random() * size;
        const ty = Math.random() * size;
        ctx.beginPath();
        ctx.ellipse(tx, ty, 40 + Math.random() * 50, 10 + Math.random() * 14, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Micro Ripstop Fabric Grid overlay
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 0.8;
    for (let p = 0; p < size; p += 6) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    this.cache.set(key, tex);
    return tex;
  }

  // 4. Photorealistic Gunmetal Finish with Brushed Directional Scratches
  public static createGunmetalTexture(): THREE.CanvasTexture {
    const key = 'gunmetal_brushed';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Dark titanium / gunmetal base
    ctx.fillStyle = '#1e2530';
    ctx.fillRect(0, 0, size, size);

    // Directional brushed metal streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1200; i++) {
      const y = Math.random() * size;
      const x1 = Math.random() * size;
      const len = 30 + Math.random() * 120;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x1 + len, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 800; i++) {
      const y = Math.random() * size;
      const x1 = Math.random() * size;
      const len = 20 + Math.random() * 80;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x1 + len, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, tex);
    return tex;
  }

  // 5. Realistic Human Skin Texture with Subsurface Pores
  public static createSkinTexture(baseSkinTone: number): THREE.CanvasTexture {
    const key = `skin_${baseSkinTone}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const col = new THREE.Color(baseSkinTone);
    ctx.fillStyle = `#${col.getHexString()}`;
    ctx.fillRect(0, 0, size, size);

    // Subtle skin micro-detail & warmth gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 220, 200, 0.15)');
    grad.addColorStop(1, 'rgba(180, 80, 60, 0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Micro pores
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < size * size * 4; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.8));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set(key, tex);
    return tex;
  }

  // 6. Dynamic Water Surface Waves Normal Map
  public static createOceanNormalMap(): THREE.CanvasTexture {
    const key = 'ocean_normal';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const wave1 = Math.sin(x * 0.06 + y * 0.04) * 0.6;
        const wave2 = Math.cos(x * 0.08 - y * 0.06) * 0.4;
        const wave3 = Math.sin(x * 0.15 + y * 0.12) * 0.2;
        const waveSum = wave1 + wave2 + wave3;

        const nx = Math.cos(waveSum * Math.PI) * 45;
        const ny = Math.sin(waveSum * Math.PI) * 45;

        data[idx] = Math.max(0, Math.min(255, 128 + nx));
        data[idx + 1] = Math.max(0, Math.min(255, 128 + ny));
        data[idx + 2] = 245;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 18);
    this.cache.set(key, tex);
    return tex;
  }

  // 7. Atmospheric Light-Blue Sky Zenith & Horizon Gradient
  public static createSkyDomeTexture(): THREE.CanvasTexture {
    const key = 'skydome_gradient';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Luminous atmospheric light-blue scattering gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0.0, '#38bdf8'); // Clear radiant light blue zenith
    grad.addColorStop(0.25, '#7dd3fc'); // Luminous sky blue
    grad.addColorStop(0.55, '#bae6fd'); // Crisp light cyan blue
    grad.addColorStop(0.80, '#e0f2fe'); // Soft atmospheric blue haze
    grad.addColorStop(0.94, '#fef3c7'); // Soft sunlit horizon warmth
    grad.addColorStop(1.0, '#fef9c3'); // Distant sunlit marine glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, size);

    const tex = new THREE.CanvasTexture(canvas);
    this.cache.set(key, tex);
    return tex;
  }
}
