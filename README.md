# QBM Onboarding — Research Prototype

Click-through prototype of the QuickBooks Mobile onboarding flow, built from the
Figma files **QBM Onboarding** and **QuickBooks Mobile Design System V2** (light mode).
Plain HTML/CSS/JS, no build step. Open `index.html` or host on GitHub Pages.

## The research branch

On **Connect new account → "Does this account include personal transactions?"**:

| Toggle | Path | Screens after the bank step |
|---|---|---|
| Off | **Hypothesis 1** — business transactions only | Summary → 12 review cards → Posting → Getting your homepage set up → Home |
| On  | **Hypothesis 2A** — sort business transactions first | Great, you're connected → Select business transactions → Summary → 12 review cards → Organizing your finances → Home |

Review cards support **Confirm and post** (next card), **Edit details** (edit screen → Post / Post as personal / Exclude advance to the next card), and **I'll do this later** (jumps to the exit).

## URL parameters

| Param | Effect |
|---|---|
| `?path=h1` / `?path=h2` | Presets the toggle (participants can still flip it) |
| `?start=<screen id>` | Starts on any screen (ids are in `flow/flow.js`) |
| `?dev=1` | Shows a review-only control panel: switch hypothesis, jump to any screen, restart |

Example for a session: `https://<org>.github.io/<repo>/?path=h2`

## Changing the flow

All routing lives in **`flow/flow.js`** (`next` per screen, or `{ by:'comingle', map:{…} }` for a branch). Screens never hardcode destinations. Copy, sample transactions and options are in `flow/data.js`.

```
index.html          shell (device frame + script order)
kit/tokens.css      Design System V2 tokens, light mode (source of truth)
kit/components.css  shared components built from the DS
kit/frame.css       iPhone 17 frame · kit/kit.js router + icons
flow/               flow.js (routing) · engine.js · data.js · screens-*.js · screens.css
```

## Publish on GitHub Pages

1. Create the repo and push this folder.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Check your org's rules for Pages visibility before sharing links outside Intuit.

## Value-prop motion

`flow/motion.js` recreates the Figma **Motion** frame (14.8s loop) from Figma's exported keyframes: per-layer translate/rotate/scale/blur with easing, the Cash flow line drawing in, and the Invoices amounts animating in character by character. Artwork is in `assets/motion/` (Cash flow is inlined in `motion-assets.js` so its line can animate). Respects `prefers-reduced-motion`.
- `SMOOTH_LOOP` (top of `motion.js`): `true` eases blur and numbers back before the loop restarts; `false` hard-cuts exactly as Figma does.
- The Invoices card is rebuilt in HTML (the exported PNG was cropped); the Figma layer "image 361" starts off-screen right and is not included.

## Known gaps (to confirm with design)

- **Fonts:** Tally VF / Tally Display VF are not bundled; static Tally Regular/Medium stand in, so headings wrap slightly differently than Figma.
- **No onboarding progress bar** in the DS: built from tokens in `components.css` (`.steps`).
- **Prototype-only colors** (`--proto-*` in `tokens.css`): dark indigo summary surface and green home header are not DS tokens; values are estimated.
- **Outside the DS:** Intuit sign-up, IDX bank-link screens and the Wells Fargo web view are approximations in `flow/screens.css` Part 2 (hardcoded vendor colors live only there).
- **Placeholders:** merchant and bank logos are colored initials; Home is a static approximation.
- **Copy to confirm:** the bank intro buttons ("Connect your bank", "I'll do this later") were not readable in Figma metadata; the H1 summary says 20 transactions but the review has 12, matching Figma.
- Transaction amounts differ slightly between the select list and cards in Figma; the prototype uses one data set.
