// One-time, reviewed brand migration. Explicit file/rule allowlist; never rewrites URLs globally.
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const root=process.cwd();
function patchFile(file,rules){
 const before=readFileSync(file,"utf8").replaceAll("\r\n","\n");
 let after=before;
 for(const [from,to] of rules)after=after.replaceAll(from,to);
 if(before===after)return;
 const oldLines=before.split("\n"),newLines=after.split("\n");
 if(oldLines.length!==newLines.length)throw new Error("Line-changing rule must use a manual patch: "+file);
 let patch="*** Begin Patch\n*** Update File: "+root.replaceAll("\\","/")+"/"+file+"\n";
 for(let i=0;i<oldLines.length;i++){
  if(oldLines[i]===newLines[i])continue;
  patch+="@@\n-"+oldLines[i]+"\n+"+newLines[i]+"\n";
 }
 patch+="*** End Patch";
 const result=spawnSync(process.env.AMEBA_CODEX,["--codex-run-as-apply-patch",patch],{encoding:"utf8"});
 if(result.status!==0)throw new Error(result.stderr||result.stdout);
 console.log(file);
}
const runtime=[["MilnoAmoeba","AmebaOrganism"],["window.Milno","window.Ameba"],["did:milno","did:ameba"],["milno:context","ameba:context"],["milno:specimen-preview","ameba:specimen-preview"],["MILNO","AMEBA"]];
for(const file of ["dist/assets/organism.js","dist/assets/amoeba.js","dist/assets/visuals.js"])patchFile(file,runtime);
patchFile("dist/index.html",[
 ["MILNO","AMEBA"],["did:milno","did:ameba"],["milno/genesis","ameba/genesis"],["milno@organism","ameba@organism"],
 ["<title>milno &mdash; cryptographic organism research console</title>","<title>AMEBA &mdash; Fluid Cryptographic Organism</title>"],
 ["milno — cryptographic organism research console","AMEBA — Fluid Cryptographic Organism"],
 ["A soft cryptographic organism. Form mutates. Identity persists. An interactive research model of fluid bodies and invariant identity.","AMEBA is a fluid cryptographic organism with mutable form and persistent identity."],
 [">milno</",">AMEBA</"],["AMEBA is a soft cryptographic organism.","AMEBA is a fluid cryptographic organism."],
 ["MUTABLE FORM / INVARIANT IDENTITY","MUTABLE IN FORM. PERSISTENT IN IDENTITY."],
 ["a milno starts","an AMEBA organism starts"],["Under stress milno","Under stress, AMEBA"],
 ["milno sensed","AMEBA sensed"],["Interactive milno laboratory terminal","Interactive AMEBA laboratory terminal"],
 ["milno research shell / simulation provider","AMEBA RESEARCH CONSOLE / SIMULATION PROVIDER"],
 ["Is milno trained?","Is AMEBA trained?"],["birth. milno has","birth. AMEBA has"],
 ["Can two milnos be the same?","Can two AMEBA organisms be the same?"],
 ["Every other milno is","Every other AMEBA organism is"],["and milno begin?","and AMEBA begin?"],
 ["primitive. milno gives","primitive. AMEBA gives"],['rel="noopener" aria-label="GitHub repository"','rel="noopener noreferrer" aria-label="GitHub repository"']
]);
const docs=["README.md","ARCHITECTURE.md","PROTOCOL.md","SPECIMEN.md","SECURITY.md","CONTRIBUTING.md","LICENSE",
 "docs/amoebic-body.md","docs/body-derivation.md","docs/identity.md","docs/lifecycle.md","docs/cryptobiosis.md","docs/metabolism.md","docs/transition-ledger.md","docs/simulation.md"];
for(const file of docs)patchFile(file,[["MILNO","AMEBA"],["did:milno","did:ameba"],["milno/body/","ameba/body/"],
 ["MILNO_CHROME","AMEBA_CHROME"],["MILNO_TEST_URL","AMEBA_TEST_URL"]]);
patchFile("README.md",[["milno/","ameba/"],["### A soft cryptographic organism with persistent identity.","### A fluid cryptographic organism with persistent identity."]]);
patchFile("SPECIMEN.md",[["# Specimens","# AMEBA Specimens"]]);
patchFile("SECURITY.md",[["# Security","# AMEBA Security"]]);
patchFile("package.json",[['"name": "milno"','"name": "ameba"'],
 ['"description": "A cryptographic organism with deterministic identity, body and historical continuity."','"description": "AMEBA is a fluid cryptographic organism with mutable form and persistent identity."']]);
for(const file of ["tests/amoeba.spec.mjs","tests/interaction.spec.mjs","playwright.config.mjs","scripts/serve.mjs","scripts/validate.mjs"]){
 patchFile(file,[["MilnoAmoeba","AmebaOrganism"],["Milno.","Ameba."],["MILNO","AMEBA"]]);
}
for(const file of ["qa/capture-amoeba.mjs","qa/assess-motion.mjs","qa/interaction-audit.mjs"]){
 patchFile(file,[["MilnoAmoeba","AmebaOrganism"],["Milno.","Ameba."],["MILNO","AMEBA"],
 [">milno</div>",">AMEBA</div>"],["A SOFT CRYPTOGRAPHIC ORGANISM","A FLUID CRYPTOGRAPHIC ORGANISM"],
 ["Form mutates. Identity persists.","MUTABLE IN FORM. PERSISTENT IN IDENTITY."]]);
}
