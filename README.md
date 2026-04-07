# S T E L L I U M

```
·     *              ·           ·
         *    ·              ·        *
  ·                 ✳              ·
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
01  LANDING          Seanor wordmark · ambient moon grid · click to enter
02  ETHICAL GATE     "Your birth details are a combination lock to your life"
03  BIRTH DATA       Date · Time · Place (minimalist HUD modal)
04  NATAL SEAL       Assembly sequence — a gathering, not a loading bar
05  CHART            The orb. Exterior + interior. Unlock to discover.
```

## 05 · Unlock Mechanics

- Click a locked glyph → name reveals
- Click the name → expands to show Degrees · Sign · House
- The HUD sidebar populates as you discover
- Aspect lines draw between unlocked endpoints
- Special points (Nodes, Ascendant, MC, Vertex) trigger their own reveal animations
- Unlocking **Rahu / Ketu** gates entry to the Vedic layer

## 06 · Spectrum Read *(v1.1)*

A sequential decomposition — eleven layers, one aspect type at a time.
Conjunction · Opposition · Square · Trine · Sextile · Semi-square · Sesquiquadrate · Quintile · Biquintile · Semi-sextile · Inconjunction.

Each layer color-coded. Each reveals its own small truth. The final synthesis is named by the dominant quality of the moment — *"Hopeful and Tired,"* *"Urgent and Still."* Saved to your personal archive.

## 07 · Systems

| Layer | System | Unlock |
|---|---|---|
| 01 | Western *(Tropical)* | Default |
| 02 | Vedic *(Sidereal)* | Rahu / Ketu gateway |
| 03 | Chinese *(Four Pillars)* | After Vedic completion |

One system visible at a time. Toggling shifts the environment.

## 08 · Report

Triggered around seventy percent of chart entities unlocked. Not a dashboard — a document. AI-generated synthesis, prose paragraphs, saveable as a single image. Each system generates its own distinct report.

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
AI              Anthropic Claude (synthesis only, never interpretation-as-truth)
Deployment      Vercel — Mumbai region
Persistence     None. localStorage only. Your data is never stored.
```

## Setup

```bash
npm install
cp .env.local.example .env.local
# Add ANTHROPIC_API_KEY

npm run dev             # http://localhost:3000
npm run build           # production bundle
```

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── globals.css        # Design tokens, animations
│   ├── layout.tsx         # Root layout, fonts, meta
│   └── page.tsx           # Screen flow orchestrator
├── components/
│   ├── environment/       # CosmicOcean · Lifeline
│   ├── hud/               # Sidebar · MoonScrubber · ViewToggle · SystemToggle
│   ├── orb/               # Orb · Planet · Glyph · AxisLines · ZodiacRim · Singularity
│   ├── report/            # Report synthesis
│   ├── screens/           # Landing · EthicalGate · BirthData · NatalSeal · ChartEnvironment
│   ├── ui/                # PolarisCursor · VedicGateOverlay
│   └── unlock/            # AspectLines · UnlockMechanics
├── lib/
│   ├── ai/                # Claude prompts & report generation
│   ├── astro/             # Ephemeris · western · vedic · chinese · utils
│   └── store/             # chartStore · unlockStore (Zustand)
└── types/                 # Complete type system
```

---

## Test Birth Data

```
Date    1998-02-05
Time    01:30
Place   Mavelikara, Kerala, India
        9.2543°N, 76.5469°E

Expected (tropical):
  Sun        Aquarius
  Moon       Taurus
  Ascendant  0°04' Sagittarius
  Mercury    Aquarius
  Venus      Capricorn
  Mars       Pisces
  Jupiter    Pisces
  Saturn     Aries
  Uranus     Aquarius
  Neptune    Aquarius
  Pluto      Sagittarius
  N. Node    Virgo
  MC         Leo
```

---

## Privacy

Birth data is a combination lock to your life. It is not stored. It is not shared. It exists only to map your sky — in your browser, for your session, and then it is gone.

---

```
▌  ▍▎ ▏  S I M U L A C R A  ✳ ✴ ✵ ·
      B L U R I N G   T H E   V E I L
      R E D E F I N I N G   C O N S C I O U S N E S S
```

*A thing / being by [Simulacra](https://instagram.com/end.of.knowledge).*
*#thingsbeings · #astrology · #astroesoteric*
