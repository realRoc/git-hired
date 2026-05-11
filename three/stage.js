// GitHire v5 · Three stage. Owns the renderer, camera, scene tree,
// and a lightweight per-section activation tracker.

import * as THREE from 'three';

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

export class Stage {
  constructor(canvas){
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    });
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    this.dprCap = isCoarsePointer ? 1 : 1.25;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.dprCap));
    this.renderer.setClearColor(PAL.paper, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene  = new THREE.Scene();
    this.scene.background = PAL.paper;

    this.camera = new THREE.PerspectiveCamera(38, 16/9, 0.1, 100);
    this.camera.position.set(0, 0, 5);

    // World root — every scene appends here.
    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.scenes = []; // [{ name, el, scene, activation, progress }]
    this.clock  = new THREE.Clock();
    this.mouse  = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    this._scrollDirty = true;
    this._needsRender = true;
    this._hasAnimatedScene = true;
    this._lastRenderMs = 0;

    this._onResize();
    window.addEventListener('resize', () => this._onResize(), { passive: true });
    window.addEventListener('scroll', () => {
      this._scrollDirty = true;
      this._needsRender = true;
    }, { passive: true });
    window.addEventListener('pointermove', (e) => {
      this.mouse.tx = e.clientX / window.innerWidth;
      this.mouse.ty = e.clientY / window.innerHeight;
      this._needsRender = true;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      this._paused = document.hidden;
      if (!this._paused) this._needsRender = true;
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.dprCap));
    this.renderer.setSize(W, H, false);
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.scenes.forEach((s) => s.scene && s.scene.onResize && s.scene.onResize(W, H));
    this._scrollDirty = true;
    this._needsRender = true;
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
    const now = typeof time === 'number' ? time : performance.now();
    const shouldAnimate = this._hasAnimatedScene;
    const minFrameMs = shouldAnimate ? 1000 / 30 : 1000 / 12;
    if (!this._scrollDirty && !this._needsRender && !shouldAnimate) return;
    if (now - this._lastRenderMs < minFrameMs) return;
    this._lastRenderMs = now;

    const dt = Math.min(0.05, this.clock.getDelta());
    const t  = this.clock.elapsedTime;

    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.08;

    if (this._scrollDirty) {
      this._updateActivations();
      this._scrollDirty = false;
    }

    let hasAnimatedScene = false;
    this.scenes.forEach((s) => {
      if (!s.scene) return;
      const act = s.activation;
      const prog = s.progress;
      if (act > 0.01) hasAnimatedScene = true;
      s.scene.update({
        time: t, dt,
        mouseX: this.mouse.x, mouseY: this.mouse.y,
        progress: prog,
        activation: act,
        W: this.W, H: this.H,
        camera: this.camera,
      });
    });

    this._hasAnimatedScene = hasAnimatedScene;
    this._needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
}
