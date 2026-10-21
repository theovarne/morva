import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const errors = [];

const required = [
  "README.md",
  "ARCHITECTURE.md",
  "PROTOCOL.md",
  "SPECIMEN.md",
  "ORGANISM.md",
  "INTERACTION.md",
  "SIMULATION.md",
  "THIRD_PARTY_NOTICES.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "package.json",
  "dist/index.html",
  "dist/robots.txt",
  "dist/sitemap.xml",
  "dist/vercel.json",
  "dist/assets/styles.css",
  "dist/brand/milono-logo-full.png", "dist/brand/morva-mark.png",
  "dist/brand/favicon.svg", "dist/brand/favicon.ico", "dist/favicon.ico",
  "dist/brand/favicon-16.png", "dist/brand/favicon-32.png", "dist/brand/favicon-48.png",
  "dist/brand/apple-touch-icon.png", "dist/brand/icon-192.png", "dist/brand/icon-512.png",
  "dist/brand/og-image.png", "dist/site.webmanifest", "docs/brand-system.md",
  "dist/assets/organism.js",
  "dist/assets/visuals.js",
  "dist/assets/amoeba.js",
  "dist/assets/amoeba.svg",
  "docs/identity.md",
  "docs/body-derivation.md",
  "docs/lifecycle.md",
  "docs/cryptobiosis.md",
  "docs/transition-ledger.md",
  "docs/metabolism.md",
  "docs/simulation.md",
  "docs/body-field.md", "docs/morphology.md", "docs/specimens.md",
  "docs/development.md", "docs/terminal.md", "docs/assets/research-console.png",
  ".github/ISSUE_TEMPLATE/feature_request.md", ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/pull_request_template.md", ".github/workflows/ci.yml", ".gitleaks.toml"
];

for (const file of required) {
  if (!existsSync(join(root, file))) errors.push(`missing required file: ${file}`);
}

const indexPath = join(root, "dist", "index.html");
const html = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";

for (const expected of [
  "<title>morva &mdash; Form changes. Identity remains.</title>",
  "<a class=\"brand\" href=\"./\"><img",
  "./brand/morva-mark.png",
  "The tardigrade is the water bear.",
  "Form changes. Identity remains.",
  "SIMULATED / LOCAL MODEL",
  "SimulationProvider",
  "./assets/organism.js",
  "./assets/visuals.js",
  "https://milono.xyz/",
  "<meta property=\"og:url\" content=\"https://milono.xyz/\">",
  "https://github.com/theovarne/morva",
  "https://x.com/ProjectMORVA"
]) {
  if (!html.includes(expected)) errors.push(`index.html missing required marker: ${expected}`);
}

if (html.includes('src="./assets/amoeba.js"')) errors.push("amoeba renderer unexpectedly loaded in tardigrade version");
if (html.includes("8HzSYtmSxBPQqCDevZHWY5DJvKRB25Lvh7vYYoK2pump") || html.includes("Du8TzQun4vnrSGncRzhsPbRYyKQUFJ5QP7dQ5Mu7pump") || html.includes("4cjLraGqbJciiaRbW8UFvntta84eBMeZ53zXB43Kpump")) errors.push("retired contract address restored");
if (!html.includes('<span class="addr" id="contract-address"></span>')) errors.push("CA address area must remain empty");
const webManifest = JSON.parse(readFileSync(join(root, "dist", "site.webmanifest"), "utf8"));
if (webManifest.name !== "MORVA" || webManifest.short_name !== "MORVA") errors.push("web manifest brand mismatch");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
if (manifest.name !== "morva" || lock.name !== "morva" || lock.packages?.[""]?.name !== "morva") {
  errors.push("package/lockfile brand mismatch");
}

const localHtmlReference = /(?:src|href)=["']([^"'#?]+)(?:\?[^"']*)?["']/g;
for (const match of html.matchAll(localHtmlReference)) {
  const value = match[1];
  if (/^(?:https?:|mailto:|data:|javascript:)/i.test(value)) continue;
  const target = resolve(join(root, "dist"), value);
  if (!target.startsWith(resolve(root, "dist"))) {
    errors.push(`unsafe local HTML path: ${value}`);
  } else if (!existsSync(target)) {
    errors.push(`broken local HTML reference: ${value}`);
  }
}

const markdownFiles = [
  ...readdirSync(root).filter(file => file.endsWith(".md")),
  ...readdirSync(join(root, "docs")).filter(file => file.endsWith(".md")).map(file => `docs/${file}`)
];
const readme = readFileSync(join(root, "README.md"), "utf8");
for (const marker of ["# MORVA", "## What is MORVA?", "Form changes. Identity remains.", "dist/brand/morva-logo.png", "## Status", "## Run Locally", "## License / Attribution", "https://milono.xyz/", "https://x.com/ProjectMORVA", "SIMULATION.md", "docs/terminal.md", "THIRD_PARTY_NOTICES.md"]) {
  if (!readme.includes(marker)) errors.push(`README missing required marker: ${marker}`);
}
if (/\b(?:MILNO|AMEBA|AMOEBA)\b/.test(readme)) errors.push("README contains retired public branding");
if (/https:\/\/(?:github\.com\/theovarne\/(?:AMEBA|MILNO)|x\.com\/(?:AMEBALIFE_|milno_token))(?:[\/\s\"')]|$)/i.test(readme + html)) {
  errors.push("retired official destination found");
}
const localMarkdownLink = /\[[^\]]+\]\(([^)\s#]+)(?:#[^)]+)?\)/g;
for (const file of markdownFiles) {
  const sourcePath = join(root, file);
  if (!existsSync(sourcePath)) continue;
  const source = readFileSync(sourcePath, "utf8");
  for (const match of source.matchAll(localMarkdownLink)) {
    const value = match[1];
    if (/^(?:https?:|mailto:)/i.test(value)) continue;
    const target = resolve(join(sourcePath, ".."), value.split("?")[0]);
    if (!existsSync(target)) errors.push(`broken Markdown link in ${file}: ${value}`);
  }
}

const ignoredDirectories = new Set([".git", "node_modules", "qa", ".sites-runtime", ".vercel"]);
const textExtensions = new Set([".md", ".html", ".css", ".js", ".mjs", ".json", ".txt"]);
const forbiddenNames = [/^\.env(?:\.|$)/i, /\.(?:pem|key|p12|pfx)$/i, /^(?:credentials|secrets)\.json$/i];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:API_KEY|PRIVATE_KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL|RPC_KEY|VERCEL_TOKEN)\s*[:=]\s*["'][^"']{8,}["']/i,
  /\bmnemonic\s*[:=]\s*["'][a-z]+(?:\s+[a-z]+){11,}["']/i
];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    const local = relative(root, absolute).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (forbiddenNames.some((pattern) => pattern.test(entry.name))) {
      errors.push(`forbidden sensitive filename: ${local}`);
    }
    if (!textExtensions.has(extname(entry.name).toLowerCase())) continue;
    const source = readFileSync(absolute, "utf8");
    if (/[A-Za-z]:\\(?:Users|Documents|Desktop)\\/i.test(source) || /file:\/\//i.test(source)) {
      errors.push(`local machine path found in: ${local}`);
    }
    if (secretPatterns.some((pattern) => pattern.test(source))) {
      errors.push(`possible embedded secret found in: ${local}`);
    }
  }
}

walk(root);

if (errors.length) {
  console.error("MORVA validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`MORVA validation passed (${required.length} required files checked).`);
