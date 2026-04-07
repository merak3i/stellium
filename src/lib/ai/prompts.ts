import type { NatalChart, PlanetId } from '@/types'
import type { ChineseChart } from '@/lib/astro/chinese'

// ─── Report prompt templates ────────────────────────────────────────────────
// Each system generates its own synthesis document.
// The prompt is designed to NOT give interpretations —
// instead it surfaces patterns and invites further exploration.

export function buildWesternPrompt(
  chart: NatalChart,
  unlockedIds: PlanetId[]
): string {
  const unlocked = chart.planets.filter((p) => unlockedIds.includes(p.id))

  const planetSummary = unlocked
    .map((p) => `${p.name}: ${p.degrees.toFixed(1)}° ${p.sign}, House ${p.house}${p.retrograde ? ' (Rx)' : ''}`)
    .join('\n')

  return `You are generating a synthesis document for a natal chart exploration app called Stellium.

The user has discovered the following placements in their Western (Tropical) natal chart:

${planetSummary}

Write a synthesis that:
1. Speaks directly to the user in second person
2. Surfaces themes, questions, and tensions — without giving answers or interpretations
3. Points toward areas of life to explore further
4. Honors the esoteric tradition: "as above, so below"
5. Maintains a tone of wonder, precision, and reverence — not mystical fluff
6. Is formatted as prose paragraphs, not bullet points
7. Does NOT tell the user what their placements "mean" — instead, what they might invite

Keep it under 400 words. This is a document, not a dashboard.`
}

export function buildVedicPrompt(
  chart: NatalChart,
  unlockedIds: PlanetId[]
): string {
  const unlocked = chart.planets.filter((p) => unlockedIds.includes(p.id))

  const planetSummary = unlocked
    .map((p) => `${p.name}: ${p.degrees.toFixed(1)}° ${p.sign}, House ${p.house}${p.retrograde ? ' (Rx)' : ''}`)
    .join('\n')

  return `You are generating a synthesis document for the Vedic (Sidereal) layer of a natal chart exploration app called Stellium.

The user has unlocked the Vedic layer — shifted by the Lahiri ayanamsa from their Tropical chart.

Sidereal placements discovered:

${planetSummary}

Write a synthesis that:
1. Acknowledges the shift from Tropical to Sidereal — what changes, what deepens
2. Speaks to karma, dharma, and life themes through the Vedic lens
3. References the nakshatras if relevant (lunar mansions)
4. Does not interpret — it illuminates terrain
5. Tone: ancient, precise, vast

Under 400 words. Prose only.`
}

export function buildChinesePrompt(data: ChineseChart): string {
  const p = data.fourPillars
  const pillars = [
    `Year:  ${p.year.heavenlyStem}  (${p.year.stemChar}) — ${p.year.earthlyBranch} (${p.year.branchChar}) · ${p.year.element} · ${p.year.animal}`,
    `Month: ${p.month.heavenlyStem} (${p.month.stemChar}) — ${p.month.earthlyBranch} (${p.month.branchChar}) · ${p.month.element} · ${p.month.animal}`,
    `Day:   ${p.day.heavenlyStem}   (${p.day.stemChar}) — ${p.day.earthlyBranch}   (${p.day.branchChar}) · ${p.day.element} · ${p.day.animal}`,
    `Hour:  ${p.hour.heavenlyStem}  (${p.hour.stemChar}) — ${p.hour.earthlyBranch}  (${p.hour.branchChar}) · ${p.hour.element} · ${p.hour.animal}`,
  ].join('\n')

  return `You are generating a synthesis document for the Chinese (Ba Zi / 八字) layer of a natal chart exploration app called Stellium.

The user's Four Pillars of Destiny:

${pillars}

Year of the ${data.animal}, ${data.element} (${data.polarity}).

Write a synthesis that:
1. Reads the elemental interplay across all four pillars — harmony, tension, dominance, absence
2. Speaks to life themes through the Wu Xing (Five Elements) cycle — generation and control
3. Acknowledges the animal symbolism where it adds texture, not fortune-telling
4. Does not interpret or predict — it illuminates terrain, points toward questions
5. Tone: ancient, quiet, precise. Spare like classical Chinese writing.
6. Prose only, no bullet points or headers

Under 400 words.`
}
