# Outer Wilds: A Thrilling Graphical Text Adventure — Web Port

An unofficial web port of the [Outer Wilds Text Adventure](https://www.mobiusdigitalgames.com/outer-wilds-text-adventure.html), a text-based exploration game where you investigate an alien solar system stuck in a time loop. Originally created by Alex Beachum at Mobius Digital in 2014 as a prototype, and [publicly released](https://www.mobiusdigitalgames.com/outer-wilds-text-adventure.html) in 2024 to celebrate the 5th anniversary of Outer Wilds. This port runs in the browser using [p5.js](https://p5js.org/).

**Spoiler warning:** This game contains major story elements from Outer Wilds. If you haven't played the main game, you should — it's best experienced without spoilers.

## Play

Open `index.html` in a browser — no server required. Or play online at **https://malob.github.io/outer-wilds-text-adventure-web/**.

## About the Original

The text adventure was written by Alex Beachum in the summer of 2014 as a standalone prototype to test whether players could piece together the overarching mystery of Outer Wilds. It was built in Processing and used to onboard new employees at Mobius Digital in the early days of development. The game contains the very first playable version of the ending.

For more context, see [Alex's original post](https://www.mobiusdigitalgames.com/outer-wilds-text-adventure.html) and the [earlier blog post about the demaking process](https://www.mobiusdigitalgames.com/news/demaking-outer-wilds).

## Credits

- **Alex Beachum** — text, code, and game design for the original prototype
- **Kelsey Beachum** and **Loan Verneau** — story and narrative design for Outer Wilds
- **Simon Wiscombe**, **Jason Mathias**, **Samantha Vick**, **Mike Sennott**, **Wesley Martin** — additional contributions
- **Kelsey and Alex Beachum** — kazoo cover of the Outer Wilds theme

## Disclaimer

This work is unofficial Fan Content created under permission from the [Mobius Digital Fan Content Policy](https://www.mobiusdigitalgames.com/fan-content-policy.html). It includes materials which are the property of Mobius Digital and it is neither approved nor endorsed by Mobius Digital.

## About the Port

The goal of this port is to be as faithful as possible to the original Processing game — a straight translation to the web, not a rewrite or enhancement. The game logic, rendering, and content are preserved exactly. The only changes are those required by the platform difference (Processing/Java vs p5.js/JavaScript in a browser).

### File Structure

```
index.html              Entry point — loads p5.js, data, and game scripts
js/                     33 JavaScript files ported from the original .pde files
  sketch.js             Main entry (from OuterWilds_TextAdventure.pde)
  bitmapFont.js         New: bitmap font renderer for pixel-perfect text
  enums.js              New: extracted from Java enum declarations
  signal.js             New: extracted from Telescope.pde
  actor.js              New: extracted from Entity.pde (Actor, Player, Ship, Probe)
  ...                   Each file's header comment identifies its .pde source
data/
  audio/                ow_kazoo_theme.mp3
  fonts/                Consolas bitmap fonts (.vlw source + .js generated)
  sectors/              Game world data (.json source + .js generated)
tools/
  convert-assets.js     Generates .js data files from .json and .vlw sources
```

### Asset Loading

The original Processing game loads sector JSON and bitmap font files at runtime via `loadJSONObject()` and `loadFont()`. In a browser, using `fetch()` to load local files fails due to CORS restrictions when opening `index.html` from the filesystem.

To avoid requiring a local server, the port pre-converts all data files into JavaScript:

- **Sector data:** Each `.json` file is wrapped as a JS assignment (e.g., `sectorJSONData['comet'] = {...};`) and loaded via `<script>` tags
- **Font data:** The binary `.vlw` files are parsed once by `tools/convert-assets.js`, which extracts glyph metrics and alpha pixel data into `.js` files

The original `.json` and `.vlw` files remain as the source of truth. To regenerate the `.js` data files after editing them:

```
node tools/convert-assets.js
```

### Porting Patterns

For comprehensive details on every porting decision — including edge cases, rationale, and specific file references — see [PORTING.md](PORTING.md). The summary below covers the key patterns.

These patterns recur across many files and are documented here rather than repeated inline.

- **Constructor overloading** — Java allows multiple constructors; JS merges them into one using `typeof`/`instanceof` checks (e.g., `Node(float x, float y)` and `Node(String id, JSONObject obj)` become a single constructor). Affects Vector2, Entity, Node, Button, TravelAction, SignalSource, GlobalMessenger.sendMessage, GameManager.loadSector, and Sector.addActor.
- **Interface removal** — Five Java interfaces (`GlobalObserver`, `ButtonObserver`, `NodeButtonObserver`, `NodeObserver`, `NodeActionObserver`) are dropped. The classes still define the same methods — they just aren't enforced by the type system (duck typing).
- **Lazy color initialization** — `color()` isn't available before p5.js `setup()`, so Button, StatusLine, and ClueButton defer color creation from field-declaration time to first use via a lazy getter.
- **Defensive Vector2 copies** — The original Processing code often treats Vector2 as a value type (assigning to `.x`/`.y` individually). Since JS objects are references, some places add explicit `new Vector2(...)` copies to prevent mutation (ProbeAction, SignalSource, SolarSystemMapScreen).
- **JSON API to bracket notation** — Processing's `getString()`, `getInt()`, `getBoolean()`, `getJSONObject()`, `hasKey()` become bracket access (`obj['key']`) with `!== undefined` checks, since the data is loaded as native JS objects.
- **`push()`/`pop()` for transforms** — Processing's `pushMatrix()`/`popMatrix()` only saves transforms; p5.js `push()`/`pop()` saves both transforms and style. We use `push()`/`pop()` since p5.js deprecated the old names and analysis showed no observable rendering difference.

### Bitmap Font System

The original uses Processing's `.vlw` bitmap font format — Consolas at 14px and 18px. p5.js has no `.vlw` support, so the port includes a custom renderer (`bitmapFont.js`) that takes pre-parsed glyph data and overrides p5.js's `text()`, `textWidth()`, `textSize()`, `textAlign()`, and `fill()` to route through the bitmap renderer. This produces pixel-perfect text matching the original. A CSS font stack (`Consolas, "Courier New", monospace`) is set as a fallback but is not used for actual rendering.

### Known Differences from the Original

- **Anti-aliasing on shapes and lines.** Processing's `noSmooth()` disables anti-aliasing globally. The HTML5 Canvas 2D API does not support disabling shape anti-aliasing — `noSmooth()` in p5.js only affects image scaling. Lines and ellipses may appear slightly smoother.
- **Quit/Exit buttons.** The original calls Processing's `exit()`. Browsers cannot close their own tab, so these buttons do nothing.
- **Audio autoplay.** Browsers may block the kazoo theme until the user interacts with the page.
- **Actor removal bugfix.** The original iterates actors forward while removing dead ones, which can skip an adjacent actor. The port iterates in reverse, fixing this latent bug.

### Intentional Non-Changes

The port preserves several things from the original that might look like bugs or omissions but are faithful to the 2014 prototype:

- Debug flags (`EDIT_MODE`, `SKIP_TITLE`, `START_WITH_LAUNCH_CODES`, etc.) are preserved and set to `false`
- The sector editor is preserved (set `EDIT_MODE = true` in sketch.js)
- All game text, sector data, and node connections are unchanged
- The kazoo theme audio file is the original recording
