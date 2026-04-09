# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [1.1.0] - 2026-04-09

### Removed
- `src/components/hud/SystemToggle.tsx` — defined but never imported; system toggle logic lives in `LateralNav.tsx`

### Changed
- Enable `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json`

### Added
- `CHANGELOG.md` — project history in Keep a Changelog format
- `ROLLBACK.md` — documented rollback strategies for Vercel and git

## [1.0.0] - 2026-04-08

### Added
- Full Stellium overhaul: three-layer HUD, ritual entry flow, Big Three panel
- Credits: Vedant Shok Natarajan + Vismay Hegde attribution
- Spatial astrology/esoteric environment — Next.js 14 + React Three Fiber
- `CosmicOcean`, `Orb`, `ZodiacRim`, `OrbInterior`, `OrbExterior`, `Planet`, `Singularity` 3D components
- `HUD`, `LateralNav`, `MoonScrubber`, `Sidebar`, `ViewToggle`, `BigThreePanel` UI layers
- `BirthDataEntry`, `ChartEnvironment`, `EthicalGate`, `Landing`, `NatalSeal` screens
- `PolarisCursor`, `VedicGateOverlay` UI elements
- `AspectLines`, `UnlockMechanics` unlock flow
- `chartStore`, `unlockStore` Zustand state management
- `src/lib/astro/` — western, vedic, chinese astro calculation modules
- `src/lib/ai/` — Anthropic Claude SDK integration for report generation
- OpenGraph image, hydration crash fix, monochrome OG marks
- Stellium identity: metadata, favicon, OG image

## [0.2.0] - 2026-04-07

### Added
- GenZ redesign — Syne font, 'your astro homie' brand voice, better sign emojis
- Phase 01 MVP base (originally Nackshatra AI)

## [0.1.0] - 2026-03-07

### Added
- Initial commit: Nackshatra AI Phase 01 MVP
