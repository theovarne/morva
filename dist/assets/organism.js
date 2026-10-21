(() => {
  "use strict";

  const KEY = "milono.simulation.v2";
  // Read-only compatibility namespaces. Never delete the user's legacy backups.
  const LEGACY_KEYS = ["milno.simulation.v2", "ameba.simulation.v2"];
  const SPECIMENS = {
    A: { code: "7F2A", identity: "did:morva:7F2A91C4", root: "0x82F1A68B37D2C4E90B137E00D15A4F397A2BAF446F6B66B820E1A44D979C9C71", publicKey: "8nH7wQ2LYwJpQ4c6P51JksZA7a2rQb91QL", commitment: "0x81AF3E75CCBDBDC89D44A78B637C14F62795E04BD230E7D51DA822B7A416C210", variance: 0.081, stability: 97.2, bias: 0.41, efficiency: 88.4 },
    B: { code: "9C81", identity: "did:morva:9C81BE30", root: "0x4D52C6AB8884712DF60A8764DBA18DC62D1BE748103E938A6A52DAE4B91F1A03", publicKey: "5vK2dA91McT6aXz3J8QpHf4uWb7eLkB2YQ", commitment: "0x59D39D8F41C7A1F4EF165CB86CCEA3E441E8757406F2548EBB3D29EF2E0FB744", variance: 0.104, stability: 93.8, bias: 0.63, efficiency: 84.1 },
    C: { code: "22D4", identity: "did:morva:22D4A67E", root: "0xBB7042E366AF3D41B9DB8E44CE3F879521A029BB6111209A5509A2D1D2883FC8", publicKey: "2gR9mT48QwE1yKz6V3pNc7aDf5uHsL22D4", commitment: "0x13D1AA77E48231E87D9169C5B6A3076C64DF5C1B8926A9EECD4ED20A34A5D90B", variance: 0.067, stability: 98.4, bias: 0.28, efficiency: 91.7 }
  };
  const byId = (id) => document.getElementById(id);
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const short = (value, head, tail) => {
    head = head || 10;
    tail = tail || 4;
    return value.length > head + tail + 3 ? value.slice(0, head) + "..." + value.slice(-tail) : value;
  };
  const hash32 = (input) => {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const hexDigest = (input, size) => {
    let seed = hash32(input);
    let output = "";
    size = size || 64;
    while (output.length < size) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      output += (seed >>> 0).toString(16).padStart(8, "0");
    }
    return "0x" + output.slice(0, size);
  };
  const formatTime = (value) => new Date(value).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
  const formatUptime = (value) => {
    const minutes = Math.max(0, Math.floor(value / 60000));
    return String(Math.floor(minutes / 1440)).padStart(2, "0") + "D " +
      String(Math.floor((minutes % 1440) / 60)).padStart(2, "0") + "H " +
      String(minutes % 60).padStart(2, "0") + "M";
  };
  const numberMotions = new Map();
  let numberFrame = 0;
  function smoothNumber(id, target, decimals, suffix) {
    const node = byId(id);
    if (!node) return;
    const parsed = Number.parseFloat(node.textContent);
    const current = Number.isFinite(parsed) ? parsed : target;
    const existing = numberMotions.get(node);
    const from = existing ? existing.current : current;
    if (Math.abs(from - target) < Math.pow(10, -decimals) * 0.45) {
      node.textContent = target.toFixed(decimals) + suffix;
      numberMotions.delete(node);
      return;
    }
    numberMotions.set(node, { node: node, from: from, current: from, target: target, decimals: decimals, suffix: suffix, start: performance.now() });
    if (!numberFrame) numberFrame = window.requestAnimationFrame(runNumberMotions);
  }
  function runNumberMotions(now) {
    numberMotions.forEach((motion, node) => {
      const progress = clamp((now - motion.start) / 380, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      motion.current = motion.from + (motion.target - motion.from) * eased;
      node.textContent = motion.current.toFixed(motion.decimals) + motion.suffix;
      if (progress >= 1) numberMotions.delete(node);
    });
    numberFrame = numberMotions.size ? window.requestAnimationFrame(runNumberMotions) : 0;
  }

  function seedHistory(specimen, now) {
    return ["observe", "decide", "act", "verify"].map((action, index) => {
      const number = 1839 + index;
      return {
        number: number,
        timestamp: now - (4 - index) * 6200,
        from: "ACTIVE",
        to: "ACTIVE",
        action: action,
        sensor: hexDigest(specimen + ":sensor:" + number),
        previous: index ? hexDigest(specimen + ":block:" + (number - 1)) : hexDigest(specimen + ":genesis"),
        hash: hexDigest(specimen + ":block:" + number)
      };
    });
  }

  function initialState(specimen) {
    specimen = specimen || "A";
    const now = Date.now();
    const reserve = { A: 81.72, B: 76.48, C: 87.16 }[specimen];
    const history = seedHistory(specimen, now);
    return {
      version: 2,
      specimen: specimen,
      mode: "ACTIVE",
      epoch: 1842,
      startedAt: now - 321720000,
      lastTransitionAt: history[history.length - 1].timestamp,
      reserve: reserve,
      integrity: 100,
      stress: { latency: 31, noise: 48, compute: 83, resource: 62, pressure: 27 },
      history: history,
      metabolism: Array.from({ length: 56 }, (_, index) =>
        Number(clamp(reserve + Math.sin(index * 0.37 + specimen.charCodeAt(0)) * 0.82 - (55 - index) * 0.014, 18, 99).toFixed(3))
      )
    };
  }

  function validSavedState(state) {
    return state && state.version === 2 && Object.hasOwn(SPECIMENS, state.specimen) &&
      ["ACTIVE", "UNSTABLE", "TUN", "DEAD"].includes(state.mode) &&
      ["epoch", "startedAt", "lastTransitionAt", "reserve", "integrity"].every(key => Number.isFinite(state[key])) &&
      state.stress && ["latency", "noise", "compute", "resource", "pressure"].every(key =>
        Number.isFinite(state.stress[key]) && state.stress[key] >= 0 && state.stress[key] <= 100) &&
      Array.isArray(state.metabolism) && state.metabolism.every(Number.isFinite) &&
      Array.isArray(state.history) && state.history.length > 0 && state.history.every(entry =>
        entry && Number.isFinite(entry.number) && Number.isFinite(entry.timestamp) &&
        ["from", "to", "action", "sensor", "previous", "hash"].every(key => typeof entry[key] === "string"));
  }

  class OrganismProvider {
    constructor(state) {
      this.state = state;
      this.listeners = new Set();
    }
    getState() { return clone(this.state); }
    getSpecimen() { return SPECIMENS[this.state.specimen]; }
    subscribe(listener) {
      this.listeners.add(listener);
      listener(this.getState());
      return () => this.listeners.delete(listener);
    }
    emit() {
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (_) {}
      const state = this.getState();
      this.listeners.forEach((listener) => listener(state));
    }
  }

  class SimulationProvider extends OrganismProvider {
    constructor() {
      let saved = null;
      for (const key of [KEY, ...LEGACY_KEYS]) {
        try {
          const candidate = JSON.parse(localStorage.getItem(key) || "null");
          if (!validSavedState(candidate)) continue;
          saved = candidate;
          break;
        } catch (_) { /* Corrupt or inaccessible storage must not stop the console. */ }
      }
      super(saved || initialState());
      try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch (_) {}
      this.timer = 0;
    }
    risk(stress) {
      stress = stress || this.state.stress;
      return clamp(stress.latency * 0.16 + stress.noise * 0.18 +
        (100 - stress.compute) * 0.23 + (100 - stress.resource) * 0.27 +
        stress.pressure * 0.18, 0, 100);
    }
    metrics() {
      const risk = this.risk();
      const specimen = this.getSpecimen();
      return {
        risk: risk,
        stability: clamp(specimen.stability - risk * 0.19, 0, 100),
        margin: clamp(this.state.stress.resource - risk * 0.17, 0, 100),
        cost: this.state.mode === "TUN" || this.state.mode === "DEAD" ? 0 : 0.0014 + risk * 0.000031,
        average: 0.0021 + (100 - specimen.efficiency) * 0.000052
      };
    }
    addTransition(from, to, action) {
      this.state.epoch += 1;
      const number = this.state.epoch;
      const previous = this.state.history[this.state.history.length - 1];
      const entry = {
        number: number,
        timestamp: Date.now(),
        from: from,
        to: to,
        action: action,
        sensor: hexDigest(this.state.specimen + ":sensor:" + number + ":" + Math.round(this.risk())),
        previous: previous ? previous.hash : hexDigest(this.state.specimen + ":genesis"),
        hash: hexDigest(this.state.specimen + ":block:" + number + ":" + to + ":" + action)
      };
      this.state.history.push(entry);
      if (this.state.history.length > 80) this.state.history.shift();
      this.state.lastTransitionAt = entry.timestamp;
    }
    updateReserve() {
      const metrics = this.metrics();
      const pull = (this.state.stress.resource - 50) * 0.0007;
      const change = this.state.mode === "TUN" || this.state.mode === "DEAD" ? 0 : pull - metrics.cost * (1 + metrics.risk / 80);
      this.state.reserve = Number(clamp(this.state.reserve + change, 18, 99).toFixed(3));
      if (this.state.mode !== "DEAD") this.state.integrity = 100;
      this.state.metabolism.push(this.state.reserve);
      if (this.state.metabolism.length > 72) this.state.metabolism.shift();
    }
    setStress(key, value) {
      if (!(key in this.state.stress)) return;
      this.state.stress[key] = clamp(Number(value), 0, 100);
      const previous = this.state.mode;
      const risk = this.risk();
      if (previous !== "TUN" && previous !== "DEAD") {
        this.state.mode = risk >= 70 ? "TUN" : risk >= 52 ? "UNSTABLE" : "ACTIVE";
        if (previous !== this.state.mode) this.addTransition(previous, this.state.mode, "environment");
      }
      this.updateReserve();
      this.emit();
    }
    enterTun(action) {
      if (this.state.mode === "TUN" || this.state.mode === "DEAD") return false;
      const previous = this.state.mode;
      this.state.mode = "TUN";
      this.addTransition(previous, "TUN", action || "manual stress protocol");
      this.emit();
      return true;
    }
    wake() {
      if (this.state.mode !== "TUN" || this.risk() >= 52) return false;
      this.state.mode = "ACTIVE";
      this.addTransition("TUN", "ACTIVE", "identity verified / wake");
      this.emit();
      return true;
    }
    simulateMode(mode) {
      if (this.state.mode === "DEAD" || !["ACTIVE", "TUN"].includes(mode)) return false;
      if (mode === "TUN") return this.enterTun("state model probe");
      if (this.state.mode === "ACTIVE") return true;
      const previous = this.state.mode;
      this.state.mode = "ACTIVE";
      this.addTransition(previous, "ACTIVE", "state model probe");
      this.emit();
      return true;
    }
    simulateDeath() {
      if (this.state.mode === "DEAD") return false;
      const previous = this.state.mode;
      this.state.mode = "DEAD";
      this.state.integrity = 0;
      this.addTransition(previous, "DEAD", "identity invariant failure");
      this.emit();
      return true;
    }
    setSpecimen(specimen) {
      if (!SPECIMENS[specimen] || specimen === this.state.specimen) return;
      const startedAt = this.state.startedAt;
      this.state = initialState(specimen);
      this.state.startedAt = startedAt;
      this.emit();
      this.schedule();
    }
    cycle() {
      if (this.state.mode === "DEAD") {
        this.emit();
      } else if (this.state.mode !== "TUN") {
        const previous = this.state.mode;
        this.state.mode = this.risk() >= 52 ? "UNSTABLE" : "ACTIVE";
        this.updateReserve();
        this.addTransition(previous, this.state.mode, ["observe", "decide", "act", "verify"][this.state.epoch % 4]);
        this.emit();
      } else {
        this.emit();
      }
      this.schedule();
    }
    schedule() {
      window.clearTimeout(this.timer);
      const interval = 4000 + hash32(this.state.specimen + ":" + this.state.epoch) % 4001;
      this.timer = window.setTimeout(() => this.cycle(), interval);
    }
    start() {
      this.clock = window.setInterval(() => this.emit(), 1000);
      this.schedule();
      this.emit();
    }
  }

  class ChainProvider extends OrganismProvider {
    start() { throw new Error("ChainProvider is not connected in this research environment."); }
  }

  const provider = new SimulationProvider();
  let selectedTransition = null;
  let ledgerPinned = false;
  let activeContext = null;
  let lastContextLabel = "";

  function setContext(context) {
    activeContext = context || null;
    if (activeContext && activeContext.label && activeContext.label !== lastContextLabel) {
      appendTerminal("selected " + activeContext.label, "is-context");
      lastContextLabel = activeContext.label;
    }
    window.dispatchEvent(new CustomEvent("milono:context", { detail: activeContext }));
  }

  function getContext() { return activeContext ? clone(activeContext) : null; }

  function renderLive(state) {
    const specimen = SPECIMENS[state.specimen];
    const stateNode = byId("live-state");
    stateNode.textContent = state.mode;
    stateNode.dataset.state = state.mode.toLowerCase();
    byId("live-identity").textContent = short(specimen.identity, 15, 4);
    byId("live-epoch").textContent = String(state.epoch).padStart(6, "0");
    byId("live-uptime").textContent = formatUptime(Date.now() - state.startedAt);
    byId("live-weight-root").textContent = short(specimen.root);
    byId("live-last-transition").textContent = ((Date.now() - state.lastTransitionAt) / 1000).toFixed(3) + "s ago";
    smoothNumber("live-reserve", state.reserve, 2, "%");
    smoothNumber("live-integrity", state.integrity, 3, "%");
    byId("live-signal").textContent = state.mode === "DEAD" ? "identity invariant failed / organism dead" :
      state.mode === "TUN" ? "organism dormant / identity preserved" : "organism alive";
    const dot = document.querySelector(".alive-dot");
    if (dot) dot.setAttribute("data-state", state.mode.toLowerCase());
  }

  function renderStress(state) {
    const metrics = provider.metrics();
    Object.entries(state.stress).forEach((pair) => {
      const key = pair[0];
      const value = pair[1];
      const input = byId("stress-" + key);
      if (input && document.activeElement !== input) input.value = String(value);
      if (input) input.style.setProperty("--range-fill", value + "%");
      const output = byId("stress-" + key + "-output");
      if (output) output.textContent = Number(value).toFixed(1) + "%";
    });
    smoothNumber("survival-integrity", state.integrity, 3, "%");
    smoothNumber("survival-stability", metrics.stability, 3, "%");
    smoothNumber("survival-margin", metrics.margin, 3, "%");
    byId("survival-state").textContent = state.mode;
    byId("recovery-check").hidden = state.mode !== "TUN";
    byId("wake-button").disabled = metrics.risk >= 52;
    let headline = "environment within survivable range";
    if (state.mode === "UNSTABLE") headline = "transition stability degraded";
    if (state.mode === "TUN") headline = metrics.risk < 52 ? "environment recovered / wake available" : "tun entered / metabolism suspended";
    if (state.mode === "DEAD") headline = "identity invariant failed / irreversible";
    const message = byId("chamber-message");
    message.children[0].textContent = headline;
    message.children[1].textContent = "risk " + metrics.risk.toFixed(2) + " / identity invariant preserved";
  }

  function transitionDetails(entry) {
    const stressed = entry.to === "TUN" || entry.to === "UNSTABLE";
    return {
      observe: entry.to === "DEAD" ? "identity discontinuity" : stressed ? "environment above threshold" : "environment normal",
      decide: entry.to === "TUN" ? "enter cryptobiosis" : entry.to === "DEAD" ? "halt permanently" : "continue",
      act: entry.to === "TUN" ? "metabolism suspended" : entry.to === "DEAD" ? "state sealed" : "cycle executed",
      verify: entry.to === "DEAD" ? "FAIL" : "PASS"
    };
  }

  function renderLedger(state) {
    const recent = state.history.slice(-5);
    if (!ledgerPinned || !selectedTransition || !state.history.some((item) => item.number === selectedTransition)) {
      selectedTransition = state.history[state.history.length - 1].number;
    }
    const current = state.history.find((item) => item.number === selectedTransition) || state.history[state.history.length - 1];
    const blocks = [];
    recent.forEach((entry, index) => {
      if (index) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "ledger-link";
        link.dataset.linkFrom = String(recent[index - 1].number);
        link.dataset.linkTo = String(entry.number);
        link.setAttribute("aria-label", "Hash link " + recent[index - 1].number + " to " + entry.number + ", valid");
        link.innerHTML = "<span></span>";
        blocks.push(link);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ledger-block" + (entry.number === current.number ? " is-selected" : "");
      button.dataset.transition = String(entry.number);
      button.innerHTML = "<span>#" + entry.number + "</span><small>" + entry.action + " / " + entry.to + "</small>";
      blocks.push(button);
    });
    byId("ledger-strip").replaceChildren.apply(byId("ledger-strip"), blocks);
    byId("ledger-position").textContent = "BLOCK " + current.number + " / " + state.epoch;
    byId("transition-number").textContent = String(current.number).padStart(6, "0");
    byId("transition-time").textContent = formatTime(current.timestamp);
    byId("transition-state").textContent = current.from + " -> " + current.to;
    byId("transition-sensor").textContent = short(current.sensor);
    byId("transition-weight").textContent = short(SPECIMENS[state.specimen].root);
    const detail = transitionDetails(current);
    byId("transition-observe").textContent = detail.observe;
    byId("transition-decide").textContent = detail.decide;
    byId("transition-act").textContent = detail.act;
    byId("transition-verify").textContent = detail.verify;
    byId("transition-previous").textContent = short(current.previous);
    byId("transition-current").textContent = short(current.hash);
    const index = state.history.findIndex((item) => item.number === current.number);
    byId("ledger-previous").disabled = index <= 0;
    byId("ledger-next").disabled = index >= state.history.length - 1;
  }

  function renderMetabolism(state) {
    const metrics = provider.metrics();
    smoothNumber("metabolism-reserve", state.reserve, 2, "%");
    smoothNumber("metabolism-current", metrics.cost, 5, " / cycle");
    smoothNumber("metabolism-average", metrics.average, 5, " / cycle");
    byId("metabolism-mode").textContent = state.mode === "DEAD" ? "HALTED" : state.mode === "TUN" ? "SUSPENDED" : metrics.risk >= 52 ? "CONSERVATION" : "NORMAL";
  }

  function renderSpecimen(state) {
    const specimen = SPECIMENS[state.specimen];
    document.querySelector(".specimen-label").textContent = "morva / SPECIMEN 00" + ({ A: 1, B: 2, C: 3 }[state.specimen]);
    document.querySelectorAll("[data-specimen]").forEach((button) =>
      button.setAttribute("aria-selected", String(button.dataset.specimen === state.specimen))
    );
    byId("comparison-name").textContent = "SPECIMEN " + state.specimen + " / " + specimen.code;
    byId("comparison-identity").textContent = specimen.identity;
    byId("comparison-variance").textContent = specimen.variance.toFixed(3);
    byId("comparison-stability").textContent = specimen.stability.toFixed(1) + "%";
    byId("comparison-bias").textContent = specimen.bias.toFixed(2);
    byId("comparison-efficiency").textContent = specimen.efficiency.toFixed(1) + "%";
    byId("fingerprint-root").textContent = short(specimen.root);
    byId("proof-commitment").textContent = short(specimen.commitment);
    byId("proof-weight-root").textContent = short(specimen.root);
    byId("proof-public-key").textContent = short(specimen.publicKey);
  }

  function appendTerminal(text, className) {
    const output = byId("terminal-output");
    const entry = document.createElement("div");
    entry.className = "terminal-entry " + (className || "");
    entry.textContent = text;
    output.append(entry);
    output.scrollTop = output.scrollHeight;
  }

  function terminalCommand(raw) {
    const command = raw.trim().toLowerCase().replace(/\s+/g, " ");
    const state = provider.getState();
    const specimen = SPECIMENS[state.specimen];
    if (!command) return;
    appendTerminal(raw, "is-command");
    if (command === "clear") {
      byId("terminal-output").replaceChildren();
    } else if (command === "help") {
      appendTerminal("inspect | status | inspect identity|body|weights|metabolism|history | inspect transition <n> | derive weights | verify commitment | stress <0..1> | enter tun | wake | clear", "is-system");
    } else if (command === "inspect") {
      appendTerminal(activeContext ? activeContext.text : "no selected object / click a node, weight, cycle or transition", activeContext ? "" : "is-system");
    } else if (command === "status") {
      appendTerminal("SIMULATION / " + state.mode + " / specimen " + state.specimen + " / epoch " + state.epoch + " / reserve " + state.reserve.toFixed(2) + "% / risk " + provider.risk().toFixed(2));
    } else if (command === "inspect identity") {
      appendTerminal(specimen.identity + "\npublic fixture " + specimen.publicKey + "\ncommitment fixture " + specimen.commitment + "\nsource local simulation");
    } else if (command === "inspect body") {
      appendTerminal("PROTOCOL MODEL W = HKDF(sk) / fixture parameters 18,432 / variance " + specimen.variance.toFixed(3) + " / drift 0.0000");
    } else if (command === "inspect weights") {
      appendTerminal("weight root " + specimen.root + "\nfixed at genesis / specimen " + state.specimen);
    } else if (command === "inspect metabolism") {
      appendTerminal("reserve " + state.reserve.toFixed(3) + "% / cost " + provider.metrics().cost.toFixed(5) + " / mode " + (state.mode === "TUN" ? "SUSPENDED" : "NORMAL"));
    } else if (command === "inspect history") {
      appendTerminal(state.history.slice(-5).map((item) => "#" + item.number + " " + item.from + "->" + item.to + " " + item.action).join("\n"));
    } else if (command.indexOf("inspect transition ") === 0) {
      const number = Number(command.split(" ").pop());
      const item = state.history.find((entry) => entry.number === number);
      appendTerminal(item ? "#" + item.number + " " + formatTime(item.timestamp) + "\n" + item.from + "->" + item.to + " / " + item.action + "\n" + item.hash : "transition " + number + " not retained", item ? "" : "is-error");
    } else if (command === "derive weights") {
      appendTerminal("SIMULATED DERIVATION(" + specimen.code + ") -> W[18,432]\nfixture root " + specimen.root);
    } else if (command === "verify commitment") {
      appendTerminal("LOCAL PASS / simulated weight root binds to " + short(specimen.commitment, 16, 8));
    } else if (/^stress (0(?:\.\d+)?|1(?:\.0+)?)$/.test(command)) {
      const amount = Number(command.split(" ")[1]);
      provider.setStress("latency", Math.round(amount * 100));
      provider.setStress("pressure", Math.round(amount * 100));
      provider.setStress("noise", Math.round(amount * 100));
      provider.setStress("compute", Math.round((1 - amount) * 100));
      provider.setStress("resource", Math.round((1 - amount) * 100));
      appendTerminal("stress applied " + amount.toFixed(2) + " / state " + provider.getState().mode);
    } else if (command === "enter tun") {
      appendTerminal(provider.enterTun() ? "tun entered / identity preserved" : "already dormant");
    } else if (command === "wake") {
      const woke = provider.wake();
      appendTerminal(woke ? "LOCAL PASS / simulated continuity confirmed / ACTIVE" : "wake denied / recover environment below risk 52 first", woke ? "" : "is-system");
    } else {
      appendTerminal("unknown procedure: " + command + " / type \"help\"", "is-error");
    }
  }

  document.querySelectorAll("[data-stress]").forEach((input) => {
    input.addEventListener("input", () => provider.setStress(input.dataset.stress, input.value));
  });
  byId("wake-button").addEventListener("click", () => provider.wake());
  document.querySelectorAll("[data-specimen]").forEach((button) => {
    button.addEventListener("click", () => provider.setSpecimen(button.dataset.specimen));
  });
  byId("ledger-strip").addEventListener("click", (event) => {
    const button = event.target.closest("[data-transition]");
    if (!button) return;
    selectedTransition = Number(button.dataset.transition);
    ledgerPinned = true;
    renderLedger(provider.getState());
    const state = provider.getState();
    const entry = state.history.find((item) => item.number === selectedTransition);
    if (entry) {
      const detail = transitionDetails(entry);
      setContext({
        type: "transition",
        label: "transition " + entry.number,
        text: "TRANSITION / " + String(entry.number).padStart(6, "0") + "\nOBSERVE  " + detail.observe + "\nDECIDE   " + detail.decide + "\nACT      " + detail.act + "\nVERIFY   " + detail.verify + "\nPREVIOUS " + short(entry.previous) + "\nCURRENT  " + short(entry.hash) + "\nINTEGRITY SIMULATED"
      });
    }
  });
  function moveLedger(direction) {
    const state = provider.getState();
    const index = state.history.findIndex((item) => item.number === selectedTransition);
    const target = state.history[clamp(index + direction, 0, state.history.length - 1)];
    if (target) {
      selectedTransition = target.number;
      ledgerPinned = true;
      renderLedger(state);
      setContext({ type: "transition", label: "transition " + target.number, text: "TRANSITION / " + String(target.number).padStart(6, "0") + "\n" + target.from + " -> " + target.to + "\nACTION " + target.action + "\nCURRENT " + short(target.hash) + "\nINTEGRITY SIMULATED" });
    }
  }
  byId("ledger-previous").addEventListener("click", () => moveLedger(-1));
  byId("ledger-next").addEventListener("click", () => moveLedger(1));
  byId("terminal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = byId("terminal-input");
    terminalCommand(input.value);
    input.value = "";
  });

  provider.subscribe((state) => {
    renderLive(state);
    renderStress(state);
    renderLedger(state);
    renderMetabolism(state);
    renderSpecimen(state);
    document.querySelector(".body-stage").setAttribute("data-state", state.mode.toLowerCase());
  });

  window.Milono = {
    OrganismProvider: OrganismProvider,
    SimulationProvider: SimulationProvider,
    ChainProvider: ChainProvider,
    provider: provider,
    SPECIMENS: SPECIMENS,
    hash32: hash32,
    hexDigest: hexDigest,
    short: short,
    setContext: setContext,
    getContext: getContext,
    transitionDetails: transitionDetails,
    formatTime: formatTime
  };
  provider.start();
})();
