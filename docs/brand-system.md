# MILONO Brand System

The 2026-10-11 refinement changes identity assets and presentation, not the research-console architecture or simulation rules. Official destinations remain [Website](https://milono.xyz/), [X](https://x.com/Milono_sol), and [Source](https://github.com/theovarne/milono).

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

- [Full supplied reference](../dist/brand/milono-logo-full.png): preserved unchanged.
- [Dedicated website mark](../dist/brand/milono-mark.png): tightly framed derivative prepared with the built-in image tool; black exterior, original segmented silhouette and single-eye motif. The first generated variant had an unwanted halo and was rejected, not shipped.
- [Small-size favicon SVG](../dist/brand/favicon.svg): code-native simplified face/eye silhouette; tiny legs and fine stripes are omitted for 16px legibility. It is a deliberate small-size variant, not a traced full-organism SVG.
- [ICO](../dist/brand/favicon.ico): 16/32/48 PNG frames. The conventional root favicon uses identical bytes.
- [Apple Touch](../dist/brand/apple-touch-icon.png), [192px](../dist/brand/icon-192.png), [512px](../dist/brand/icon-512.png) and [manifest](../dist/site.webmanifest).
- [Social preview](../dist/brand/og-image.png): 1200×630 black canvas, mark, MILONO title and exact brand copy.

Icon and social exports are reproducible with `node scripts/brand-assets.mjs` after installing Playwright Chromium. `MILONO_CHROME` may select an installed Chrome binary. This script rasterizes the SVG and typeset layout; it does not change the approved organism design. The versioned icon/OG metadata uses `v=20261011`; increment it for future identity changes. Browsers can retain a tab icon until that tab is reopened.

No service worker or offline behavior is introduced by the manifest. Icons use `purpose: any`; they are not claimed to be maskable.

## Final image-tool prompt

Built-in mode, with the owner's original image as the edit target:

> Use case: precise-object-edit. Input image is the exact MILONO logo to preserve. Only reframe it into a tightly cropped landscape logo asset (3:2), with the entire organism taking up about 90% of width and height. Keep original body proportions, exact pose, segments, black stripes, circular eye, legs and terracotta accents. Background MUST be perfectly flat opaque pure black #000000, every exterior pixel black, NO transparency, NO vignette. All body regions are flat solid warm ivory #F3ECE4, flat solid terracotta #CE6241, flat black stripes and eye. Absolutely NO GLOW, NO light halo, NO shadow, NO atmospheric effects, NO illumination, NO gradients, NO texture. This is a crisp 2D vector-like brand asset, not a rendering. No lettering. Change only framing and solid colors, not the design.

## Function boundary

The logo is not the simulation. The active optimized tardigrade console still runs the existing neural-body canvas, stress model, Terminal, ledger and proof fixtures. It supports neural-region hover and pinning, stress-slider dragging, fingerprint inspection and lifecycle controls. The archived amoebic membrane renderer remains inactive; this change does not claim to add membrane dragging or real cryptographic verification.

Layout widths, section ordering and canvas geometry remain unchanged. Tests cover official links, legacy state migration, metadata/resources, 375/768/1366/1440/1920px layouts, stress dragging, neural hover/pinning, animation and Terminal flows.
