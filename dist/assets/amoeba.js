(() => {
  "use strict";
  const M = window.Milono;
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
  // Continuous, non-periodic value noise. No per-frame randomness or loop reset.
  function noise(t, seed) {
    const n = Math.floor(t), f = smooth(t - n);
    const at = i => { const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; };
    return at(n) * (1 - f) + at(n + 1) * f;
  }
  const profiles = {
    A: { angle: -0.45, lobes: 4, elongation: 1.13, core: 0.19 },
    B: { angle: 0.82, lobes: 3, elongation: 0.88, core: 0.25 },
    C: { angle: 2.18, lobes: 5, elongation: 1.04, core: 0.16 }
  };
  const names = ["east membrane", "southeast extension", "lower-right flow", "south membrane",
    "southwest extension", "lower-left flow", "west membrane", "northwest extension",
    "upper-left flow", "north membrane", "northeast extension", "upper-right flow"];
  function random(seed) {
    let x = M.hash32(seed) || 1;
    return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967295; };
  }
  const weightCache = new Map();
  function weightAt(specimen, index) {
    const key = specimen + ":" + index;
    if (weightCache.has(key)) return weightCache.get(key);
    const rng = random(specimen + ":weight:" + index);
    const result = { value: rng() * 2 - 1, layer: 1 + Math.floor(index / 2304),
      block: Math.floor(index / 16), entropy: 0.94 + rng() * 0.059,
      stability: 99.991 + rng() * 0.009, region: Math.floor(index / 1536) };
    weightCache.set(key, result);
    return result;
  }
  const regionCache = new Map();
  function regionData(specimen, region) {
    region = clamp(region, 0, 11);
    const key = specimen + ":" + region;
    if (regionCache.has(key)) return regionCache.get(key);
    const start = region * 1536, count = 1536, bins = new Array(16).fill(0);
    let sum = 0, squares = 0;
    for (let i = start; i < start + count; i++) {
      const v = weightAt(specimen, i).value;
      sum += v; squares += v * v;
      bins[Math.min(15, Math.floor((v + 1) * 8))]++;
    }
    const mean = sum / count;
    const entropy = bins.reduce((value, n) => n ? value - (n / count) * Math.log2(n / count) : value, 0) / 4;
    const bias = (weightAt(specimen, start + 7).value + 1) / 2;
    const data = { region, name: names[region], start, end: start + count - 1,
      weights: "W[" + start + ":" + (start + count - 1) + "]",
      entropy, variance: squares / count - mean * mean, bias, mean };
    regionCache.set(key, data);
    return data;
  }
  function morphology(specimen) {
    const p = profiles[specimen];
    return { ...p, fields: Array.from({ length: 12 }, (_, i) => regionData(specimen, i)),
      strengths: Array.from({ length: p.lobes }, (_, i) =>
      0.16 + (weightAt(specimen, 97 + i * 1536).value + 1) * 0.12) };
  }
  class AmoebaView {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.options = options;
      this.specimen = options.specimen || M.provider.getState().specimen;
      this.form = morphology(this.specimen);
      this.nextForm = this.form;
      this.current = { compact: options.mode === "TUN" ? 1 : 0,
        dead: options.mode === "DEAD" ? 1 : 0, risk: 0, motility: options.mode === "TUN" || options.mode === "DEAD" ? 0 : 0.7 };
      this.clock = 0; this.pointer = null; this.region = -1; this.visible = true;
      this.coreClock = 0; this.flowClock = 0; this.wakeAge = 10;
      this.current.tension = options.mode === "TUN" ? 1 : 0.15;
      this.current.flow = options.mode === "TUN" || options.mode === "DEAD" ? 0 : 0.7;
      this.current.coreActivity = options.mode === "TUN" ? 0.16 : options.mode === "DEAD" ? 0 : 1;
      this.response = { x: 0, y: 0, strength: 0 };
      this.localPressure = new Array(12).fill(0);
      this.extensions = [];
      this.interactive = !options.mode && !canvas.closest("button");
      this.drag = { pointerId: null, angle: 0, x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, speedX: 0, speedY: 0, moved: false };
      this.impact = { age: 2, angle: 0, x: 0, y: 0 };
      this.exploreClock = 0; this.nextExplore = 0; this.exploreIndex = 0; this.explorations = [];
      this.suppressClickUntil = 0;
      this.width = 0; this.height = 0;
      this.points = [];
      this.particles = Array.from({ length: 60 }, (_, i) => {
        const rng = random("plasma:" + i);
        return { a: rng() * TAU, r: 0.27 + Math.sqrt(rng()) * 0.54, size: 0.4 + rng() * 0.8, phase: rng() * TAU };
      });
      const resize = new ResizeObserver(() => { this.resize(); this.draw(); });
      resize.observe(canvas);
      this.resizeObserver = resize;
      if (this.interactive) this.bindInteraction();
      views.push(this);
      observer.observe(canvas);
      this.resize();
      this.update(M.provider.getState(), 1);
      this.draw();
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width; this.height = rect.height;
      this.dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * this.dpr)), h = Math.max(1, Math.round(rect.height * this.dpr));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w; this.canvas.height = h;
      }
    }
    localPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      // Physics is in CSS pixels. DPR is applied once, at the drawing transform.
      return { x: (event.clientX - rect.left) * this.width / (rect.width || 1),
        y: (event.clientY - rect.top) * this.height / (rect.height || 1) };
    }
    sense(event) {
      if (!this.interactive || this.drag.pointerId !== null) return;
      const p = event ? this.localPoint(event) : null;
      this.pointer = p && Math.hypot(p.x - this.cx, p.y - this.cy) < this.scale * 1.3 + 210 ? p : null;
    }
    nearestPoint(p) {
      return this.points.reduce((best, point) => Math.hypot(point.x - p.x, point.y - p.y) <
        Math.hypot(best.x - p.x, best.y - p.y) ? point : best, this.points[0] || { x: 0, y: 0, a: 0 });
    }
    excite(p) {
      if (this.current.dead > 0.5) return;
      const near = this.nearestPoint(p);
      this.impact = { age: 0, angle: near.a, x: p.x, y: p.y };
    }
    bindInteraction() {
      const canvas = this.canvas;
      canvas.dataset.membraneInteractive = "true";
      canvas.style.touchAction = "none";
      canvas.style.pointerEvents = "auto";
      if (canvas.tabIndex < 0) canvas.tabIndex = 0;
      const label = canvas.getAttribute("aria-label") || "MILONO organism";
      canvas.setAttribute("aria-label", label + ". Press and drag to deform the membrane; Space produces a local response.");
      canvas.addEventListener("pointerenter", e => { this.pointer = this.localPoint(e); });
      canvas.addEventListener("pointermove", e => {
        if (e.isPrimary === false) return;
        const p = this.localPoint(e), d = this.drag;
        if (d.pointerId !== null && d.pointerId !== e.pointerId) return;
        this.pointer = p;
        if (d.pointerId === e.pointerId) {
          const dt = Math.max(0.008, (e.timeStamp - d.lastTime) / 1000);
          d.speedX += (clamp((p.x - d.lastX) / dt, -1800, 1800) - d.speedX) * 0.1;
          d.speedY += (clamp((p.y - d.lastY) / dt, -1800, 1800) - d.speedY) * 0.1;
          d.lastX = p.x; d.lastY = p.y; d.lastTime = e.timeStamp;
          d.rawX = p.x - d.startX; d.rawY = p.y - d.startY;
          if (Math.hypot(d.rawX, d.rawY) > 4) { d.moved = true; this.impact.age = 2; }
        }
        canvas.style.cursor = d.pointerId !== null ? "grabbing" :
          this.current.dead < 0.5 && this.regionAt(p.x, p.y) >= 0 ? "grab" : "default";
      });
      canvas.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.isPrimary === false || this.drag.pointerId !== null || this.current.dead > 0.5) return;
        const p = this.localPoint(e);
        if (this.regionAt(p.x, p.y) < 0) return;
        const near = this.nearestPoint(p), d = this.drag;
        Object.assign(d, { pointerId: e.pointerId, angle: near.a, startX: p.x, startY: p.y,
          anchorX: near.x, anchorY: near.y, lastX: p.x, lastY: p.y, lastTime: e.timeStamp,
          speedX: 0, speedY: 0, rawX: 0, rawY: 0, moved: false });
        this.pointer = p; this.excite(p);
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        e.preventDefault();
      });
      const release = e => {
        if (e.pointerId !== this.drag.pointerId) return;
        this.releaseDrag(e.type !== "pointerup");
      };
      canvas.addEventListener("pointerup", release);
      canvas.addEventListener("pointercancel", release);
      canvas.addEventListener("lostpointercapture", release);
      canvas.addEventListener("pointerleave", () => {
        if (this.drag.pointerId === null) { this.pointer = null; canvas.style.cursor = "default"; }
      });
      canvas.addEventListener("click", e => {
        // A completed drag must not pin an inspector or trigger a parent action.
        if (performance.now() < this.suppressClickUntil) { e.preventDefault(); e.stopImmediatePropagation(); }
      });
      canvas.addEventListener("keydown", e => {
        if (e.key === "Escape") this.releaseDrag(true);
        if (e.key === " " || (e.key === "Enter" && canvas.id !== "body-canvas")) {
          e.preventDefault(); this.excite({ x: this.cx + this.scale * 0.75, y: this.cy });
        }
      });
    }
    releaseDrag(cancelled = false) {
      const d = this.drag, id = d.pointerId;
      if (id === null) return;
      if (d.moved || cancelled) this.suppressClickUntil = performance.now() + 450;
      d.pointerId = null; d.targetX = 0; d.targetY = 0; d.speedX = 0; d.speedY = 0;
      if (this.canvas.hasPointerCapture(id)) this.canvas.releasePointerCapture(id);
      this.canvas.style.cursor = "default";
      if (cancelled) this.impact.age = 2;
    }
    advanceInteraction(dt) {
      const d = this.drag, s = this.current;
      const sensitivity = (1 - s.dead) * (1 - s.compact * 0.82) * (motion.matches ? 0.45 : 1);
      if (d.pointerId !== null) {
        const x = d.rawX + d.speedX * 0.065, y = d.rawY + d.speedY * 0.065;
        const distance = Math.hypot(x, y), nx = x / (distance || 1), ny = y / (distance || 1);
        let limit = Math.min(72, this.scale * 0.82) * (1 - s.tension * 0.25);
        if (Math.abs(nx) > 0.01) limit = Math.min(limit, (nx > 0 ? this.width - 8 - d.anchorX : d.anchorX - 8) / Math.abs(nx));
        if (Math.abs(ny) > 0.01) limit = Math.min(limit, (ny > 0 ? this.height - 8 - d.anchorY : d.anchorY - 8) / Math.abs(ny));
        limit = Math.max(1, limit);
        const length = limit * Math.tanh(distance / limit) * sensitivity;
        d.targetX = nx * length; d.targetY = ny * length;
        d.speedX *= Math.exp(-dt * 5); d.speedY *= Math.exp(-dt * 5);
      }
      // Substepped, damped spring: slight lag under load and a small recoil on release.
      const steps = Math.max(1, Math.ceil(Math.min(dt, 0.05) / 0.008)), h = Math.min(dt, 0.05) / steps;
      const k = d.pointerId !== null ? 155 : 85, damping = motion.matches ? 27 : d.pointerId !== null ? 22 : 15;
      for (let i = 0; i < steps; i++) {
        d.vx += ((d.targetX - d.x) * k - damping * d.vx) * h;
        d.vy += ((d.targetY - d.y) * k - damping * d.vy) * h;
        d.x += d.vx * h; d.y += d.vy * h;
      }
      this.impact.age += dt;
      this.canvas.dataset.dragging = String(d.pointerId !== null);
    }
    setSpecimen(key) {
      if (key === this.specimen) return;
      this.releaseDrag(true);
      Object.assign(this.drag, { x: 0, y: 0, vx: 0, vy: 0 });
      this.explorations = []; this.nextExplore = this.exploreClock;
      this.specimen = key; this.nextForm = morphology(key);
    }
    update(state, dt) {
      this.setSpecimen(this.options.specimen || state.specimen);
      const fixed = Boolean(this.options.mode);
      const mode = this.options.mode || state.mode;
      const metrics = M.provider.metrics();
      if (this.lastMode === "TUN" && mode === "ACTIVE") this.wakeAge = 0;
      if (this.lastMode && this.lastMode !== mode && mode !== "ACTIVE") this.releaseDrag(true);
      this.lastMode = mode;
      this.wakeAge += dt;
      const target = { compact: mode === "TUN" ? 1 : 0, dead: mode === "DEAD" ? 1 : 0,
        risk: fixed ? 0.18 : metrics.risk / 100,
        motility: fixed ? (mode === "ACTIVE" ? 0.8 : 0) : metrics.motility,
        flow: mode === "DEAD" ? 0 : mode === "TUN" ? 0.008 : fixed ? 0.8 : metrics.flow,
        coreActivity: mode === "DEAD" ? 0 : mode === "TUN" ? 0.16 : 1 };
      target.tension = mode === "DEAD" ? 0 : mode === "TUN" ? 1 : 0.12 + target.risk * 0.72;
      const waking = mode === "ACTIVE" && this.wakeAge < 3.2;
      if (waking) {
        target.flow *= smooth(clamp((this.wakeAge - 0.2) / 1.1));
        target.motility *= smooth(clamp((this.wakeAge - 0.7) / 2));
        target.compact = 1 - smooth(clamp((this.wakeAge - 0.45) / 1.5));
      }
      const blend = motion.matches ? 1 : 1 - Math.exp(-dt * 2.6);
      for (const key of Object.keys(target)) {
        const rate = key === "tension" ? 6 : key === "coreActivity" ? 5 : key === "compact" ? 3 : 2.6;
        this.current[key] += (target[key] - this.current[key]) * (motion.matches ? 1 : 1 - Math.exp(-dt * rate));
      }
      this.form = { ...this.nextForm,
        angle: this.form.angle + (this.nextForm.angle - this.form.angle) * blend,
        elongation: this.form.elongation + (this.nextForm.elongation - this.form.elongation) * blend,
        core: this.form.core + (this.nextForm.core - this.form.core) * blend };
      // Phase slows continuously on suspension. It never jumps back to a rest frame.
      const alive = 1 - this.current.dead, reduced = motion.matches ? 0.45 : 1;
      this.clock += dt * (0.045 + this.current.motility * 1.7) * alive * reduced;
      this.flowClock += dt * this.current.flow * alive * reduced * 1.7;
      this.coreClock += dt * alive;
      this.exploreClock += dt * (0.6 + this.current.motility * 0.6) * (1 - this.current.compact) * alive * reduced;
      this.explorations = this.explorations.filter(p => this.exploreClock - p.start < p.duration);
      if (mode === "ACTIVE" && this.wakeAge > 1.2 && this.exploreClock >= this.nextExplore && this.explorations.length < 2) {
        const rng = random(this.specimen + ":explore:" + this.exploreIndex++);
        this.explorations.push({ angle: rng() * TAU, start: this.exploreClock,
          duration: 3.4 + rng() * 1.5, amplitude: 0.17 + rng() * 0.08 });
        this.nextExplore = this.exploreClock + 3 + rng() * 4;
      }
      this.advanceInteraction(dt);
      const response = this.response, p = this.pointer;
      if (p) {
        const approach = 1 - Math.exp(-dt * 5);
        if (response.strength < 0.001) { response.x = p.x; response.y = p.y; }
        else { response.x += (p.x - response.x) * approach; response.y += (p.y - response.y) * approach; }
      }
      const distance = p ? Math.max(0, Math.hypot(p.x - this.cx, p.y - this.cy) - this.scale * 0.95) : 210;
      const sensitivity = p ? Math.pow(clamp(1 - distance / 210), 2) * alive * (1 - this.current.compact * 0.88) * (motion.matches ? 0.35 : 1) : 0;
      response.strength += (sensitivity - response.strength) * (1 - Math.exp(-dt * (p ? 3 : 2)));
      this.canvas.dataset.mode = mode;
      this.canvas.dataset.viewSpecimen = this.specimen;
      this.canvas.dataset.compact = this.current.compact.toFixed(3);
    }
    radius(a) {
      const f = this.form, s = this.current;
      let r = 0.78 + (Math.sin(a * 2 + f.angle) * 0.045 + Math.cos(a * 3 - f.angle) * 0.032) * (1 - s.compact * 0.85);
      for (let i = 0; i < f.lobes; i++) {
        const extension = this.extensions[i];
        const center = f.angle + i * TAU / f.lobes + Math.sin(i * 2.7 + f.angle) * 0.48 + extension.drift * 0.15 * (1 - s.compact);
        const delta = Math.atan2(Math.sin(a - center), Math.cos(a - center));
        r += f.strengths[i] * extension.reach * Math.exp(-delta * delta / (0.19 + (i % 3) * 0.06)) * (1 - s.compact * 0.98) * (1 - s.risk * 0.52);
      }
      const region = a / TAU * 12;
      const left = f.fields[Math.floor(region) % 12], right = f.fields[(Math.floor(region) + 1) % 12];
      const u = region % 1, mix = u * u * (3 - 2 * u);
      // Every fixture weight contributes to its region's mean and variance.
      const field = (left.mean * (1 - mix) + right.mean * mix) * 1.2 +
        (left.variance * (1 - mix) + right.variance * mix - 1 / 3) * 0.35;
      r += field * (1 - s.compact * 0.85);
      // Independently phased local pressure, deliberately not whole-body scaling.
      const pressure = this.localPressure[Math.floor(region) % 12] * (1 - mix) + this.localPressure[(Math.floor(region) + 1) % 12] * mix;
      r += pressure * 0.085 * (1 - s.compact * 0.96) * (1 - s.tension * 0.55) * (1 - s.dead) * (motion.matches ? 0.35 : 1);
      for (const pod of this.explorations) {
        const age = this.exploreClock - pod.start;
        const envelope = smooth(clamp(age / 0.95)) * (1 - smooth(clamp((age - 1.65) / (pod.duration - 1.65))));
        const delta = Math.atan2(Math.sin(a - pod.angle), Math.cos(a - pod.angle));
        r += pod.amplitude * envelope * Math.exp(-delta * delta / 0.17) *
          (1 - s.compact) * (1 - s.risk * 0.6) * (1 - s.dead) * (motion.matches ? 0.3 : 1);
      }
      r *= 1 - s.compact * 0.28 - s.risk * 0.13;
      return r;
    }
    geometry() {
      const s = this.current;
      this.localPressure = this.form.fields.map((field, i) =>
        noise(this.clock * (0.28 + field.bias * 0.17) + i * 0.7, i + 11) * 0.5 +
        noise(this.clock * 0.13 + i * 0.43, i + 47) * 0.2 +
        Math.sin(this.clock * 1.1 + noise(this.clock * 0.13, 5) * 0.6 + i * 0.83) * 0.3);
      this.extensions = this.form.strengths.map((_, i) => ({
        drift: noise(this.clock * 0.15 + i, i + 23) * (motion.matches ? 0.3 : 1),
        reach: 0.85 + noise(this.clock * (0.17 + i * 0.013) + i * 1.7, i + 83) * (motion.matches ? 0.13 : 0.45)
      }));
      this.cx = this.width / 2; this.cy = this.height / 2;
      this.scale = Math.min(this.width * 0.32, this.height * 0.36);
      this.coreOffset = { x: this.drag.x * 0.09, y: this.drag.y * 0.09 };
      this.points = Array.from({ length: 180 }, (_, i) => {
        const a = i / 180 * TAU;
        const r = this.radius(a) * this.scale;
        const ex = 1 + (this.form.elongation - 1) * (1 - s.compact * 0.8);
        let x = this.cx + Math.cos(a) * r * ex, y = this.cy + Math.sin(a) * r / Math.sqrt(ex);
        if (this.response.strength > 0.001 && this.drag.pointerId === null) {
          const angle = Math.atan2(this.response.y - this.cy, this.response.x - this.cx);
          const delta = Math.atan2(Math.sin(a - angle), Math.cos(a - angle));
          const reach = Math.exp(-delta * delta / 0.24) * Math.min(10, this.scale * 0.11) * this.response.strength;
          x += Math.cos(a) * reach; y += Math.sin(a) * reach;
        }
        const delta = Math.atan2(Math.sin(a - this.drag.angle), Math.cos(a - this.drag.angle));
        const influence = Math.exp(-delta * delta / 0.42);
        x += this.drag.x * influence; y += this.drag.y * influence;
        const age = this.impact.age, local = Math.atan2(Math.sin(a - this.impact.angle), Math.cos(a - this.impact.angle));
        const contraction = age < 0.26 ? -Math.sin(Math.PI * age / 0.26) * 0.12 :
          age < 0.9 ? Math.sin(Math.PI * (age - 0.26) / 0.64) * 0.036 : 0;
        const pressure = contraction * this.scale * Math.exp(-local * local / 0.26) * (1 - s.dead) *
          (1 - s.compact * 0.8) * (motion.matches ? 0.35 : 1);
        x += Math.cos(a) * pressure; y += Math.sin(a) * pressure;
        x += Math.cos(a * 3 + i * 0.11) * s.dead * this.scale * 0.075;
        y += Math.sin(a * 4) * s.dead * this.scale * 0.075;
        return { x, y, a };
      });
    }
    plasmaPosition(p, i) {
      const t = this.flowClock, a = p.a + this.form.angle * 0.2;
      // Bounded local advection, not particles orbiting an emitter.
      const x = Math.cos(a) * p.r + noise(t * 0.2 + p.phase, i + 101) * 0.13;
      const y = Math.sin(a) * p.r * 0.84 + noise(t * 0.17 + p.phase, i + 171) * 0.095;
      const scale = this.scale * (1 - this.current.compact * 0.31 - this.current.risk * 0.12);
      const delta = Math.atan2(Math.sin(a - this.drag.angle), Math.cos(a - this.drag.angle));
      const drag = Math.exp(-delta * delta / 0.45) * p.r * 0.55;
      const px = this.cx + x * scale, py = this.cy + y * scale;
      const distance = Math.hypot(px - this.impact.x, py - this.impact.y);
      const wave = this.impact.age < 0.8 ? Math.exp(-Math.pow((distance - this.impact.age * this.scale * 2) / (this.scale * 0.22), 2)) *
        Math.sin(Math.PI * this.impact.age / 0.8) * (motion.matches ? 0.6 : 2.4) : 0;
      const toward = Math.atan2(this.cy - py, this.cx - px);
      const pointerAngle = Math.atan2(this.response.y - this.cy, this.response.x - this.cx);
      const proximity = Math.exp(-Math.pow(Math.atan2(Math.sin(a - pointerAngle), Math.cos(a - pointerAngle)), 2) / 0.4);
      const microFlow = noise(t * 0.6 + p.phase, i + 271) * this.response.strength * proximity * 1.8;
      return { x: px + this.drag.x * drag + Math.cos(toward) * (wave + microFlow),
        y: py + this.drag.y * drag + Math.sin(toward) * (wave + microFlow) };
    }
    path(scale = 1) {
      const c = this.ctx;
      c.beginPath();
      this.points.forEach((p, i) => {
        const x = this.cx + (p.x - this.cx) * scale, y = this.cy + (p.y - this.cy) * scale;
        if (!i) c.moveTo(x, y); else c.lineTo(x, y);
      });
      c.closePath();
    }
    regionAt(x, y) {
      let inside = false;
      for (let i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
        const p = this.points[i], q = this.points[j];
        if ((p.y > y) !== (q.y > y) && x < (q.x - p.x) * (y - p.y) / (q.y - p.y) + p.x) inside = !inside;
      }
      const near = this.nearestPoint({x,y});
      if (!inside && Math.hypot(x - near.x, y - near.y) > 8) return -1;
      return Math.min(11, Math.floor(near.a / TAU * 12));
    }
    draw() {
      if (!this.width || !this.height) return;
      this.geometry();
      const c = this.ctx, s = this.current, alive = 1 - s.dead;
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.clearRect(0, 0, this.width, this.height);
      this.path();
      const tissue = c.createLinearGradient(this.cx - this.scale, this.cy - this.scale, this.cx + this.scale, this.cy + this.scale);
      tissue.addColorStop(0, "rgba(167,181,172," + (0.075 * alive + 0.012) + ")");
      tissue.addColorStop(0.55, "rgba(133,155,143," + (0.11 * alive + 0.012) + ")");
      tissue.addColorStop(1, "rgba(152,171,161," + (0.045 * alive + 0.012) + ")");
      c.fillStyle = tissue;
      c.fill();
      c.save(); this.path(); c.clip();
      // Uneven translucent cortex, not concentric contour rings.
      this.path();
      for (let i = this.points.length - 1; i >= 0; i--) {
        const p = this.points[i];
        const thickness = this.scale * (0.025 + 0.018 * (1 + Math.sin(p.a * 3 + this.form.angle)) + s.compact * 0.015);
        const x = p.x - Math.cos(p.a) * thickness, y = p.y - Math.sin(p.a) * thickness;
        if (i === this.points.length - 1) c.moveTo(x, y); else c.lineTo(x, y);
      }
      c.closePath(); c.fillStyle = "rgba(172,188,176," + (0.075 * alive) + ")"; c.fill("evenodd");
      // Sparse, bounded cytoplasmic compartments move with the same flow as granules.
      for (let i = 0; i < 7; i++) {
        const p = this.particles[i * 7], pos = this.plasmaPosition(p, i * 7);
        const r = this.scale * (0.075 + (i % 3) * 0.035) * (1 - s.compact * 0.35);
        const a = p.a + noise(this.flowClock * 0.06, i + 61) * 0.35;
        c.save(); c.translate(pos.x, pos.y); c.rotate(a);
        c.beginPath();
        c.moveTo(-r, 0); c.bezierCurveTo(-r * 0.65, -r * 0.65, r * 0.7, -r * 0.48, r, 0);
        c.bezierCurveTo(r * 0.75, r * 0.38, -r * 0.8, r * 0.72, -r, 0);
        c.fillStyle = "rgba(164,181,169," + (0.027 * alive * (0.55 + s.flow * 0.45)) + ")"; c.fill();
        c.lineWidth = 0.55; c.strokeStyle = "rgba(167,184,173," + (0.07 * alive) + ")";
        if (i % 2 === 0) c.stroke();
        c.restore();
      }
      if (this.region >= 0 && alive > 0.1) {
        const from = this.region * 15, to = from + 15;
        c.beginPath(); c.moveTo(this.cx, this.cy);
        for (let i = from; i <= to; i++) { const p = this.points[i % 180]; c.lineTo(p.x, p.y); }
        c.closePath(); c.fillStyle = "rgba(172,207,186,0.10)"; c.fill();
      }
      this.particles.forEach((p, i) => {
        const { x, y } = this.plasmaPosition(p, i);
        const size = p.size * (this.width < 210 ? 0.75 : 1);
        c.beginPath(); c.ellipse(x, y, size * 1.25, size * 0.7, p.a, 0, TAU);
        const density = (i % 3 === 0 ? 0.16 : 0.06) + s.flow * 0.14;
        c.fillStyle = "rgba(181,196,185," + (density * alive) + ")";
        c.fill();
        if (i % 8 === 0) {
          const length = this.scale * 0.085 * (0.2 + s.flow * 0.8);
          c.beginPath(); c.moveTo(x, y);
          c.quadraticCurveTo(x + Math.cos(p.a + 0.5) * length * 0.55, y + Math.sin(p.a + 0.5) * length * 0.55,
            x + Math.cos(p.a) * length, y + Math.sin(p.a) * length);
          c.strokeStyle = "rgba(162,181,168," + 0.11 * alive * s.flow + ")"; c.lineWidth = 0.6; c.stroke();
        }
      });
      c.restore();
      // A stable nuclear envelope and specimen-specific chromatin retain identity.
      // Activity changes density, not the identity geometry; no additive glow.
      const dormantPulse = Math.pow(Math.max(0, Math.sin(this.coreClock * TAU / 11 + noise(this.coreClock * 0.035, 29) * 0.35)), 10);
      const activePulse = (Math.sin(this.coreClock * 1.02 + noise(this.coreClock * 0.14, 231) * 0.55) + 1) / 2;
      const clickPulse = this.impact.age > 0.16 && this.impact.age < 0.8 ? Math.sin((this.impact.age - 0.16) / 0.64 * Math.PI) : 0;
      const wakePulse = this.wakeAge < 0.9 ? Math.sin(this.wakeAge / 0.9 * Math.PI) : 0;
      const pulse = (activePulse * (1 - s.compact) + dormantPulse * s.compact + clickPulse * 1.1 + wakePulse * 0.8) * alive * (motion.matches ? 0.35 : 1);
      this.nuclearPulse = pulse;
      const core = this.scale * this.form.core * (1 + pulse * 0.035);
      c.save(); c.translate(this.coreOffset.x, this.coreOffset.y);
      const coreResponse = this.response.strength * Math.exp(-Math.hypot(this.response.x - this.cx, this.response.y - this.cy) / Math.max(1, this.scale));
      c.beginPath(); c.ellipse(this.cx + core * 0.12, this.cy - core * 0.08, core * 1.65, core * 1.36, this.form.angle * 0.2, 0, TAU);
      c.fillStyle = "rgba(168,189,174," + (alive * (0.024 + s.coreActivity * 0.012 + coreResponse * 0.008)) + ")"; c.fill();
      for (let ring = 0; ring < 2; ring++) {
        c.beginPath();
        for (let i = 0; i <= 48; i++) {
          const a = i / 48 * TAU;
          const r = core * (0.97 + ring * 0.13) * (1 + Math.sin(a * 3 + this.form.angle) * 0.065 + s.dead * Math.sin(a * 9) * 0.27);
          const x = this.cx + Math.cos(a) * r * 1.09, y = this.cy + Math.sin(a) * r * 0.85;
          if (!i || (s.dead > 0.5 && i % 12 === 0)) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.strokeStyle = "rgba(205,219,207," + ((0.36 - ring * 0.16 + s.coreActivity * 0.13 + pulse * 0.13) * (0.15 + alive * 0.85)) + ")";
        c.lineWidth = ring === 0 ? 0.85 : 0.6;
        c.stroke();
        if (ring === 0) { c.fillStyle = "rgba(186,205,192," + (alive * (0.07 + s.coreActivity * 0.04 + pulse * 0.038)) + ")"; c.fill(); }
      }
      // Fixed short folds, rather than an orbiting particle constellation.
      const rng = random(this.specimen + ":nucleus");
      for (let i = 0; i < 7; i++) {
        const a = rng() * TAU, r = Math.sqrt(rng()) * core * 0.59;
        const x = this.cx + Math.cos(a) * r, y = this.cy + Math.sin(a) * r * 0.8;
        const turn = rng() * TAU, length = core * (0.13 + rng() * 0.18);
        c.beginPath(); c.moveTo(x, y);
        c.quadraticCurveTo(x + Math.cos(turn + 0.7) * length, y + Math.sin(turn + 0.7) * length,
          x + Math.cos(turn) * length * 1.5, y + Math.sin(turn) * length * 1.5);
        c.strokeStyle = "rgba(218,227,216," + ((0.37 + s.coreActivity * 0.17) * alive) + ")";
        c.lineWidth = Math.max(0.6, core * 0.045); c.stroke();
      }
      c.restore();
      c.lineWidth = 0.75 + s.tension * 0.85;
      c.strokeStyle = "rgba(177,197,183," + (0.36 * alive + 0.14) + ")";
      if (s.dead < 0.15) { this.path(); c.stroke(); }
      else {
        c.beginPath();
        this.points.forEach((p, i) => {
          if (i % 24 < 7 + s.dead * 5) c.moveTo(p.x, p.y);
          else c.lineTo(p.x, p.y);
        });
        c.stroke();
      }
      // Short discontinuous inner folds give the membrane locally varying thickness.
      c.beginPath();
      this.points.forEach((p, i) => {
        const inset = this.scale * (0.027 + (1 + Math.sin(p.a * 3 + this.form.angle)) * 0.018);
        const x = p.x - Math.cos(p.a) * inset, y = p.y - Math.sin(p.a) * inset;
        if (i % 47 < 18) c.moveTo(x, y); else c.lineTo(x, y);
      });
      c.lineWidth = 0.6; c.strokeStyle = "rgba(162,179,165," + (0.18 * alive) + ")"; c.stroke();
      if (this.region >= 0 && alive > 0.1) {
        c.beginPath();
        for (let i = this.region * 15; i <= this.region * 15 + 15; i++) {
          const p = this.points[i % 180]; if (i === this.region * 15) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y);
        }
        c.strokeStyle = "#b9d0c2"; c.lineWidth = 1.7; c.stroke();
      }
      if (this.options.crosshair) {
        c.strokeStyle = "#242c27"; c.lineWidth = 0.6;
        [[this.cx - this.scale * 1.45, this.cy], [this.cx + this.scale * 1.45, this.cy]].forEach(([x,y]) => {
          c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x + 3, y); c.moveTo(x,y - 3); c.lineTo(x,y + 3); c.stroke();
        });
      }
      this.canvas.dataset.region = String(this.region);
    }
  }
  const views = [];
  let ambientPointer = null;
  document.addEventListener("pointermove", e => {
    if (e.isPrimary !== false) ambientPointer = e.pointerType === "touch" ? null : { clientX: e.clientX, clientY: e.clientY };
  }, { passive: true });
  document.addEventListener("pointerleave", () => { ambientPointer = null; });
  document.addEventListener("pointercancel", () => { ambientPointer = null; });
  window.addEventListener("blur", () => { ambientPointer = null; views.forEach(v => v.releaseDrag(true)); });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { const v = views.find(x => x.canvas === entry.target); if(v) { v.visible = entry.isIntersecting; if(v.visible) v.draw(); } });
  }, { rootMargin: "80px" });
  let latest = M.provider.getState(), previousTime = 0, nextDrawTime = 0, frame = 0;
  function tick(now) {
    frame = 0;
    const dt = Math.min(0.05, previousTime ? (now - previousTime) / 1000 : 1 / 60);
    if (!previousTime || now >= nextDrawTime) {
      for (const v of views) if (v.visible) { v.sense(ambientPointer); v.update(latest, dt); v.draw(); }
      const interval = motion.matches ? 50 : 1000 / 60;
      // Carry scheduling remainder instead of dropping every second frame on 75 Hz screens.
      nextDrawTime = nextDrawTime ? now + interval - ((now - nextDrawTime) % interval) : now + interval;
      previousTime = now;
    }
    if (!document.hidden) frame = requestAnimationFrame(tick);
  }
  function restart() { if (!frame && !document.hidden) { previousTime = 0; nextDrawTime = 0; frame = requestAnimationFrame(tick); } }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { ambientPointer = null; views.forEach(v => v.releaseDrag(true)); }
    restart();
  });
  motion.addEventListener("change", () => {
    if (frame) cancelAnimationFrame(frame); frame = 0;
    views.forEach(v => { v.update(latest, 0); v.draw(); }); restart();
  });
  M.provider.subscribe(s => {
    latest = s;
    if (motion.matches) views.forEach(v => { v.update(s, 0); v.draw(); });
    restart();
  });
  window.MilonoOrganism = { View: AmoebaView, views, weightAt, regionData, names };
})();
