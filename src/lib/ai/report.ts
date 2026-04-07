import Anthropic from '@anthropic-ai/sdk'
import type { NatalChart, PlanetId } from '@/types'
import type { ChineseChart } from '@/lib/astro/chinese'
import { buildWesternPrompt, buildVedicPrompt, buildChinesePrompt } from './prompts'

let client: Anthropic | null = null
function getClient(): Anthropic {
  if (!client) client = new Anthropic()
  return client
}

export async function generateReport(
  chart: NatalChart,
  unlockedIds: PlanetId[],
  chineseData?: ChineseChart | null
): Promise<string> {
  let prompt: string

  if (chineseData) {
    prompt = buildChinesePrompt(chineseData)
  } else if (chart.system === 'vedic') {
    prompt = buildVedicPrompt(chart, unlockedIds)
  } else {
    prompt = buildWesternPrompt(chart, unlockedIds)
  }

  const message = await getClient().messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude API')
  return content.text
}
