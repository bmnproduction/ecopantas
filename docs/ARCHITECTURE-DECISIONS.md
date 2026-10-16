# Architecture decisions — ECO PANTAS Integrated

## Product architecture

`Mata → Hati → Tangan → Aksi Nyata` is the pedagogical sequence. Existing game mechanics were mapped into that learning journey instead of leaving them as separate unrelated destinations:

- Mata: environmental exploration + 2×2 picture puzzle.
- Hati: 20 illustrated environmental quiz questions, navigated like stepping stones/engklek.
- Tangan: 15-object sorting game with three categories and both drag/drop and touch selection.
- Aksi Nyata: a guided real-world checklist with an adult.

## Technical architecture

- Static multi-page web project using HTML/CSS/JavaScript; deployable as static files.
- Tailwind CSS v4 is used for utility classes. A generated `css/tailwind.css` is included so the page doesn't require a CSS CDN at runtime; `css/style.css` provides ECO PANTAS-specific theme and interaction styling.
- Shared state module (`js/game-core.js`) owns session schema, old-key migration, session status, progress, badges, and the one countdown deadline.
- Shared station shell (`js/station-shell.js`) owns header, navigation, status guard, feedback shell, hint action, and timer display.
- Each station script owns its learning content/interactions. Global event handlers are not attached repeatedly when a component rerenders.
- Browser local storage is the persistence layer; there is no server-side student account or progress synchronization.
- A local static server (`npm run serve`) is included; JavaScript ES modules must be served via HTTP, not opened directly from the ZIP or `file://`.

## Timing state model

`ready → playing → offline → completed`

`playing → timeup` if the 7-minute digital deadline expires before the three digital stations are finished.

The deadline starts once at session start; navigation does not reset it. Upon completing `mata`, `hati`, and `tangan`, the core clears the active deadline and sets `offline`. The child completes the real-world follow-up with an adult; completing that task sets `completed`.

## Compatibility

The package includes adapters for recognisable legacy storage keys `ecoGameSession_v4` / `ecoGameSession_v5`, but an original production repository wasn't included in the supplied ZIPs. Legacy-state compatibility is best-effort and should be compared with the actual production data before switching a live deployment.
