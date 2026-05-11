// GitHire v5 · Three stage. Owns the renderer, camera, scene tree, post-FX
// composer, and a per-section activation tracker so scenes can fade in/out.

import * as THREE from 'three';
import { EffectComposer }    from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }        from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }   from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }        from 'three/addons/postprocessing/ShaderPass.js';

// Brand palette — keep in sync with githire.css.
export const PAL = {
  paper:  new THREE.Color('#F6F1E8'),
  paper2: new THREE.Color('#EFE9DC'),
  ink:    new THREE.Color('#181818'),
  inkS:   new THREE.Color('#4A4A48'),
  accent: new THREE.Color('#D97757'),
  navy:   new THREE.Color('#1C2348'),
  lilac:  new THREE.Color('#B7B1D9'),
};

// ── A tiny film-grain pass (paper texture feel) ────────────────
const GrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime:    { value: 0 },
    uAmount:  { value: 0.07 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAmount;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec4 col = texture2D(tDiffuse, vUv);
      float n = hash(vUv * vec2(1920.0, 1080.0) + uTime * 23.7);
      col.rgb += (n - 0.5) * uAmount;
      gl_FragColor = col;
    }
  `,
};

export class Stage {
  constructor(canvas){
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    // Clamp DPR — bloom + grain at native DPR is the main cost.
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setClearColor(PAL.paper, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene  = new THREE.Scene();
    this.scene.background = PAL.paper;

    this.camera = new THREE.PerspectiveCamera(38, 16/9, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    // World root — every scene appends here.
    this.world = new THREE.Group();
    this.scene.add(this.world);

    // ── Composer ────────────────────────────────────────────
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      0.42,   // strength — keep the scanner warm without washing out paper
      0.52,   // radius
      0.92,   // threshold — prevent the light paper background from blooming
    );
    this.composer.addPass(this.bloom);

    this.grain = new ShaderPass(GrainShader);
    this.grain.uniforms.uAmount.value = 0.05;
    this.composer.addPass(this.grain);
    // No FXAA — composer is already a downsample chain; bloom hides aliasing.

    this.scenes = []; // [{ name, el, scene, activation, progress }]
    this.clock  = new THREE.Clock();
    this.mouse  = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    this._onResize();
    window.addEventListener('resize', () => this._onResize(), { passive: true });
    window.addEventListener('pointermove', (e) => {
      this.mouse.tx = e.clientX / window.innerWidth;
      this.mouse.ty = e.clientY / window.innerHeight;
    }, { passive: true });

    // Pause when canvas is off-screen (covered by Lenis at top? no — full-page bg)
    // so we instead pause when the tab is hidden.
    document.addEventListener('visibilitychange', () => {
      this._paused = document.hidden;
    });
  }

  register(name, el, scene){
    if (scene && scene.mount) scene.mount(this);
    this.scenes.push({ name, el, scene, activation: 0, progress: 0 });
  }

  start(){
    this._paused = false;
    this.renderer.setAnimationLoop((t) => this._frame(t));
  }

  _onResize(){
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.W = W; this.H = H;
    this.renderer.setSize(W, H, false);
    this.composer.setSize(W, H);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.scenes.forEach((s) => s.scene && s.scene.onResize && s.scene.onResize(W, H));
  }

  _updateActivations(){
    const vh = window.innerHeight || 1;
    this.scenes.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      const total = Math.max(1, r.height - vh);
      s.progress   = Math.min(1, Math.max(0, -r.top / total));
      const visTop = Math.max(0, -r.top);
      const visBot = Math.min(r.height, vh - r.top);
      const vis    = Math.max(0, visBot - visTop);
      s.activation = Math.min(1, vis / vh);
    });
  }

  _frame(time){
    if (this._paused) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    const t  = this.clock.elapsedTime;

    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.08;

    this._updateActivations();

    // Intro acts as a persistent background: render with min activation 0.65
    // so dust motes never disappear while scrolling later sections.
    const intro = this.scenes.find((s) => s.name === 'intro');
    const introAct = intro ? Math.max(intro.activation, 0.65) : 0;
    const introProg = intro ? (intro.activation > 0.01 ? intro.progress : 1) : 0;

    this.scenes.forEach((s) => {
      if (!s.scene) return;
      const act  = s.name === 'intro' ? introAct  : s.activation;
      const prog = s.name === 'intro' ? introProg : s.progress;
      s.scene.update({
        time: t, dt,
        mouseX: this.mouse.x, mouseY: this.mouse.y,
        progress: prog,
        activation: act,
        W: this.W, H: this.H,
        camera: this.camera,
      });
    });

    this.grain.uniforms.uTime.value = t;
    this.composer.render();
  }
}
