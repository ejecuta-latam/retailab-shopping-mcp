# ElevenLabs Voiceover Setup

Use **ElevenCreative Studio**, not the legacy Voiceover Studio. ElevenLabs retired the older Voiceover Studio on May 15, 2026.

## Recommended project setup

1. Record the normal-motion walkthrough from:
   `http://127.0.0.1:4321/walkthrough?record=1`
2. Open [ElevenCreative Studio](https://elevenlabs.io/app/studio) and create a video voiceover project.
3. Upload the walkthrough recording as the video track.
4. Add one narration/voiceover track.
5. Choose one clear, friendly English voice with a confident product-demo tone.
6. Select **Eleven v3**.
7. Start with:
   - Stability: **50%**
   - Speed: **1.00**
   - Style exaggeration: **0**
   - Similarity: **75%**, if that control is available for the selected model
8. Create **one narration clip** starting at `00:00.0`.
9. Paste the continuous script from `submission/elevenlabs-continuous-script.txt` and generate it as one take.

The script uses Eleven v3 pause tags to stay close to the walkthrough beats. These pauses are expressive rather than frame-accurate, so check the generated duration before exporting.

## Continuous script — recommended

Paste this entire block into one narration clip:

> Shopping M C P: same tools, every store, one cart.
>
> [short pause]
>
> Instead of scraping layouts, agents use tools published by each page, while shoppers stay in control.
>
> Here, the agent lists Nile Mart's products, searches for wireless earbuds, and adds Nile Buds to the shared cart.
>
> [long pause]
>
> Milk isn't sold here, so the same switch store tool opens Wide Mart. The cart keeps the Nile Mart item while the agent finds and adds milk.
>
> [pause]
>
> Next, it moves to Dart House and adds a candle. Get cart confirms three products from three stores, while open U I shows the same visible basket to the shopper.
>
> [long pause]
>
> Stores install the library once and connect it to their existing cart.
>
> No scraping or hidden checkout. This is Shopping M C P. Try it live at shopping dot ejecuta dot lat slash demo.

## Continuous timing adjustment

- The target duration is approximately **60 seconds**.
- If the take exceeds 62 seconds, increase Speed to `1.03` and regenerate.
- If it finishes before 57 seconds, lower Speed to `0.97` and regenerate.
- Start the audio at `00:00.0`; the final sentence can continue over the static end card.
- If one transition is still early or late, change the nearby `[pause]` to `[short pause]` or `[long pause]` and regenerate.

## Separate clips — fallback

Use the sections below only if the continuous generation cannot stay close enough to the video timing.

## Clip 1 — Title

**Start:** `00:00.0`  
**Target end:** `00:04.0`

Paste:

> Shopping M C P: same tools, every store, one cart.

## Clip 2 — Landing page

**Start:** `00:04.0`  
**Target end:** `00:10.0`

Paste:

> Instead of scraping layouts, agents use tools published by each page, while shoppers stay in control.

## Clip 3 — NileMart

**Start:** `00:10.0`  
**Target end:** `00:20.0`

Paste:

> Here, the agent lists Nile Mart's products, searches for wireless earbuds, and adds Nile Buds to the shared cart.

## Clip 4 — WideMart

**Start:** `00:20.0`  
**Target end:** `00:32.0`

Paste:

> Milk isn't sold here, so the same switch store tool opens Wide Mart. The cart keeps the Nile Mart item while the agent finds and adds milk.

## Clip 5 — DartHouse and shared cart

**Start:** `00:32.0`  
**Target end:** `00:47.0`

Paste:

> Next, it moves to Dart House and adds a candle. Get cart confirms three products from three stores, while open U I shows the same visible basket to the shopper.

## Clip 6 — Installation

**Start:** `00:47.0`  
**Target end:** `00:52.0`

Paste:

> Stores install the library once and connect it to their existing cart.

## Clip 7 — End card

**Start:** `00:52.0`  
**Target end:** `01:00.0`

Paste:

> No scraping or hidden checkout. This is Shopping M C P. Try it live at shopping dot ejecuta dot lat slash demo.

## Timing adjustments

- Generate each clip once at speed `1.00`.
- If a clip is slightly too long, raise only that clip to `1.03`–`1.08`.
- If a clip is short, keep the natural silence before the next clip instead of stretching the voice.
- Keep every clip on its listed start time. Do not let clips overlap.
- Regenerate individual clips when pronunciation or pacing is wrong; do not regenerate the entire track.
- The final clip may continue over the static end card, so it has the most timing flexibility.

## Pronunciation checklist

Listen once before exporting:

- “Shopping M C P,” not “shopping mick-p.”
- “Nile Mart,” “Wide Mart,” and “Dart House.”
- “Nile Buds.”
- “Open U I.”
- “shopping dot ejecuta dot lat slash demo.”

If “ejecuta” is unclear, try this spelling only in Clip 7:

> shopping dot eh-heh-COO-tah dot lat slash demo.

## Export

Preview the full video in Studio and confirm each sentence starts on its matching scene. Export the finished video with the narration track, or export the voiceover as WAV if the final video will be assembled in another editor.
