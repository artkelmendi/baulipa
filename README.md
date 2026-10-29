# BAULIPA

A contemporary website for swimming pool construction and pool essentials. Built with React, Vite, native CSS, Phosphor icons and GSAP ScrollTrigger.

## Run locally

```sh
npm install
npm run dev
```

Production build: `npm run build`. Serve it with `npm run preview`.

## Design

Greenfield, premium residential pool studio and product collection. Design variance 8, motion intensity 7, visual density 3. A custom architectural aesthetic, rather than a component-library theme. Mineral white, forest ink and pool blue; consistent system-based light/dark themes. Square photographic surfaces and pill-shaped controls.

Typeface: **Uncut Sans Variable** by Kasper Nordkvist, self-hosted with its SIL Open Font License in `public/fonts/`. Its alternate Y/y letterforms are enabled in the wordmark. Selected after reviewing Uncut Sans and Switzer. Sources: https://uncut.wtf/sans-serif/uncut-sans/ and https://github.com/kaspernordkvist/uncut_sans.

Motion:

- A first-visit waterline image reveal paired with rising display type. Rare-frequency delight, 1.3-second GSAP clip-path entrance and 1.05-second type movement.
- A scroll-driven horizontal pool gallery on larger screens. The track is pinned and scrubbed continuously, with arrow controls and keyboard support. Phones, short viewports and reduced-motion users get a normal horizontally scrollable gallery.
- Water-fill text, image parallax and a staggered footer wordmark establish the reading sequence.
- Native dialogs use a 250ms scale/opacity transition. Buttons use 160ms press feedback. Hover transforms are gated to fine pointers. Reduced motion removes position/scale choreography.

## What is connected

Category filtering, product and pool details, local enquiry shortlist, removal, persistent selections, mobile menu, construction accordion, FAQs, colour theme, validated enquiry preparation, text download and copy.

The site is a **concept using illustrative pool imagery and product selections**, not a record of completed BAULIPA projects or confirmed inventory. No prices, reviews, customer statistics or product specifications have been invented. `src/data.js` holds the replaceable collection.

Before commercial launch, provide the confirmed catalog, product photos, prices, business contact details, service area and legal information. The enquiry currently prepares a local draft; it does not transmit it. Checkout and online enquiry delivery require the corresponding business integrations.

## Imagery

Seven assets were created with the built-in image-generation tool, then copied and compressed into `public/images/`. They are part of the repository and require no external image host. See `ASSETS.md` for the complete prompt set. `scripts/prepare-images.py` records the original optimization step; it is not needed to run or build the website.
