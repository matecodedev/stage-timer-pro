# Changelog

All notable changes to Stage Timer Pro are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-08-09

### Added

- MIT license. The app is now free and open source for the live event
  community. It previously shipped an end-user license agreement that
  reserved all rights, which contradicted the `MIT` declared in the crate
  manifest.

### Fixed

- On-screen messages: an expiring message no longer clears a newer one.
  The timeout that hid a message after its TTL was never cancelled, so
  sending a short message after a long one — or a message marked as
  persistent — could see it wiped from the stage display without the
  operator touching anything.

### Changed

- Version aligned across `package.json`, `tauri.conf.json` and
  `Cargo.toml`, which previously declared `1.0.3`, `1.0.3` and `0.1.0`.
- Build dependencies updated: 9 of 11 reported advisories resolved. The two
  remaining affect only the Vite development server and never reach a
  packaged build.
- Repository cleaned up: 15 internal working notes and empty placeholder
  documents removed, and the user documentation consolidated under `docs/`.

## [1.0.3] - 2025-08-11

### Fixed

- Global hotkeys conflicted with the Windows keyboard layout switcher.
  They are now dedicated function keys: `F9` start/pause, `F10` reset,
  `F11` toggle the stage display full screen.
- Pressing space while typing a message no longer starts or pauses the
  timer. Hotkeys are suppressed whenever the focus is in an input,
  a textarea, or any editable element.
- A shortcut that fails to register no longer prevents the app from
  starting. It is reported and the app continues.

### Added

- NSIS installer (`.exe`) alongside the existing MSI for Windows.
- `unregister_all_shortcuts` command, with cleanup when the window closes.

> **Note.** The `v1.0.3` release published on 2025-08-11 carried `1.0.2`
> binaries: the tag was pushed but the code above was never committed. The
> corrected build ships in `v1.0.4`.

## [1.0.2] - 2025-08-09

First public release with Windows and macOS installers.
