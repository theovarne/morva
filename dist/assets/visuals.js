(() => {
  "use strict";

  // Canvas colors share the CSS brand tokens; simulation mechanics are unchanged.
  const theme = getComputedStyle(document.documentElement);
  const palette = Object.fromEntries(["ivory", "terracotta", "text-muted"].map(name => [name, theme.getPropertyValue('--milono-' + name).trim()]));
  const color = name => palette[name];
  const channels = Object.fromEntries(Object.entries(palette).map(([name, value]) => [name, [1, 3, 5].map(offset => parseInt(value.slice(offset, offset + 2), 16)).join(',')]));
  const rgba = (name, alpha) => {
    return 'rgba(' + channels[name] + ',' + alpha + ')';
  };
  const M = window.Milono;
  const provider = M.provider;
  const byId = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let state = provider.getState();

  const probeNode = document.createElement("div");
  probeNode.className = "lab-probe";
  probeNode.setAttribute("role", "tooltip");
  probeNode.setAttribute("aria-hidden", "true");
  document.body.append(probeNode);
  let probeOwner = "";
  let probeSignature = "";
  let probePoint = { x: 0, y: 0 };
  let probeFrame = 0;

  function renderProbe(title, rows) {
    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    const body = document.createElement("dl");
    rows.forEach((row) => {
      const item = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = row[0];
      detail.textContent = row[1];
      item.append(term, detail);
      body.append(item);
    });
    probeNode.replaceChildren(titleNode, body);
  }

  function positionProbe() {
    probeFrame = 0;
    const margin = 12;
    const rect = probeNode.getBoundingClientRect();
    let left = probePoint.x + 14;
    let top = probePoint.y + 14;
    if (left + rect.width > innerWidth - margin) left = probePoint.x - rect.width - 14;
    if (top + rect.height > innerHeight - margin) top = probePoint.y - rect.height - 14;
    probeNode.style.transform = "translate3d(" + Math.max(margin, left) + "px," + Math.max(margin, top) + "px,0)";
  }

  function showProbe(owner, title, rows, point) {
    probeOwner = owner;
    const signature = title + "|" + rows.map((row) => row[0] + ":" + row[1]).join("|");
    if (signature !== probeSignature) {
      renderProbe(title, rows);
      probeSignature = signature;
    }
    probePoint = point || probePoint;
    probeNode.classList.add("is-visible");
    probeNode.setAttribute("aria-hidden", "false");
    if (!probeFrame) probeFrame = requestAnimationFrame(positionProbe);
  }

  function moveProbe(owner, point) {
    if (probeOwner !== owner) return;
    probePoint = point;
    if (!probeFrame) probeFrame = requestAnimationFrame(positionProbe);
  }

  function hideProbe(owner) {
    if (owner && probeOwner !== owner) return;
    probeNode.classList.remove("is-visible");
    probeNode.setAttribute("aria-hidden", "true");
    probeOwner = "";
  }

  function eventPoint(event) { return { x: event.clientX, y: event.clientY }; }
  function elementPoint(element) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function randomFactory(seedText) {
    let seed = M.hash32(seedText) || 1;
    return () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967295;
    };
  }

  function sizeCanvas(canvas) {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    return { width: width, height: height, ratio: ratio, cssWidth: rect.width, cssHeight: rect.height };
  }

  let visualSpecimen = state.specimen;
  let nodes = [];
  let links = [];
  let bodySpecimen = "";
  let bodyStress = provider.risk() / 100;
  let bodyHover = -1;
  let bodyPinned = -1;
  let bodyPointer = null;
  let bodyPointerFrame = 0;
  let drawnNodes = [];

  function setupBody() {
    if (bodySpecimen === visualSpecimen && nodes.length) return;
    bodySpecimen = visualSpecimen;
    const random = randomFactory(visualSpecimen + ":body");
    nodes = Array.from({ length: 36 }, (_, index) => {
      const column = index / 35;
      const envelope = Math.sin(column * Math.PI);
      return {
        x: 0.12 + column * 0.76 + (random() - 0.5) * 0.055,
        y: 0.5 + (random() - 0.5) * (0.18 + envelope * 0.5),
        r: 1.4 + random() * 2.5,
        phase: random() * Math.PI * 2,
        signal: random()
      };
    });
    links = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.17 && random() > 0.3) links.push([i, j, random()]);
      }
    }
    bodyHover = -1;
    bodyPinned = -1;
    byId("node-inspector").hidden = true;
  }

  function bodyNodeData(index) {
    const random = randomFactory(visualSpecimen + ":node:" + index);
    const start = index * 512;
    return {
      id: 418 + index * 7,
      region: 1 + Math.floor(index / 6),
      weights: "W[" + start + ":" + (start + 511) + "]",
      activity: (0.42 + random() * 0.51).toFixed(3),
      entropy: (0.91 + random() * 0.088).toFixed(3),
      input: (random() * 1.2 - 0.1).toFixed(4),
      weight: (random() * 2 - 1).toFixed(4),
      output: (random() * 0.88).toFixed(4),
      layer: "L" + String(1 + Math.floor(index / 5)).padStart(2, "0"),
      block: 8 + index,
      integrity: state.integrity.toFixed(0) + "%"
    };
  }

  function drawBody(time) {
    const canvas = byId("body-canvas");
    setupBody();
    const size = sizeCanvas(canvas);
    const context = canvas.getContext("2d");
    const targetStress = provider.risk() / 100;
    bodyStress += (targetStress - bodyStress) * (reducedMotion ? 1 : 0.055);
    const dead = state.mode === "DEAD";
    const tun = state.mode === "TUN";
    const breathAmount = dead ? 0 : tun ? 0.004 : 0.018 * (1 - bodyStress * 0.55);
    const breath = reducedMotion ? 1 : 1 + Math.sin(time * 0.00075) * breathAmount;
    const contraction = dead ? 0.55 : (1 - bodyStress * 0.17 - (tun ? 0.06 : 0)) * breath;
    const instability = bodyStress > 0.45 && !tun && !dead ? (bodyStress - 0.45) * 3.2 : 0;
    context.clearRect(0, 0, size.width, size.height);
    context.save();
    context.scale(size.ratio, size.ratio);
    drawnNodes = nodes.map((node) => ({
      x: size.cssWidth / 2 + (node.x - 0.5) * size.cssWidth * contraction,
      y: size.cssHeight / 2 + (node.y - 0.5) * size.cssHeight * contraction +
        (reducedMotion ? 0 : Math.sin(time * 0.0014 + node.phase) * instability)
    }));
    context.lineWidth = 0.65;
    links.forEach((link) => {
      const a = drawnNodes[link[0]];
      const b = drawnNodes[link[1]];
      const near = bodyHover >= 0 && (link[0] === bodyHover || link[1] === bodyHover);
      const pinned = bodyPinned >= 0 && (link[0] === bodyPinned || link[1] === bodyPinned);
      const pulse = reducedMotion ? 0.12 : 0.09 + Math.max(0, Math.sin(time * 0.0015 + link[2] * 8)) * 0.11;
      const alpha = dead ? 0.04 : pinned ? 0.62 : near ? 0.48 : pulse * (tun ? 0.4 : 1);
      context.strokeStyle = rgba("ivory", alpha);
      context.lineWidth = pinned || near ? 1.05 : 0.65;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    });
    nodes.forEach((node, index) => {
      const point = drawnNodes[index];
      const dx = bodyHover >= 0 ? drawnNodes[bodyHover].x - point.x : 999;
      const dy = bodyHover >= 0 ? drawnNodes[bodyHover].y - point.y : 999;
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 82);
      const selected = index === bodyPinned;
      const focused = index === bodyHover;
      const wave = bodyHover < 0 ? 0 : Math.max(0, Math.sin(time * 0.005 - Math.hypot(dx, dy) * 0.08)) * proximity;
      const glow = dead ? 0.08 : selected ? 0.95 : focused ? 0.82 : 0.34 + proximity * 0.26 + wave * 0.3;
      context.fillStyle = rgba(index % 7 === 0 ? "terracotta" : "ivory", glow);
      context.beginPath();
      context.arc(point.x, point.y, node.r + (focused ? 1.4 : selected ? 1 : 0), 0, Math.PI * 2);
      context.fill();
      if (selected) {
        context.strokeStyle = color("terracotta");
        context.lineWidth = 0.7;
        context.beginPath();
        context.arc(point.x, point.y, node.r + 5, 0, Math.PI * 2);
        context.stroke();
      }
    });
    context.restore();
    if (!reducedMotion) requestAnimationFrame(drawBody);
  }

  function nearestBodyNode(point) {
    let nearest = -1;
    let distance = 28;
    drawnNodes.forEach((node, index) => {
      const current = Math.hypot(node.x - point.x, node.y - point.y);
      if (current < distance) {
        nearest = index;
        distance = current;
      }
    });
    return { index: nearest, distance: distance };
  }

  function processBodyPointer() {
    bodyPointerFrame = 0;
    if (!bodyPointer) return;
    const canvas = byId("body-canvas");
    const rect = canvas.getBoundingClientRect();
    const local = { x: bodyPointer.clientX - rect.left, y: bodyPointer.clientY - rect.top };
    const nearest = nearestBodyNode(local);
    bodyHover = nearest.index;
    if (bodyHover < 0) {
      hideProbe("body");
      return;
    }
    const data = bodyNodeData(bodyHover);
    byId("body-region").textContent = data.weights;
    byId("body-entropy").textContent = data.entropy;
    byId("body-variance").textContent = (M.SPECIMENS[visualSpecimen].variance * (0.9 + bodyHover % 5 * 0.035)).toFixed(4);
    showProbe("body", "REGION " + String(data.region).padStart(2, "0"), [
      ["weights", data.weights],
      ["activity", data.activity],
      ["entropy", data.entropy],
      ["integrity", data.integrity]
    ], eventPoint(bodyPointer));
  }

  function renderNodeInspector(index) {
    const inspector = byId("node-inspector");
    if (index < 0) {
      inspector.hidden = true;
      return;
    }
    const data = bodyNodeData(index);
    inspector.hidden = false;
    inspector.innerHTML = "<strong>NODE / " + String(data.id).padStart(4, "0") + "</strong><dl>" +
      "<div><dt>layer</dt><dd>" + data.layer + "</dd></div>" +
      "<div><dt>input</dt><dd>" + data.input + "</dd></div>" +
      "<div><dt>weight</dt><dd>" + data.weight + "</dd></div>" +
      "<div><dt>output</dt><dd>" + data.output + "</dd></div>" +
      "<div><dt>origin</dt><dd>HKDF block " + data.block + "</dd></div>" +
      "<div><dt>status</dt><dd>" + (state.mode === "DEAD" ? "failed" : "stable") + "</dd></div></dl>";
    M.setContext({
      type: "node",
      label: "node " + String(data.id).padStart(4, "0"),
      text: "NODE / " + String(data.id).padStart(4, "0") + "\nLAYER " + data.layer + "\nINPUT " + data.input + "\nWEIGHT " + data.weight + "\nOUTPUT " + data.output + "\nORIGIN HKDF block " + data.block + "\nSTATUS " + (state.mode === "DEAD" ? "failed" : "stable")
    });
  }

  const bodyCanvas = byId("body-canvas");
  bodyCanvas.addEventListener("pointermove", (event) => {
    bodyPointer = event;
    moveProbe("body", eventPoint(event));
    if (!bodyPointerFrame) bodyPointerFrame = requestAnimationFrame(processBodyPointer);
  });
  bodyCanvas.addEventListener("pointerleave", () => {
    bodyPointer = null;
    bodyHover = -1;
    hideProbe("body");
  });
  bodyCanvas.addEventListener("click", (event) => {
    const rect = bodyCanvas.getBoundingClientRect();
    const nearest = nearestBodyNode({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    bodyPinned = nearest.distance < 28 ? nearest.index : bodyHover;
    renderNodeInspector(bodyPinned);
  });

  let weightHover = -1;
  let weightPinned = -1;

  function weightAt(specimen, index) {
    const random = randomFactory(specimen + ":weight:" + index);
    return {
      value: random() * 2 - 1,
      layer: 1 + Math.floor(index / 32),
      block: Math.floor(index / 16),
      entropy: 0.94 + random() * 0.059,
      stability: 99.991 + random() * 0.009
    };
  }

  function inspectWeight(index, specimen) {
    specimen = specimen || visualSpecimen;
    const value = weightAt(specimen, index);
    document.querySelector(".weight-index").textContent = "W[" + index + "]";
    byId("weight-value").textContent = (value.value >= 0 ? "+" : "") + value.value.toFixed(5);
    byId("weight-layer").textContent = "L" + String(value.layer).padStart(2, "0");
    byId("weight-origin").textContent = "HKDF block " + value.block;
    byId("weight-stability").textContent = value.stability.toFixed(3) + "%";
    return value;
  }

  function markWeightNeighborhood(index) {
    const cells = Array.from(byId("fingerprint-grid").children);
    const columns = innerWidth <= 560 ? 16 : 32;
    cells.forEach((cell, current) => {
      const distance = Math.abs(current - index);
      const neighbor = distance === 1 || distance === columns;
      cell.classList.toggle("is-preview", current === index);
      cell.classList.toggle("is-neighbor", neighbor);
      cell.classList.toggle("is-locked", current === weightPinned);
    });
    byId("fingerprint-grid").classList.toggle("is-probing", index >= 0);
  }

  function buildFingerprint(specimen) {
    visualSpecimen = specimen || visualSpecimen;
    const grid = byId("fingerprint-grid");
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 256; index += 1) {
      const weight = weightAt(visualSpecimen, index);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "weight-cell";
      cell.setAttribute("aria-label", "Weight " + index + ": " + weight.value.toFixed(5));
      cell.tabIndex = index === 0 ? 0 : -1;
      cell.dataset.index = String(index);
      cell.dataset.sign = weight.value >= 0 ? "positive" : "negative";
      cell.style.setProperty("--cell", String(Math.round(28 + Math.abs(weight.value) * 58)));
      fragment.append(cell);
    }
    grid.replaceChildren(fragment);
    byId("fingerprint-root").textContent = M.short(M.SPECIMENS[visualSpecimen].root);
    inspectWeight(weightPinned >= 0 ? weightPinned : 271, visualSpecimen);
  }

  const fingerprint = byId("fingerprint-grid");
  fingerprint.addEventListener("pointerover", (event) => {
    const cell = event.target.closest("[data-index]");
    if (!cell) return;
    weightHover = Number(cell.dataset.index);
    const value = inspectWeight(weightHover);
    markWeightNeighborhood(weightHover);
    showProbe("weight", "W[" + weightHover + "]", [
      ["value", (value.value >= 0 ? "+" : "") + value.value.toFixed(5)],
      ["layer", "L" + String(value.layer).padStart(2, "0")],
      ["block", String(value.block)],
      ["entropy", value.entropy.toFixed(4)],
      ["stability", value.stability.toFixed(3) + "%"]
    ], eventPoint(event));
  });
  fingerprint.addEventListener("pointermove", (event) => moveProbe("weight", eventPoint(event)));
  fingerprint.addEventListener("pointerleave", () => {
    weightHover = -1;
    hideProbe("weight");
    markWeightNeighborhood(weightPinned);
    inspectWeight(weightPinned >= 0 ? weightPinned : 271);
  });
  fingerprint.addEventListener("focusin", (event) => {
    const cell = event.target.closest("[data-index]");
    if (!cell) return;
    weightHover = Number(cell.dataset.index);
    const value = inspectWeight(weightHover);
    markWeightNeighborhood(weightHover);
    showProbe("weight", "W[" + weightHover + "]", [["value", value.value.toFixed(5)], ["layer", "L" + String(value.layer).padStart(2, "0")], ["entropy", value.entropy.toFixed(4)]], elementPoint(cell));
  });
  fingerprint.addEventListener("focusout", () => hideProbe("weight"));
  fingerprint.addEventListener("click", (event) => {
    const cell = event.target.closest("[data-index]");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    weightPinned = weightPinned === index ? -1 : index;
    markWeightNeighborhood(weightPinned >= 0 ? weightPinned : index);
    if (weightPinned >= 0) {
      const value = inspectWeight(weightPinned);
      M.setContext({
        type: "weight",
        label: "W[" + weightPinned + "]",
        text: "W[" + weightPinned + "]\nVALUE " + value.value.toFixed(5) + "\nLAYER L" + String(value.layer).padStart(2, "0") + "\nBLOCK " + value.block + "\nENTROPY " + value.entropy.toFixed(4) + "\nSTABILITY " + value.stability.toFixed(3) + "%"
      });
    }
  });
  fingerprint.addEventListener("keydown", (event) => {
    const cell = event.target.closest("[data-index]");
    if (!cell || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const columns = innerWidth <= 560 ? 16 : 32;
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    const next = Math.max(0, Math.min(255, Number(cell.dataset.index) + offsets[event.key]));
    const target = fingerprint.querySelector("[data-index=\"" + next + "\"]");
    if (target) {
      cell.tabIndex = -1;
      target.tabIndex = 0;
      target.focus();
    }
  });

  const TRACE = {
    seed: ["GENESIS MATERIAL", [["status", "protocol model"], ["publication", "never published"], ["role", "origin of identity"]]],
    private: ["PRIVATE KEY / sk", [["status", "not present in console"], ["mutation", "forbidden"], ["role", "identity substrate"]]],
    ed25519: ["PUBLIC DERIVATION", [["operation", "proposed ed25519(sk)"], ["implementation", "not present"], ["property", "deterministic"]]],
    public: ["PUBLIC IDENTITY", [["scheme", "illustrative did:milono"], ["visibility", "public fixture"], ["verification", "local only"]]],
    hkdf: ["BODY DERIVATION", [["operation", "proposed HKDF-SHA256"], ["implementation", "fixture generator"], ["output", "simulated parameters"]]],
    weights: ["WEIGHT BODY", [["parameters", "18,432 conceptual"], ["source", "public fixture"], ["drift", "0.000000% local"]]],
    commitment: ["IDENTITY BINDING", [["binding", "identity to body model"], ["status", "simulated"], ["mutation", "fails local invariant"]]],
    proof: ["PROOF MODEL", [["system", "interface sequence"], ["implementation", "no Groth16 verifier"], ["result", "local consistency"]]],
    transition: ["STATE TRANSITION", [["input", "simulated sensors + W"], ["output", "local record"], ["cadence", "4-8 seconds"]]],
    history: ["HISTORY MODEL", [["structure", "bounded local array"], ["link", "previous identifier"], ["continuity", "simulated"]]]
  };
  const TRACE_PATHS = {
    seed: ["seed"],
    private: ["seed", "private"],
    ed25519: ["seed", "private", "ed25519"],
    public: ["seed", "private", "ed25519", "public"],
    hkdf: ["seed", "private", "hkdf"],
    weights: ["seed", "private", "hkdf", "weights"],
    commitment: ["seed", "private", "ed25519", "public", "hkdf", "weights", "commitment"],
    proof: ["seed", "private", "ed25519", "public", "hkdf", "weights", "commitment", "proof"],
    transition: ["seed", "private", "ed25519", "public", "hkdf", "weights", "commitment", "proof", "transition"],
    history: ["seed", "private", "ed25519", "public", "hkdf", "weights", "commitment", "proof", "transition", "history"]
  };
  let selectedTrace = "hkdf";

  function renderTrace(key, transient) {
    const data = TRACE[key];
    if (!data) return;
    const lineage = TRACE_PATHS[key];
    const flow = document.querySelector(".trace-flow");
    flow.classList.toggle("is-tracing", transient);
    document.querySelectorAll("[data-trace]").forEach((node) => {
      const inPath = lineage.includes(node.dataset.trace);
      node.classList.toggle("is-lineage", inPath);
      node.classList.toggle("is-downstream", transient && !inPath);
      node.classList.toggle("is-selected", node.dataset.trace === selectedTrace);
    });
    document.querySelector(".trace-branch").classList.toggle("is-lineage", lineage.some((item) => ["ed25519", "public", "hkdf", "weights"].includes(item)));
    document.querySelector(".trace-join").classList.toggle("is-lineage", lineage.includes("commitment"));
    byId("trace-inspector-title").textContent = data[0];
    const fragment = document.createDocumentFragment();
    data[1].forEach((pair) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = pair[0];
      detail.textContent = pair[1];
      row.append(term, detail);
      fragment.append(row);
    });
    byId("trace-inspector-data").replaceChildren(fragment);
  }

  document.querySelectorAll("[data-trace]").forEach((button) => {
    button.addEventListener("pointerenter", (event) => {
      const key = button.dataset.trace;
      renderTrace(key, true);
      showProbe("trace", TRACE[key][0], TRACE[key][1], eventPoint(event));
    });
    button.addEventListener("pointermove", (event) => moveProbe("trace", eventPoint(event)));
    button.addEventListener("pointerleave", () => {
      hideProbe("trace");
      renderTrace(selectedTrace, false);
    });
    button.addEventListener("focus", () => {
      const key = button.dataset.trace;
      renderTrace(key, true);
      showProbe("trace", TRACE[key][0], TRACE[key][1], elementPoint(button));
    });
    button.addEventListener("blur", () => {
      hideProbe("trace");
      renderTrace(selectedTrace, false);
    });
    button.addEventListener("click", () => {
      selectedTrace = button.dataset.trace;
      renderTrace(selectedTrace, false);
      M.setContext({ type: "identity", label: "identity step " + selectedTrace, text: TRACE[selectedTrace][0] + "\n" + TRACE[selectedTrace][1].map((row) => row[0].toUpperCase() + " " + row[1]).join("\n") });
    });
  });

  let metabolismHover = -1;
  let metabolismPinned = -1;
  let metabolismTarget = state.metabolism.slice();
  let metabolismDisplay = state.metabolism.slice();
  let metabolismStart = performance.now();
  let metabolismFrame = 0;

  function specimenProfile(specimen) {
    if (specimen === state.specimen) return state.metabolism.slice();
    const base = { A: 81.72, B: 76.48, C: 87.16 }[specimen];
    const efficiency = M.SPECIMENS[specimen].efficiency;
    return Array.from({ length: Math.max(56, state.metabolism.length) }, (_, index) =>
      Number((base + Math.sin(index * 0.37 + specimen.charCodeAt(0)) * (1.25 - efficiency / 100) * 5 - (55 - index) * 0.014).toFixed(3))
    );
  }

  function metabolismPoint(index, values) {
    const current = values[index];
    const previous = values[Math.max(0, index - 1)];
    const cycle = state.epoch - (values.length - 1 - index);
    const cost = provider.metrics().cost + Math.abs(current - previous) * 0.00042;
    const timestamp = state.lastTransitionAt - (values.length - 1 - index) * 6200;
    const history = state.history.find((entry) => entry.number === cycle);
    return { cycle: cycle, reserve: current, cost: cost, timestamp: timestamp, mode: history ? history.to : state.mode };
  }

  function drawMetabolism(now) {
    metabolismFrame = 0;
    const canvas = byId("metabolism-canvas");
    const size = sizeCanvas(canvas);
    const context = canvas.getContext("2d");
    if (metabolismDisplay.length !== metabolismTarget.length) metabolismDisplay = metabolismTarget.slice();
    let unsettled = false;
    metabolismDisplay = metabolismDisplay.map((value, index) => {
      const target = metabolismTarget[index];
      const next = value + (target - value) * (reducedMotion ? 1 : 0.14);
      if (Math.abs(next - target) > 0.001) unsettled = true;
      return next;
    });
    const reveal = reducedMotion ? 1 : Math.min(1, (now - metabolismStart) / 620);
    const values = metabolismDisplay;
    const min = Math.min.apply(null, values) - 0.8;
    const max = Math.max.apply(null, values) + 0.8;
    context.clearRect(0, 0, size.width, size.height);
    context.save();
    context.scale(size.ratio, size.ratio);
    context.strokeStyle = rgba("ivory", .08);
    context.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      context.beginPath();
      context.moveTo(0, size.cssHeight * i / 4);
      context.lineTo(size.cssWidth, size.cssHeight * i / 4);
      context.stroke();
    }
    context.strokeStyle = state.mode === "TUN" || state.mode === "DEAD" ? color("text-muted") : color("ivory");
    context.lineWidth = 1;
    context.beginPath();
    const limit = Math.max(2, Math.floor(values.length * reveal));
    values.slice(0, limit).forEach((value, index) => {
      const x = index / Math.max(1, values.length - 1) * size.cssWidth;
      const y = size.cssHeight - 12 - (value - min) / Math.max(0.1, max - min) * (size.cssHeight - 24);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
    const inspected = metabolismHover >= 0 ? metabolismHover : metabolismPinned;
    if (inspected >= 0 && inspected < values.length) {
      const x = inspected / Math.max(1, values.length - 1) * size.cssWidth;
      const value = values[inspected];
      const y = size.cssHeight - 12 - (value - min) / Math.max(0.1, max - min) * (size.cssHeight - 24);
      context.strokeStyle = rgba("ivory", .25);
      context.lineWidth = 0.65;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, size.cssHeight);
      context.stroke();
      context.fillStyle = color("terracotta");
      context.beginPath();
      context.arc(x, y, metabolismPinned === inspected ? 3.2 : 2.5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
    if (unsettled || reveal < 1) scheduleMetabolism();
  }

  function scheduleMetabolism() {
    if (!metabolismFrame) metabolismFrame = requestAnimationFrame(drawMetabolism);
  }

  function metabolismIndexFromEvent(event) {
    const rect = byId("metabolism-canvas").getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return Math.round(ratio * (metabolismDisplay.length - 1));
  }

  function showMetabolismProbe(event, index) {
    const point = metabolismPoint(index, metabolismDisplay);
    showProbe("metabolism", "CYCLE " + String(point.cycle).padStart(5, "0"), [
      ["reserve", point.reserve.toFixed(2) + "%"],
      ["cost", point.cost.toFixed(5)],
      ["state", point.mode],
      ["timestamp", new Date(point.timestamp).toISOString().slice(11, 19) + " UTC"]
    ], eventPoint(event));
  }

  const metabolismCanvas = byId("metabolism-canvas");
  metabolismCanvas.addEventListener("pointermove", (event) => {
    const index = metabolismIndexFromEvent(event);
    if (index !== metabolismHover) {
      metabolismHover = index;
      showMetabolismProbe(event, metabolismHover);
    } else {
      moveProbe("metabolism", eventPoint(event));
    }
    scheduleMetabolism();
  });
  metabolismCanvas.addEventListener("pointerleave", () => {
    metabolismHover = -1;
    hideProbe("metabolism");
    scheduleMetabolism();
  });
  metabolismCanvas.addEventListener("click", (event) => {
    const index = metabolismIndexFromEvent(event);
    const rect = metabolismCanvas.getBoundingClientRect();
    const values = metabolismDisplay;
    const min = Math.min.apply(null, values) - 0.8;
    const max = Math.max.apply(null, values) + 0.8;
    const expectedY = rect.bottom - 12 - (values[index] - min) / Math.max(0.1, max - min) * (rect.height - 24);
    if (Math.abs(event.clientY - expectedY) > 24) {
      metabolismPinned = -1;
      byId("metabolism-inspector").hidden = true;
      scheduleMetabolism();
      return;
    }
    metabolismPinned = index;
    const point = metabolismPoint(index, values);
    const inspector = byId("metabolism-inspector");
    inspector.hidden = false;
    inspector.innerHTML = "<strong>INSPECTING / CYCLE " + String(point.cycle).padStart(5, "0") + "</strong><dl>" +
      "<div><dt>state</dt><dd>" + point.mode + "</dd></div>" +
      "<div><dt>reserve</dt><dd>" + point.reserve.toFixed(2) + "%</dd></div>" +
      "<div><dt>compute cost</dt><dd>" + point.cost.toFixed(5) + "</dd></div>" +
      "<div><dt>weight root</dt><dd>" + M.short(M.SPECIMENS[state.specimen].root) + "</dd></div>" +
      "<div><dt>transition</dt><dd>SIMULATED PASS</dd></div></dl>";
    M.setContext({ type: "cycle", label: "cycle " + point.cycle, text: "CYCLE " + String(point.cycle).padStart(5, "0") + "\nSTATE " + point.mode + "\nRESERVE " + point.reserve.toFixed(2) + "%\nCOMPUTE COST " + point.cost.toFixed(5) + "\nWEIGHT ROOT " + M.short(M.SPECIMENS[state.specimen].root) + "\nTRANSITION SIMULATED" });
    scheduleMetabolism();
  });

  const PROOF_DETAILS = {
    "loading commitment": [["commitment", "fixture root bound"], ["status", "local model"]],
    "checking witness": [["witness", "not present"], ["status", "interface simulation"]],
    "validating constraints": [["constraints", "illustrative count"], ["result", "local pass"]],
    "verifying proof": [["proof", "not implemented"], ["result", "simulated consistency"]],
    "matching identity": [["identity", "fixture matches commitment"], ["invariant", "local pass"]]
  };

  function verifyProof() {
    const button = byId("verify-proof");
    const result = byId("proof-result");
    const steps = Array.from(byId("proof-sequence").children);
    button.disabled = true;
    result.textContent = "VERIFYING";
    steps.forEach((step) => step.className = "");
    steps.forEach((step, index) => {
      setTimeout(() => {
        if (index) steps[index - 1].className = "is-pass";
        step.className = "is-active";
        if (index === steps.length - 1) {
          setTimeout(() => {
            step.className = "is-pass";
            result.textContent = "LOCAL PASS";
            button.disabled = false;
          }, 190);
        }
      }, index * 190);
    });
  }

  byId("verify-proof").addEventListener("click", verifyProof);
  byId("proof-sequence").addEventListener("pointerover", (event) => {
    const item = event.target.closest("li");
    if (!item) return;
    const key = item.textContent.trim().toLowerCase();
    showProbe("proof", key.toUpperCase(), PROOF_DETAILS[key] || [["status", "LOCAL PASS"]], eventPoint(event));
  });
  byId("proof-sequence").addEventListener("pointermove", (event) => moveProbe("proof", eventPoint(event)));
  byId("proof-sequence").addEventListener("pointerleave", () => hideProbe("proof"));
  byId("proof-sequence").addEventListener("click", (event) => {
    const item = event.target.closest("li");
    if (!item) return;
    const key = item.textContent.trim().toLowerCase();
    showProbe("proof", key.toUpperCase(), PROOF_DETAILS[key] || [["status", "LOCAL PASS"]], elementPoint(item));
  });
  document.querySelector(".proof-metrics").addEventListener("pointerover", (event) => {
    const row = event.target.closest("button");
    if (!row || !row.querySelector(".metric-label")) return;
    const key = row.querySelector(".metric-label").textContent.trim().toLowerCase();
    const detail = key === "constraints" ? [["count", "illustrative 218,441"], ["status", "simulated"]] :
      key === "commitment" ? [["binding", "fixture body to identity"], ["status", "LOCAL PASS"]] :
      key === "verification" ? [["fixture body", "matches local commitment"], ["result", "LOCAL PASS"]] :
      [[key, row.querySelector(".metric-value").textContent], ["status", "SIMULATED"]];
    showProbe("proof-metric", key.toUpperCase(), detail, eventPoint(event));
  });
  document.querySelector(".proof-metrics").addEventListener("pointermove", (event) => moveProbe("proof-metric", eventPoint(event)));
  document.querySelector(".proof-metrics").addEventListener("pointerleave", () => hideProbe("proof-metric"));
  document.querySelector(".proof-metrics").addEventListener("click", (event) => {
    const row = event.target.closest("button");
    if (!row || !row.querySelector(".metric-label")) return;
    const key = row.querySelector(".metric-label").textContent.trim().toLowerCase();
    const detail = key === "constraints" ? [["count", "illustrative 218,441"], ["status", "simulated"]] :
      key === "verification" ? [["fixture body", "matches local commitment"], ["result", "LOCAL PASS"]] :
      [[key, row.querySelector(".metric-value").textContent], ["status", "SIMULATED"]];
    showProbe("proof-metric", key.toUpperCase(), detail, elementPoint(row));
  });

  const ledgerStrip = byId("ledger-strip");
  ledgerStrip.addEventListener("pointerover", (event) => {
    const block = event.target.closest("[data-transition]");
    const link = event.target.closest("[data-link-from]");
    if (block) {
      const current = provider.getState();
      const entry = current.history.find((item) => item.number === Number(block.dataset.transition));
      if (!entry) return;
      const age = Math.max(0, (Date.now() - entry.timestamp) / 1000);
      showProbe("ledger", "#" + entry.number, [
        ["operation", entry.action.toUpperCase()],
        ["state", entry.from + " -> " + entry.to],
        ["age", age.toFixed(3) + "s ago"],
        ["integrity", "SIMULATED"]
      ], eventPoint(event));
    } else if (link) {
      showProbe("ledger", "HASH LINK", [
        ["from", "#" + link.dataset.linkFrom],
        ["to", "#" + link.dataset.linkTo],
        ["continuity", "VALID"]
      ], eventPoint(event));
    }
  });
  ledgerStrip.addEventListener("pointermove", (event) => moveProbe("ledger", eventPoint(event)));
  ledgerStrip.addEventListener("pointerleave", () => hideProbe("ledger"));
  ledgerStrip.addEventListener("click", (event) => {
    const link = event.target.closest("[data-link-from]");
    if (!link) return;
    showProbe("ledger", "HASH LINK", [["from", "#" + link.dataset.linkFrom], ["to", "#" + link.dataset.linkTo], ["continuity", "VALID"]], elementPoint(link));
  });

  const STRUCTURE_DETAILS = {
    "seed sk": [["role", "genesis material"], ["status", "protocol model"], ["output", "identity + body"]],
    "w = hkdf(sk)": [["role", "proposed body derivation"], ["parameters", "18,432 conceptual"], ["implementation", "fixture"]],
    "commitment": [["role", "identity binding"], ["input", "weight root"], ["verification", "local simulation"]],
    "history": [["role", "bounded local memory"], ["link", "previous identifier"], ["signature", "not implemented"]],
    "molt 0 genesis": [["block", "genesis fixture"], ["previous", "none"], ["continuity", "SIMULATED"]],
    "molt 1 prev hash": [["block", "transition 1"], ["previous", "molt 0"], ["continuity", "SIMULATED"]],
    "molt 2 prev hash": [["block", "transition 2"], ["previous", "molt 1"], ["continuity", "SIMULATED"]]
  };
  document.querySelectorAll(".diagram .node").forEach((node) => {
    const labels = Array.from(node.querySelectorAll("text")).map((text) => text.textContent.trim());
    const key = labels.join(" ").toLowerCase().replace(/\s+/g, " ");
    const details = STRUCTURE_DETAILS[key] || [["structure", key], ["status", "inspectable"]];
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.addEventListener("pointerenter", (event) => showProbe("structure", key.toUpperCase(), details, eventPoint(event)));
    node.addEventListener("pointermove", (event) => moveProbe("structure", eventPoint(event)));
    node.addEventListener("pointerleave", () => hideProbe("structure"));
    node.addEventListener("focus", () => showProbe("structure", key.toUpperCase(), details, elementPoint(node)));
    node.addEventListener("blur", () => hideProbe("structure"));
    node.addEventListener("click", () => {
      showProbe("structure", key.toUpperCase(), details, elementPoint(node));
      M.setContext({ type: "structure", label: key, text: key.toUpperCase() + "\n" + details.map((row) => row[0].toUpperCase() + " " + row[1]).join("\n") });
    });
  });

  const STATE_DETAILS = {
    ACTIVE: [["process", "sensing / deciding / acting"], ["history", "writing transitions"], ["metabolism", "running"]],
    TUN: [["metabolism", "suspended"], ["identity", "preserved"], ["history", "paused"]],
    DEAD: [["identity", "invariant failed"], ["recovery", "irreversible"], ["simulation", "confirmation required"]]
  };

  function closeStateConfirm() {
    const panel = document.querySelector(".state-confirm");
    if (panel) panel.remove();
  }

  function confirmDeath(anchor) {
    closeStateConfirm();
    const panel = document.createElement("div");
    panel.className = "state-confirm";
    panel.innerHTML = "<strong>SIMULATE IDENTITY FAILURE?</strong><p>DEAD is irreversible for this specimen.</p><div><button type=\"button\" data-death-cancel>CANCEL</button><button type=\"button\" data-death-confirm>CONFIRM</button></div>";
    document.querySelector(".states").append(panel);
    panel.querySelector("[data-death-cancel]").addEventListener("click", closeStateConfirm);
    panel.querySelector("[data-death-confirm]").addEventListener("click", () => {
      provider.simulateDeath();
      M.setContext({ type: "state", label: "state DEAD", text: "DEAD\nIDENTITY INVARIANT FAILED\nRECOVERY IRREVERSIBLE\nSPECIMEN STATE SEALED" });
      closeStateConfirm();
    });
    panel.querySelector("[data-death-cancel]").focus();
  }

  const stateNodes = Array.from(document.querySelectorAll(".states .snode"));
  stateNodes.forEach((node) => {
    const mode = node.textContent.trim().toUpperCase();
    node.dataset.stateControl = mode;
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", mode + " state simulation");
    node.addEventListener("pointerenter", (event) => showProbe("state", mode, STATE_DETAILS[mode], eventPoint(event)));
    node.addEventListener("pointermove", (event) => moveProbe("state", eventPoint(event)));
    node.addEventListener("pointerleave", () => hideProbe("state"));
    node.addEventListener("focus", () => showProbe("state", mode, STATE_DETAILS[mode], elementPoint(node)));
    node.addEventListener("blur", () => hideProbe("state"));
    const activate = () => {
      if (mode === "DEAD") {
        confirmDeath(node);
        return;
      }
      const changed = provider.simulateMode(mode);
      if (changed) M.setContext({ type: "state", label: "state " + mode, text: mode + "\n" + STATE_DETAILS[mode].map((row) => row[0].toUpperCase() + " " + row[1]).join("\n") });
    };
    node.addEventListener("click", activate);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll(".stress-controls label").forEach((label) => {
    const input = label.querySelector("input");
    const name = label.querySelector("span").textContent.trim().toUpperCase();
    input.addEventListener("pointerenter", (event) => showProbe("stress", name, [["value", Number(input.value).toFixed(1) + "%"], ["system risk", provider.risk().toFixed(2)]], eventPoint(event)));
    input.addEventListener("pointermove", (event) => {
      showProbe("stress", name, [["value", Number(input.value).toFixed(1) + "%"], ["system risk", provider.risk().toFixed(2)]], eventPoint(event));
    });
    input.addEventListener("pointerleave", () => hideProbe("stress"));
    input.addEventListener("pointerdown", () => input.classList.add("is-dragging"));
    input.addEventListener("pointerup", () => input.classList.remove("is-dragging"));
    input.addEventListener("focus", () => showProbe("stress", name, [["value", Number(input.value).toFixed(1) + "%"], ["system risk", provider.risk().toFixed(2)]], elementPoint(input)));
    input.addEventListener("blur", () => hideProbe("stress"));
  });
  document.querySelectorAll(".threshold-marker").forEach((marker) => {
    const show = () => showProbe("threshold", "CRYPTOSIS THRESHOLD", [
      ["boundary", marker.classList.contains("inverse") ? "below 30%" : "above 70%"],
      ["effect", "continued activity becomes unsustainable"],
      ["response", "enter TUN"]
    ], elementPoint(marker));
    marker.addEventListener("pointerenter", show);
    marker.addEventListener("pointerleave", () => hideProbe("threshold"));
    marker.addEventListener("focus", show);
    marker.addEventListener("blur", () => hideProbe("threshold"));
  });

  const specimenTabs = document.querySelector(".specimen-tabs");
  let comparisonAnchor = state.specimen;
  let compareSpecimen = null;
  let compareArmed = false;
  let previewSpecimen = null;
  const SPECIMEN_ENTROPY = { A: 0.81, B: 0.88, C: 0.94 };
  const METRIC_HELP = {
    stability: "resistance to transition variance",
    entropy: "dispersion across derived parameters",
    efficiency: "reserve retained per compute cycle",
    variance: "response spread under equal stimulus"
  };

  function specimenRows(key) {
    const specimen = M.SPECIMENS[key];
    return [
      ["stability", specimen.stability.toFixed(1)],
      ["entropy", SPECIMEN_ENTROPY[key].toFixed(2)],
      ["efficiency", specimen.efficiency.toFixed(1)],
      ["variance", specimen.variance.toFixed(3)]
    ];
  }

  function renderComparison() {
    const displayKey = previewSpecimen || state.specimen;
    const specimen = M.SPECIMENS[displayKey];
    document.querySelectorAll("[data-specimen]").forEach((button) => {
      const key = button.dataset.specimen;
      button.classList.toggle("is-preview", key === previewSpecimen);
      button.classList.toggle("is-muted", Boolean(previewSpecimen) && key !== previewSpecimen);
      button.classList.toggle("is-compare", key === compareSpecimen);
      button.setAttribute("aria-selected", String(key === state.specimen));
    });
    byId("comparison-name").textContent = compareArmed && !compareSpecimen ?
      "SPECIMEN " + comparisonAnchor + " / SELECT SECOND SPECIMEN" :
      "SPECIMEN " + displayKey + " / " + specimen.code;
    byId("comparison-identity").textContent = specimen.identity;
    byId("comparison-variance").textContent = specimen.variance.toFixed(3);
    byId("comparison-stability").textContent = specimen.stability.toFixed(1) + "%";
    byId("comparison-bias").textContent = specimen.bias.toFixed(2);
    byId("comparison-efficiency").textContent = specimen.efficiency.toFixed(1) + "%";
    const matrix = byId("comparison-matrix");
    if (!compareSpecimen) {
      matrix.hidden = true;
      return;
    }
    matrix.hidden = false;
    const left = comparisonAnchor;
    const right = compareSpecimen;
    const leftRows = specimenRows(left);
    const rightRows = specimenRows(right);
    let content = "<div class=\"comparison-matrix-head\"><strong>COMPARE</strong><span>" + left + " &lt;-&gt; " + right + "</span></div>";
    content += "<div class=\"comparison-matrix-row comparison-matrix-label\"><span>metric</span><span>" + left + "</span><span>" + right + "</span></div>";
    leftRows.forEach((row, index) => {
      content += "<button type=\"button\" class=\"comparison-matrix-row\" data-metric=\"" + row[0] + "\"><span>" + row[0] + "</span><span>" + row[1] + "</span><span>" + rightRows[index][1] + "</span></button>";
    });
    matrix.innerHTML = content;
  }

  specimenTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-specimen]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const key = button.dataset.specimen;
    if (compareSpecimen) {
      if (key === comparisonAnchor) {
        compareSpecimen = null;
        compareArmed = true;
      } else {
        compareSpecimen = key;
      }
    } else if (compareArmed && key !== comparisonAnchor) {
      compareSpecimen = key;
      compareArmed = false;
      M.setContext({ type: "comparison", label: "comparison " + comparisonAnchor + " / " + key, text: "COMPARE " + comparisonAnchor + " <-> " + key + "\n" + specimenRows(comparisonAnchor).map((row, index) => row[0].toUpperCase() + " " + row[1] + " / " + specimenRows(key)[index][1]).join("\n") });
    } else {
      provider.setSpecimen(key);
      comparisonAnchor = key;
      compareSpecimen = null;
      compareArmed = true;
    }
    renderComparison();
  }, true);
  specimenTabs.addEventListener("pointerover", (event) => {
    const button = event.target.closest("[data-specimen]");
    if (!button) return;
    previewSpecimen = button.dataset.specimen;
    window.dispatchEvent(new CustomEvent("milono:specimen-preview", { detail: { specimen: previewSpecimen } }));
    renderComparison();
    const specimen = M.SPECIMENS[previewSpecimen];
    showProbe("specimen", "SPECIMEN " + previewSpecimen, [
      ["stability", specimen.stability.toFixed(1) + "%"],
      ["entropy", SPECIMEN_ENTROPY[previewSpecimen].toFixed(2)],
      ["efficiency", specimen.efficiency.toFixed(1) + "%"],
      ["behavior bias", specimen.bias.toFixed(2)]
    ], eventPoint(event));
  });
  specimenTabs.addEventListener("pointermove", (event) => moveProbe("specimen", eventPoint(event)));
  specimenTabs.addEventListener("pointerleave", () => {
    previewSpecimen = null;
    window.dispatchEvent(new CustomEvent("milono:specimen-preview", { detail: { specimen: null } }));
    hideProbe("specimen");
    renderComparison();
  });
  byId("comparison-matrix").addEventListener("pointerover", (event) => {
    const row = event.target.closest("[data-metric]");
    if (!row) return;
    const metric = row.dataset.metric;
    showProbe("comparison", metric.toUpperCase(), [["meaning", METRIC_HELP[metric]], ["comparison", comparisonAnchor + " vs " + compareSpecimen]], eventPoint(event));
  });
  byId("comparison-matrix").addEventListener("pointermove", (event) => moveProbe("comparison", eventPoint(event)));
  byId("comparison-matrix").addEventListener("pointerleave", () => hideProbe("comparison"));
  byId("comparison-matrix").addEventListener("click", (event) => {
    const row = event.target.closest("[data-metric]");
    if (!row) return;
    const metric = row.dataset.metric;
    showProbe("comparison", metric.toUpperCase(), [["meaning", METRIC_HELP[metric]], ["comparison", comparisonAnchor + " vs " + compareSpecimen]], elementPoint(row));
  });

  window.addEventListener("milono:specimen-preview", (event) => {
    visualSpecimen = event.detail.specimen || state.specimen;
    bodySpecimen = "";
    buildFingerprint(visualSpecimen);
    metabolismTarget = specimenProfile(visualSpecimen);
    scheduleMetabolism();
  });

  function renderStateControls() {
    stateNodes.forEach((node) => node.classList.toggle("is-current", node.dataset.stateControl === state.mode));
  }

  window.addEventListener("resize", () => {
    markWeightNeighborhood(weightHover >= 0 ? weightHover : weightPinned);
    scheduleMetabolism();
    if (reducedMotion) drawBody(0);
  });

  provider.subscribe((nextState) => {
    const specimenChanged = state.specimen !== nextState.specimen;
    state = nextState;
    if (!previewSpecimen) visualSpecimen = state.specimen;
    if (specimenChanged) {
      comparisonAnchor = state.specimen;
      bodySpecimen = "";
      weightPinned = -1;
      buildFingerprint(visualSpecimen);
    }
    metabolismTarget = specimenProfile(visualSpecimen);
    scheduleMetabolism();
    renderComparison();
    renderStateControls();
    if (bodyPinned >= 0) renderNodeInspector(bodyPinned);
  });

  renderTrace(selectedTrace, false);
  buildFingerprint(state.specimen);
  renderComparison();
  renderStateControls();
  metabolismStart = performance.now();
  scheduleMetabolism();
  drawBody(0);

  M.probe = { show: showProbe, move: moveProbe, hide: hideProbe };
})();
