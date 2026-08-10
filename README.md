# Stage Timer Pro

A desktop countdown timer for live events, built for the person running the show from the booth.

Conferences and productions run on time because someone is watching a clock the audience never sees. Stage Timer Pro splits that job across two screens: a control dashboard on the operator's monitor, and a full-screen display on the one facing the stage. The presenter sees the time and the cues. Nothing else.

## Features

**Timer**

- Countdown configured to the second, with a count-up mode that keeps running past zero so overruns stay visible instead of vanishing.
- Warning and critical thresholds you set per event, each with its own color state — readable from the back of a room.

**Dual monitor**

- The stage window detects the secondary display and opens full screen there on its own.
- If it gets closed mid-event, it can be recreated without touching the running timer.

**Cue messages**

- Free text or presets (`TIME OUT`, `DESCANSO`, `PRÓXIMO TURNO`), sized up to presentation scale, with an optional blink for urgency.
- Show them floating over the timer or replacing it entirely, and auto-hide them after a delay or keep them until dismissed.

**Per-event branding**

- Event name and logo on the stage header, plus a full color palette — primary, secondary, background, and accent — so the screen matches the client's identity rather than the tool's.

## Keyboard shortcuts

The operator should never have to find a button mid-talk.

| Key | Action |
| --- | --- |
| `Space` | Start / pause |
| `S` | Stop |
| `+` / `-` | Adjust by one minute |
| `Ctrl`/`Cmd` + `+` / `-` | Adjust by five minutes |
| `M` | Send message |
| `H` | Hide message |
| `D` | Toggle dark mode |

## Tech stack

| Layer | Technology |
| --- | --- |
| Shell | Tauri (Rust) |
| UI | React |
| Build | Vite |

Packaged as a native binary, so it ships without a bundled browser runtime.

## Getting started

Requires Node.js, the Rust toolchain (`rustup`, `cargo`), and your platform's [Tauri prerequisites](https://tauri.app/start/prerequisites/). On macOS that means the Xcode command line tools:

```bash
xcode-select --install
```

Then:

```bash
npm install
npm run tauri:dev     # full desktop app — dashboard and stage
npm run tauri:build   # production binary for the current platform
```

To iterate on the interface alone, in the browser:

```bash
npm run dev
```

## Project structure

```
src/         React interface — dashboard and stage views
src-tauri/   Rust shell, window management, packaging config
website/     Product landing page
docs/        Design and usage notes
```

---

Built by [MateCode](https://matecode.dev) — websites and custom software.
