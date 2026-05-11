// GitHire v5 · Intro scene — bolder, fewer-but-louder elements.
//
// Layers (back → front):
//   1. Barcode wall  — InstancedMesh of vertical bars (fewer + thicker)
//   2. Dust motes    — sparse Points field
//   3. Scanner beam  — wide glowing column sweeping across the wall
//   4. Accent glow   — small pulse near hero title

import * as THREE from 'three';
import { PAL } from '../stage.js';

const NUM_BARS  = 64;
const NUM_MOTES = 120;

export class IntroScene {
  constructor(){
    this.group = new THREE.Group();
    this.group.name = 'IntroScene';
  }

  mount(stage){
    this.stage = stage;
    stage.world.add(this.group);

    this._buildBarcodeWall();
    this._buildPaperBarcode();
    this._buildDustMotes();
    this._buildScanner();
    this._buildAccent();
  }

  // ── Barcode wall ────────────────────────────────────────────
  _buildBarcodeWall(){
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uInk:     { value: PAL.ink.clone() },
        uAccent:  { value: PAL.accent.clone() },
        uScanX:   { value: -10.0 },
        uScanW:   { value: 0.9 },
        uTime:    { value: 0 },
      },
      vertexShader: /* glsl */`
        attribute float aWorldX;
        attribute float aSeed;
        uniform float uTime;
        varying float vWorldX;
        varying float vSeed;
        varying vec2 vUv;
        void main(){
          vWorldX = aWorldX;
          vSeed = aSeed;
          vUv = uv;
          vec3 p = position;
          // tiny vertical sway, different per bar
          float sway = sin(uTime * 0.6 + aSeed * 6.28) * 0.06;
          vec4 wp = instanceMatrix * vec4(p, 1.0);
          wp.y += sway;
          gl_Position = projectionMatrix * modelViewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform vec3  uInk;
        uniform vec3  uAccent;
        uniform float uScanX;
        uniform float uScanW;
        varying float vWorldX;
        varying float vSeed;
        varying vec2 vUv;
        void main(){
          float d = abs(vWorldX - uScanX) / uScanW;
          float glow = exp(-d * d * 1.6);
          vec3  col  = mix(uInk, uAccent, glow);
          // verticals fall off softly at top & bottom
          float fade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
          float baseA = 0.10 + vSeed * 0.10;
          float alpha = mix(baseA, 0.44, glow) * fade;
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const mesh = new THREE.InstancedMesh(geo, mat, NUM_BARS);
    mesh.frustumCulled = false;

    const xs    = new Float32Array(NUM_BARS);
    const seeds = new Float32Array(NUM_BARS);
    const dummy = new THREE.Object3D();
    const wallW = 28;
    const wallZ = -7.5;

    let rand = mulberry32(20260512);
    for (let i = 0; i < NUM_BARS; i++){
      const t = i / (NUM_BARS - 1);
      const x = (t - 0.5) * wallW + (rand() - 0.5) * 0.18;
      const base = 1.4 + rand() * 3.0;
      const loud = (rand() > 0.78) ? 1.6 : 1.0;
      const h = base * loud;
      const w = 0.14 + rand() * 0.18;
      const y = h * 0.5 - 2.4;
      dummy.position.set(x, y, wallZ + (rand() - 0.5) * 0.6);
      dummy.scale.set(w, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      xs[i] = x;
      seeds[i] = rand();
    }
    geo.setAttribute('aWorldX', new THREE.InstancedBufferAttribute(xs, 1));
    geo.setAttribute('aSeed',   new THREE.InstancedBufferAttribute(seeds, 1));
    mesh.instanceMatrix.needsUpdate = true;

    this.wall = mesh;
    this.wallMat = mat;
    this.group.add(mesh);
  }

  // ── Always-visible barcode layer ────────────────────────────
  _buildPaperBarcode(){
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: PAL.ink,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, 42);
    mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const rand = mulberry32(20260513);
    for (let i = 0; i < 42; i++){
      const x = -8.2 + i * 0.4 + (rand() - 0.5) * 0.08;
      const h = 2.2 + rand() * 4.6;
      const w = 0.035 + rand() * 0.09;
      dummy.position.set(x, -0.35 + (rand() - 0.5) * 0.6, -3.6 - rand() * 0.8);
      dummy.scale.set(w, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const scanGeo = new THREE.PlaneGeometry(0.16, 8.6);
    const scanMat = new THREE.MeshBasicMaterial({
      color: PAL.accent,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const scan = new THREE.Mesh(scanGeo, scanMat);
    scan.position.set(-4.8, -0.1, -3.2);

    this.paperBars = mesh;
    this.paperBarsMat = mat;
    this.paperScan = scan;
    this.paperScanMat = scanMat;
    this.group.add(mesh, scan);
  }

  // ── Dust motes — sparse but bold ────────────────────────────
  _buildDustMotes(){
    const positions = new Float32Array(NUM_MOTES * 3);
    const seeds     = new Float32Array(NUM_MOTES);
    const sizes     = new Float32Array(NUM_MOTES);
    let r = mulberry32(11);
    for (let i = 0; i < NUM_MOTES; i++){
      positions[i*3+0] = (r() - 0.5) * 26;
      positions[i*3+1] = (r() - 0.5) * 16;
      positions[i*3+2] = (r() - 0.5) * 14 - 2;
      seeds[i] = r() * 6.28;
      sizes[i] = 0.16 + r() * 0.48;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 1));
    g.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime:    { value: 0 },
        uPxRatio: { value: this._dpr() },
        uInk:     { value: PAL.ink.clone() },
        uAccent:  { value: PAL.accent.clone() },
      },
      vertexShader: /* glsl */`
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uPxRatio;
        varying float vSeed;
        void main(){
          vSeed = aSeed;
          vec3 p = position;
          float t = uTime * 0.35 + aSeed;
          p.x += sin(t)       * 0.30;
          p.y += cos(t * 0.7) * 0.25;
          p.z += sin(t * 0.5) * 0.20;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * uPxRatio * (180.0 / -mv.z);
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform vec3 uInk;
        uniform vec3 uAccent;
        varying float vSeed;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.05, d);
          float warm = step(0.88, fract(vSeed * 31.7));
          vec3 col = mix(uInk, uAccent, warm);
          gl_FragColor = vec4(col, a * mix(0.16, 0.28, warm));
        }
      `,
    });

    const points = new THREE.Points(g, m);
    points.frustumCulled = false;
    this.motes = points;
    this.motesMat = m;
    this.group.add(points);
  }

  // ── Scanner beam (wide hot column) ──────────────────────────
  _buildScanner(){
    const g = new THREE.PlaneGeometry(0.9, 8.0);
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uAccent: { value: PAL.accent.clone() },
        uTime:   { value: 0 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uAccent;
        uniform float uTime;
        varying vec2 vUv;
        void main(){
          float dx   = abs(vUv.x - 0.5) * 2.0;
          float core = exp(-dx * dx * 8.0);
          float edge = exp(-dx * dx * 1.4) * 0.35;
          float pulse = 0.85 + 0.15 * sin(uTime * 2.3);
          float vert = smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
          float intensity = (core * 1.2 + edge) * vert * pulse;
          gl_FragColor = vec4(uAccent * 1.6, intensity);
        }
      `,
    });
    const m1 = new THREE.Mesh(g, m);
    m1.position.set(0, -0.4, -6.2);
    this.scanner = m1;
    this.scannerMat = m;
    this.group.add(m1);
  }

  _buildAccent(){
    const g = new THREE.SphereGeometry(0.035, 12, 12);
    const m = new THREE.MeshBasicMaterial({
      color: PAL.accent,
      transparent: true,
      opacity: 0.42,
    });
    const s = new THREE.Mesh(g, m);
    s.position.set(2.85, -1.15, -2.6);
    this.accent = s;
    this.group.add(s);
  }

  // ── Per-frame update ────────────────────────────────────────
  update({ time, mouseX, mouseY, progress, activation, camera }){
    if (!this.group) return;
    this.group.visible = activation > 0.01;

    // Camera parallax + dolly with scroll.
    const targetZ = 5.0 - progress * 1.4;
    camera.position.x += ((mouseX - 0.5) * 0.6  - camera.position.x) * 0.04;
    camera.position.y += ((0.5 - mouseY) * 0.35 - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    camera.lookAt(0, 0, -3);

    // Scanner sweep — slightly slower, wider arc
    const period = 7.5;
    const phase  = ((time % period) / period);
    const eased  = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
    const scanX  = (eased - 0.5) * 26;
    this.wallMat.uniforms.uScanX.value = scanX;
    this.wallMat.uniforms.uTime.value  = time;
    this.scanner.position.x = scanX;
    this.scannerMat.uniforms.uTime.value = time;

    if (this.paperScan) {
      this.paperScan.position.x = (eased - 0.5) * 10;
      this.paperScanMat.opacity = 0.045 + 0.045 * Math.sin(time * 2.3) * Math.sin(time * 2.3);
      this.paperBars.rotation.z = Math.sin(time * 0.12) * 0.015;
    }

    this.motesMat.uniforms.uTime.value    = time;
    this.motesMat.uniforms.uPxRatio.value = this._dpr();

    if (this.accent) {
      const s = 1 + Math.sin(time * 1.8) * 0.18;
      this.accent.scale.setScalar(s);
      this.accent.material.opacity = 0.5 + 0.3 * Math.sin(time * 1.8);
    }
  }

  onResize(){ /* nothing per-frame depends on size beyond uniforms */ }

  _dpr(){ return Math.min(window.devicePixelRatio || 1, 1.5); }
}

function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
