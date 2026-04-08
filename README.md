# S T E L L I U M

```
·     *              ·           ·
         *    ·              ·        *
  ·                 *              ·
             ·            *             ·
    *                ·
```

> *The first app for astrology where you don't get any answers.*
> *An environment that encourages you to go explore and learn all the unknowns about yourself.*

Stellium is the first artifact in the **Astro / Esoteric** family by Simulacra. A spatial knowledge environment built on the principle of *"as above, so below"* — re-read for the Pluto-in-Aquarius age, where the lines blur between things and beings inhabiting the revolutionary frontier.

You are not a speck of dust in the infinite vastness of the cosmos.
The entire universe — with all its planets and stars — conspired together to birth you.
**This miracle we call life.**

---

## Credits

| Role | |
|---|---|
| **Creative Conceptualization** | Vedant Shok Natarajan |
| **Implementation · Creative & Technical Cognizing** | Vismay Hegde |
| **Studio** | Simulacra — [instagram.com/end.of.knowledge](https://instagram.com/end.of.knowledge) |

---

## 01 · Concept

| | |
|---|---|
| **Core Principle** | No interpretations are provided. The app is a spatial environment where knowledge must be actively discovered. |
| **Thesis** | The user is not a speck of dust — they are the universe, experienced subjectively. |
| **Genre** | Astro / Esoteric. 21st-century application of *as above, so below*. |
| **User Flow** | Exploration → Discovery (unlocking) → Synthesis (report) |

## 02 · Identity

| | |
|---|---|
| **Wordmark** | Seanor — logo only. Acts as primary entry point. |
| **UI Text** | Helvetica Neue · set in Small Caps throughout |
| **Labels** | Space Grotesk |
| **Aesthetic** | Dark mode. HUD. Symbolic precision over decorative fluff. |
| **Reference** | Time Nomad |

## 03 · The Orb

Not a contained object. It fills the entire field of view. Edges are never visible.

**Exterior View** — camera orbits outside the orb. Planets appear as very small, distant dots. The glass creates a refractive impression — not literal physics, but the feeling of looking through glass at something vast inside.

**Interior View** — first-person from the Singularity at the center. Planets rendered photorealistic. Glyphs project onto the interior surface. The sphere *is* the sky around you.

## 04 · Screens

```
01  LANDING          Seanor wordmark · ambient moon grid · Enter Site CTA
02  ETHICAL GATE     "Your birth details are a combination lock to your life"
03  BIRTH DATA       Name · Date · Time · Place (Latin sublabels throughout)
04  NATAL SEAL       Assembly sequence — a gathering, not a loading bar
05  CHART            The orb. Exterior + interior. Unlock to discover.
```

## 05 · Three-Layer Architecture

| Layer | System | Unlock Condition |
|---|---|---|
| 01 | **Western** *(Tropical)* | Default — always active |
| 02 | **Vedic** *(Sidereal)* | Unlock Rahu / Ketu |
| 03 | **Chinese** *(Four Pillars)* | Complete Vedic layer |

One system visible at a time. Toggling shifts the entire environment.

## 06 · HUD Layout

```
┌──────────────────────────────────────────────────────┐
│  ← NEW CHART      · NATAL SEAL ·     artifact ID 036 │  ArtifactHeader
│                   Name · date · place                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│  SUN              [   O R B   ]        ☉ 16°44' Aq  │
│  Aquarius                              ☽ 04°21' Ta   │  BigThreePanel (L)
│  MOON                                  ☿ 26°12' Aq   │  PlanetList (R)
│  Taurus                                ♀ 03°09' Cp   │
│  RISING                                ♂ 18°33' Pi   │
│  Sagittarius                           ...            │
│                                                       │
├──────────────────────────────────────────────────────┤
│  WESTERN · VEDIC ⌒ · CHINESE ⌒                       │  LateralNav
│  9.25° N · 76.54° E                                   │
│                                                   ∞   │
└──────────────────────────────────────────────────────┘
```

## 07 · Ritual Language

Every field in the birth entry form carries a Latin sublabel:

| Field | Latin | Translation |
|---|---|---|
| Name | *nomen* | "that by which one is called" |
| Date | *dies natalis* | "the day of one's birth" |
| Time | *hora nativitatis* | "the hour of nativity" |
| Place | *locus originis* | "place of origin" |

Header: **porta nativitatis** — "gate of birth"

## 08 · Unlock Mechanics

- Click a locked glyph → name reveals
- Click the name → expands to Degrees · Sign · House
- The HUD sidebar populates as you discover
- Aspect lines draw between unlocked endpoints
- Unlocking **Rahu / Ketu** gates entry to the Vedic layer
- Completing Vedic gates entry to Chinese / Four Pillars

## 09 · Spectrum Read *(v1.1)*

A sequential decomposition — eleven layers, one aspect type at a time.
Conjunction · Opposition · Square · Trine · Sextile · Semi-square · Sesquiquadrate · Quintile · Biquintile · Semi-sextile · Inconjunction.

Each reveals its own small truth. The final synthesis is named by the dominant quality of the moment — *"Hopeful and Tired,"* *"Urgent and Still."*

---

## Stack

```
Framework       Next.js 14 (App Router) · TypeScript
3D              React Three Fiber · Three.js · drei
State           Zustand
Styling         Tailwind CSS · CSS custom properties
Astronomy       Pure TypeScript — Jean Meeus algorithms
                Lahiri Ayanamsa for sidereal shift
                Whole Sign houses (Vedic) · Placidus (Western)
Geocoding       Nominatim / OpenStreetMap (no API key required)
AI              Anthropic Claude (synthesis only — never interpretation-as-truth)
Deployment      Vercel — stellium.vercel.app
Persistence     None. localStorage only. Your data is never stored.
```

## Setup

```bash
npm install
cp .env.local.example .env.local
# ANTHROPIC_API_KEY=sk-...

npm run dev             # http://localhost:3000
npm run build           # production bundle
npm run type-check      # TypeScript validation
```

## Project Structure

```
src/
├── app/
│   ├── globals.css            # Design tokens, s-anim-* animations
│   ├── layout.tsx             # Root layout, fonts, meta
│   └── page.tsx               # SSR wrapper → dynamic ClientApp
├── components/
│   ├── hud/
│   │   ├── ArtifactHeader.tsx # Top bar: name · birth meta · artifact ID
│   │   ├── BigThreePanel.tsx  # Left panel: Sun / Moon / Rising
│   │   ├── LateralNav.tsx     # Bottom-left: system tabs + coordinates
│   │   ├── Sidebar.tsx        # Right panel: full planet list
│   │   └── HUD.tsx            # Assembles all panels
│   ├── screens/
│   │   ├── Landing.tsx        # Moon-grid canvas + Enter Site CTA
│   │   ├── EthicalGate.tsx    # Privacy gate
│   │   ├── BirthDataEntry.tsx # Name + birth form, Latin sublabels
│   │   ├── NatalSeal.tsx      # Assembly animation
│   │   └── ChartEnvironment.tsx
│   └── ClientApp.tsx          # Screen flow router (client-only)
├── lib/
│   ├── ai/                    # Claude prompts & report generation
│   ├── astro/                 # western.ts · vedic.ts · chinese.ts
│   └── store/                 # chartStore · unlockStore (Zustand)
└── types/index.ts             # BirthData · ChartData · PlanetId · etc.
```

---

## Test Birth Data

```
Name    Vedanth (test)
Date    1998-02-05
Time    01:30
Place   Mavelikara, Kerala, India  (9.2543° N  76.5469° E)

Expected (Western / Tropical):
  Sun        Aquarius      16°44'
  Moon       Taurus        04°21'
  Ascendant  Sagittarius   00°04'   ← Rising
  Mercury    Aquarius      26°12'
  Venus      Capricorn     03°09'
  Mars       Pisces        18°33'
  Jupiter    Pisces        22°11'
  Saturn     Aries         04°58'
  Uranus     Aquarius      08°04'
  Neptune    Aquarius      28°35'
  Pluto      Sagittarius   07°00'
  N. Node    Virgo         21°43'
  MC         Leo
```

---

## Privacy

Birth data is a combination lock to your life. It is not stored. It is not shared. It exists only to map your sky — in your browser, for your session, and then it is gone.

---

```
S I M U L A C R A
  B L U R I N G   T H E   V E I L
  R E D E F I N I N G   C O N S C I O U S N E S S
```

*Creative concept: Vedant Shok Natarajan.*
*Implementation · creative & technical cognizing: Vismay Hegde.*
*A thing / being by [Simulacra](https://instagram.com/end.of.knowledge).*
*#thingsbeings · #astrology · #astroesoteric*
