# BAULIPA

A contemporary website for swimming pool construction and pool essentials. Built with React, Vite, TypeScript component support, Tailwind CSS v4, Phosphor icons, Framer Motion and GSAP ScrollTrigger.

## Run locally

```sh
npm install
npm run dev
```

Production build: `npm run build`. Serve it with `npm run preview`.

## Design

Greenfield, premium residential pool studio and product collection. Design variance 8, motion intensity 7, visual density 3. A custom architectural aesthetic, rather than a component-library theme. Mineral white, forest ink and pool blue; a light default with an optional dark theme. Square photographic surfaces and pill-shaped controls.

Typeface: **Uncut Sans Variable** by Kasper Nordkvist, self-hosted with its SIL Open Font License in `public/fonts/`. Its alternate Y/y letterforms are enabled in the wordmark. Selected after reviewing Uncut Sans and Switzer. Sources: https://uncut.wtf/sans-serif/uncut-sans/ and https://github.com/kaspernordkvist/uncut_sans.

Motion:

- A light perspective-tunnel hero adapted from the supplied React reference. Six original pool images move in 3D with native page scrolling and spring-smoothed pointer parallax. The normal page scroll remains available; no wheel events are intercepted. Reduced motion keeps a static, single-viewport composition.
- A scroll-driven horizontal pool gallery on larger screens. The track is pinned and scrubbed continuously, with arrow controls and keyboard support. Phones, short viewports and reduced-motion users get a normal horizontally scrollable gallery.
- Water-fill text, image parallax and a staggered footer wordmark establish the reading sequence.
- Native dialogs use a 250ms scale/opacity transition. Buttons use 160ms press feedback. Hover transforms are gated to fine pointers. Reduced motion removes position/scale choreography.

## What is connected

Category filtering, product and pool details, local enquiry shortlist, removal, persistent selections, mobile menu, construction accordion, FAQs, colour theme, validated enquiry preparation, text download and copy.

The site is a **concept using illustrative pool imagery and product selections**, not a record of completed BAULIPA projects or confirmed inventory. No prices, reviews, customer statistics or product specifications have been invented. `src/data.js` holds the replaceable collection.

Before commercial launch, provide the confirmed catalog, product photos, prices, business contact details, service area and legal information. The enquiry currently prepares a local draft; it does not transmit it. Checkout and online enquiry delivery require the corresponding business integrations.

## Imagery

Thirteen full-size assets plus six optimized hero thumbnails were created with the built-in image-generation tool, then copied and compressed into `public/images/`. They are part of the repository and require no external image host. See `ASSETS.md` and `ASSETS-TUNNEL.md` for the complete prompt sets. `scripts/prepare-images.py` records the original optimization step; it is not needed to run or build the website.

## Reusable hero and component setup

The supplied hero is integrated at `src/components/ui/perspective-tunnel-hero.tsx`, reached with `@/components/ui/perspective-tunnel-hero`. The `@` alias points to `src`, so `src/components/ui` is the project's shadcn-compatible UI component folder. `components.json` declares that structure, CSS location and aliases. The component accepts the image collection and callbacks for the enquiry and pool details; it needs no context provider.

Tailwind v4 is installed through its Vite plugin and imported in `src/styles.css`; TypeScript checks the reusable component and utility module. `src/lib/utils.ts` supplies shadcn's standard `cn` helper. The existing application can continue using JSX alongside typed components. Run `npm run typecheck` independently; `npm run build` also checks types.

The new concept collection covers white stone, black basalt, rooftop, indoor/spa, blue mosaic and natural swimming pools. The mobile hero changes the image positions to preserve a central reading area.

## Water reflections trial

The contact invitation includes a pale, slowly moving water surface adapted from claude-directory's Flowing Waves Shader. It uses local WebGL with no new dependency, initializes as the section approaches the viewport, pauses outside it and in hidden tabs, and renders a still image for reduced motion. A static CSS surface remains if WebGL is unavailable. Attribution and the MIT license are in `THIRD_PARTY_NOTICES.md`.

Compare `/?water=off#contact` with `/#contact` to review the original invitation and the water version. The prior complete site remains at commit `f7685d944ec0230ba9ff69fe42b17a1d91957915`. This trial is isolated to the `WaterReflections` component, its stylesheet and its contact-section integration.
