# Spec: Homepage Explain Banner

## 1. Problem & Goals

- **Problem:** After the hero, the homepage needs a short, memorable explanation of *why shopping-mcp exists*.
- **Goals:**
  1. A new section sits immediately below the compact demo teaser on `/`.
  2. Copy is short enough to scan in a few seconds and still states the product: same WebMCP tools on every store, page-scoped catalogs, one shared cart.
  3. Entrance uses Motion, triggered when the section scrolls into view (not on first paint, because the section is below the fold).
  4. `prefers-reduced-motion: reduce` disables motion offsets; content is still fully readable.

## 2. Non-Goals

- Duplicating the hero banner layout or replacing it.
- New routes, docs content, or Nav links.
- Video, diagrams, or extra libraries.
- LLM/marketing-page length.

## 3. Users & Stories

- As a **visitor who just used the demo**, I want three plain ideas so I can explain shopping-mcp to someone else.
- As a **visitor who prefers reduced motion**, I want the same content without flying UI.

## 4. Scope

- **In:** One React section under the compact demo teaser; Motion `whileInView`; styles on the landing stylesheet; CTA to `/docs`.
- **Out:** Footer, GitHub link wiring, extra stores, changelog.

## 5. Functional Requirements

1. Placement: sibling of Banner and the compact demo teaser, last in `<main>`.
2. Landmark: `<section>` with `id="why"` and `aria-labelledby` pointing at the heading.
3. Content (exact):
   - Kicker: `The idea`
   - Heading: `Agents shop the page. You keep the cart.`
   - Support: `shopping-mcp is a shared WebMCP profile. Stores can look different. The tools do not. An agent reads the storefront that is open, you choose, then the basket travels when you switch shops.`
   - Three cards, in order:
     1. `01` / `Same tools` / `search_products, list_products, add_to_cart. NileMart and DartHouse share one profile so the agent never scrapes.`
     2. `02` / `This page only` / `Tools see the open storefront. Milk is not on NileMart. Switch to WideMart and shop there.`
     3. `03` / `One cart` / `Needs and picks live in a shared basket across stores. Then track the order through your integration.`
   - CTA: `Read the tools` → `/docs` (primary button style, matching the hero).
4. Motion: parent `whileInView` once; children stagger rise (opacity + 18–24px y). Cards lift slightly on hover. CTA uses the same spring hover as the hero.
5. Reduced motion: `useReducedMotion()` — no y/scale travel; instant or opacity-only.

## 6. Interfaces & Data

- UI only. No new APIs or data models.
- Static copy in the component (no CMS).

## 7. Edge Cases & Errors

- Section must not overlap the sticky nav (`scroll-margin-top` on `#why`).
- Long German-length words N/A (English only).
- Narrow viewports: cards stack; CTA remains tappable (≥ 2.85rem height).

## 8. Non-Functional

- **A11y:** heading hierarchy h2; cards are not fake buttons; respect reduced motion.
- **Perf:** no images; Motion already a dependency.
- **i18n:** English only.

## 9. Dependencies & Assumptions

- `motion/react` already used by Banner/Nav.
- `/docs` exists (hero already links there). If `/docs` 404s, still link it — out of scope to create docs.

## 10. Acceptance Criteria

- [ ] Given `/`, when the visitor scrolls past the demo, then they see a section whose heading is “Agents shop the page. You keep the cart.”
- [ ] Given that section, when it first enters the viewport, then headline and cards animate in (unless reduced motion).
- [ ] Given reduced motion, when the section enters view, then content is visible without y/scale animation.
- [ ] Given the CTA, when clicked, then the browser navigates to `/docs`.
- [ ] Given a ~375px viewport, when viewing the section, then cards stack and nothing overflows horizontally.

## 11. Test Strategy

- Manual Playwright: scroll to `#why`, confirm copy, click CTA (or check href), resize to 375px, check overflow.

## 12. Rollout

- Additive homepage section. No flags.

## 13. Open Questions

- None.
