// ─────────────────────────────────────────────────────────────
// Nackshatra AI — GPT-4o-mini Content Engine
// Model: gpt-4o-mini — cheapest OpenAI model, great quality
// Cost: ~$0.15/1M input, ~$0.60/1M output tokens
// Per reading: ~0.003–0.008 USD
// ─────────────────────────────────────────────────────────────

import OpenAI from 'openai'
import { SYSTEM_PROMPT } from './prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// In-memory cache — keyed by prompt hash, cleared on deploy
// For production: use Vercel KV or Redis
const responseCache = new Map<string, { content: string; ts: number }>()
const CACHE_TTL_MS = 23 * 60 * 60 * 1000 // 23 hours

function cacheKey(key: string): string {
  return key.substring(0, 200) // trim for safety
}

function getCached(key: string): string | null {
  const entry = responseCache.get(cacheKey(key))
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    responseCache.delete(cacheKey(key))
    return null
  }
  return entry.content
}

function setCache(key: string, content: string): void {
  responseCache.set(cacheKey(key), { content, ts: Date.now() })
}

// ─── Core generation function ─────────────────────────────────

export async function generateReading(
  userPrompt: string,
  cacheId: string,
  maxTokens = 600
): Promise<string> {
  // Check cache first
  const cached = getCached(cacheId)
  if (cached) return cached

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.85, // slight creativity for unique readings
    })

    const content = response.choices[0]?.message?.content || 'The stars are being mysterious rn — try again in a sec.'
    setCache(cacheId, content)
    return content
  } catch (err) {
    console.error('[AI] Generation error:', err)
    return 'The cosmos is buffering rn ✨ — try again in a moment.'
  }
}

// ─── Streaming version (for deep readings) ───────────────────

export async function* generateReadingStream(
  userPrompt: string,
  maxTokens = 1200
): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.85,
    stream: true,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}

// ─── Cache key builders ───────────────────────────────────────

export function dailyCacheKey(sign: string, vertical: string, timeframe: string, date: string): string {
  return `daily:${sign}:${vertical}:${timeframe}:${date}`
}

export function weeklyCacheKey(sign: string, vertical: string, weekStart: string): string {
  return `weekly:${sign}:${vertical}:${weekStart}`
}

export function monthlyCacheKey(sign: string, vertical: string, yearMonth: string): string {
  return `monthly:${sign}:${vertical}:${yearMonth}`
}

export function yearlyCacheKey(sign: string, vertical: string, year: number): string {
  return `yearly:${sign}:${vertical}:${year}`
}
