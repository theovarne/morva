# MORVA Brand System

The 2026-10-22 website rename uses MORVA, displayed as `morva`, and the tagline “Form changes. Identity remains.” The owner supplied a new ivory and terracotta creature with two antennae, two large eyes, a segmented body, claw feet and a split tail. Its derived logo replaces the earlier single-eye artwork; the research-console architecture and simulation rules are preserved. The retired contract address has been removed. A new header CA area displays only its label; its address is empty. Official destinations remain [Website](https://milono.xyz/), [X](https://x.com/ProjectMORVA), and [Source](https://github.com/theovarne/morva).

## Visual roles

Black is the environment. Warm ivory carries information and organism structure. Terracotta marks life, response and selection; it is not a panel background.

All active interface colors originate in the `--milono-*` tokens in [styles.css](../dist/assets/styles.css). The active canvas renderer reads these tokens rather than maintaining a separate palette. Brand SVG/raster exports have fixed palette values because they must also work outside the page.

| Role | Value |
| --- | --- |
| Background | `#000000` |
| Panel / raised surface | `#0D0C0B` / `#171513` |
| Ivory / bright ivory | `#F3ECE4` / `#FBF4EC` |
| Signal / hover signal | `#CE6241` / `#D97755` |
| Body / secondary text | `#D9D1C9` / `#9F9891` |
| Structural border | `#302B27` |

## Asset sources

- [New supplied reference](../dist/brand/morva-reference.png): the owner's full original image, preserved unchanged.
- [Dedicated website mark](../dist/brand/morva-mark.png): the full double-eyed creature, adapted with the built-in image tool onto a tightly framed, pure-black landscape canvas. Antennae, eyes, body segments, feet, tail and color placement are preserved. The first draft's halo was removed before release.
- [Square MORVA logo](../dist/brand/morva-logo.png): 1024×1024 black canvas with the complete mark and a safe margin, used by the GitHub README.
- [Small-size favicon SVG](../dist/brand/favicon.svg): code-native simplified double-eye face with two terracotta-tipped antennae; tiny legs and fine stripes are omitted for 16px legibility. It is a deliberate small-size variant, not a traced full-organism SVG.
- [ICO](../dist/brand/favicon.ico): 16/32/48 PNG frames. The conventional root favicon uses identical bytes.
- [Apple Touch](../dist/brand/apple-touch-icon.png), [192px](../dist/brand/icon-192.png), [512px](../dist/brand/icon-512.png) and [manifest](../dist/site.webmanifest).
- [Social preview](../dist/brand/og-image.png): 1200×630 black canvas, mark, MORVA title and the current tagline.

Icon and social exports are reproducible with `node scripts/brand-assets.mjs` after installing Playwright Chromium. `MILONO_CHROME` may select an installed Chrome binary. This script rasterizes the SVG and typeset layout; it does not change the approved organism design. The versioned icon/OG metadata uses `v=20261022b`; increment it for future identity changes. Browsers can retain a tab icon until that tab is reopened.

No service worker or offline behavior is introduced by the manifest. Icons use `purpose: any`; they are not claimed to be maskable.

## Image-tool production

Built-in image generation was used to adapt the supplied reference. A second precise edit removed the first draft's exterior glow while preserving the creature. The selected output has a pure-black opaque background. Its final prompt was:

> Use case: precise-object-edit. Image 1 is the edit target: the MORVA creature logo with an unwanted white and orange haze surrounding it. Image 2 is the original reference showing the desired pure black exterior. Change ONLY the outside of the creature and remove every bit of that haze/glow/halo/blur. Replace every exterior pixel with perfectly uniform opaque pure black #000000 right up to the crisp silhouette edge. There must be NO radiating light, NO bloom, NO cast shadow, NO white fog, NO orange fog, NO feathered edge, NO vignette, NO gradient in the background, NO transparency. Keep the exact drawing in Image 1 unchanged: all two antennae, two large eyes, face, ivory body segments, black divisions, terracotta joints, all feet and split tail. Preserve pose, proportions, silhouette and color placement. Keep the entire creature visible within a landscape 3:2 frame, balanced small safety margins. This must look like clean flat cut-paper shapes placed on a perfectly black canvas, like Image 2. A literal solid-black background, not a transparent cutout preview. No text, no added objects.

## Function boundary

The logo is not the simulation. The active organism console still runs the existing neural-body canvas, stress model, Terminal, ledger and proof fixtures. It supports neural-region hover and pinning, stress-slider dragging, fingerprint inspection and lifecycle controls. The archived amoebic membrane renderer remains inactive; this change does not claim to add membrane dragging or real cryptographic verification.

Layout widths, section ordering and canvas geometry remain unchanged. Tests cover official links, legacy state migration, metadata/resources, 375/768/1366/1440/1920px layouts, stress dragging, neural hover/pinning, animation and Terminal flows.
