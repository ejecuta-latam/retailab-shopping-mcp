# Pasillo

A supermarket you walk with ChatGPT. The agent does not fill a cart from a search box. It takes you to the aisle, opens a **stand of 4 options**, and asks which one you want. You decide. Then — and only then — something goes in the basket.

This is a [WebMCP](https://developer.chrome.com/docs/ai/webmcp) app: the page registers tools on `document.modelContext`. People and the agent share the same stand.

## Why WebMCP

Without tools, ChatGPT would have to guess clicks through a store. With WebMCP it calls `show_stand({ need: "leche" })`. The floor plan moves, four milks appear, and the tool result is those four SKUs — so the model can ask *“¿qué tipo de leche te gusta, o alguna de estas 4?”* instead of inventing the shelf.

`add_to_cart` fails unless that `skuId` is on the open stand. The person keeps the decision.

## Try it

```bash
npm install
npm run dev
```

Open the URL in **ChatGPT’s in-app browser** (WebMCP is on by default) or Chrome 149+ with `chrome://flags/#enable-webmcp-testing`.

Say: **necesito leche, arroz y jabón**. You land in Lácteos with that list remembered. After you pick, say **sigue** / **ahora el arroz**. When you are done: **ya está** — ticket and the door.

Needs that work: `leche`, `arroz`, `jabon`, `tomate`, `vestir` / dress (and English aliases). In Moda you can **Ver** a garment up close and **Dejar** it without adding.

## Tools

| Tool | Role |
| --- | --- |
| `show_stand` | Walk to the aisle and open up to 4 options. A list of needs becomes one trip |
| `look_stand` | Re-read the stand |
| `compare_options` | Advise on the four (unit price, marca blanca, a one-line why). Does not add |
| `next_stand` | Walk to the next need still on the trip |
| `go_to_aisle` | Wander; closes the stand |
| `focus_product` | Highlight one of the four |
| `visualize_product` | Near camera on a Moda garment. Does not add |
| `give_up_product` | Put the previewed garment back |
| `add_to_cart` | After the shopper chooses |
| `remove_from_cart` | Take a line out |
| `checkout` | After the shopper says they are done: ticket and the door |

There is no `searchAndAdd`.

## Tests

```bash
npm test
npx playwright install chromium
npm run e2e
```

Playwright drives `document.modelContext.getTools()` / `executeTool`, not a fake click path.

## Stack

Vite + TypeScript + React (HUD) + raw Three.js for the store. Aisle logic lives in `src/domain`. The camera walks when `show_stand` / `go_to_aisle` run. See [`src/views/aisle3d/README.md`](src/views/aisle3d/README.md).
