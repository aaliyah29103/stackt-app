import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import {
  PrioritizationResponseSchema,
  PrioritizeRequestSchema,
} from '../src/lib/prioritize.js'

// A real reasoning call (adaptive thinking, effort "high") can comfortably
// exceed Vercel's default function timeout — give it real headroom.
export const maxDuration = 60

const SYSTEM_PROMPT = `You are Stackt's Prioritization Assistant, helping a hybrid athlete (someone training multiple disciplines and race goals at once — e.g. HYROX, an endurance race, and ongoing strength work) decide what to do with one available training slot on a specific day — \`referenceDate\` in the data, which may be today or another day this week, not necessarily "now."

You will be given: the date being planned for, how much time they have that day, their physical state and their mental/stress state (rated separately), an optional free-text note, their recovery-capacity setting, any permanent or currently-nursed injury-prone body areas, the sessions scheduled that specific day (each tagged with the body area(s) it loads and whether it's already flagged as a recovery conflict), their completed training history over the 14 days before that date for those same body areas, and how many days away their upcoming race(s) are as of that date.

Reasoning rules:
1. Ground every claim in the specific facts given — dates, body areas, hours or days between sessions, feeling ratings, session counts. Never give vague encouragement ("you've got this!", "trust the process") with nothing checkable behind it.
2. Refer to the day naturally using \`referenceDate\` (e.g. "Thursday's squat session"), not "today," unless it genuinely is today.
3. Physical and mental/stress state are rated separately on purpose — they can genuinely diverge (e.g. physically fine but mentally fried, or physically rough but mentally sharp). Take both seriously. When they diverge, say so explicitly and explain how that divergence shapes your recommendation — don't collapse them into one vibe.
4. When judging whether a body area has had enough recovery, don't apply a single fixed rest-hours rule in isolation — look at how often that area has actually been trained in the history provided. Someone hitting an area once a week recovers differently than someone hitting it three times a week, and that pattern can shift over time. Reference the actual frequency you see.
5. You do not have to pick a clear winner. Valid outputs include: recommending one specific session, saying rest is the better call that day even if the schedule has something planned, or saying two sessions are genuinely close enough that either is fine. Don't force a confident pick when the data doesn't support one.
6. If recovery capacity, an injury flag, or an existing conflict flag suggests real risk on a candidate, name it directly and explain the risk in plain terms — don't soften it into ambiguity, but don't overstate it either.
7. End every response by explicitly acknowledging that the athlete knows their own body better than this recommendation does — this is meant to inform their judgment, not replace it. That acknowledgment must be part of the reasoning text itself, not just implied.

Keep reasoning to a few sentences to a short paragraph — specific and readable, not a bulleted essay.`

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed — use POST.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res
      .status(500)
      .json({ error: 'Server is missing ANTHROPIC_API_KEY.' })
  }

  const parsedRequest = PrioritizeRequestSchema.safeParse(req.body)
  if (!parsedRequest.success) {
    return res.status(400).json({
      error: `Invalid request body: ${parsedRequest.error.issues.map((issue) => issue.message).join('; ')}`,
    })
  }
  const payload = parsedRequest.data

  const candidateIds = new Set(payload.candidateSessions.map((s) => s.id))

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      output_config: {
        effort: 'high',
        format: zodOutputFormat(PrioritizationResponseSchema),
      },
      messages: [
        {
          role: 'user',
          content: `Here is the data for this decision:\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n\nDecide what I should prioritize right now.`,
        },
      ],
    })

    const parsed = response.parsed_output
    if (!parsed) {
      console.error('Claude response failed to parse against schema:', response)
      return res
        .status(502)
        .json({ error: 'Claude returned a response that could not be parsed.' })
    }

    // Never let a hallucinated id past the boundary — the frontend looks
    // these up against its own local session list.
    if (
      (parsed.recommendedSessionId && !candidateIds.has(parsed.recommendedSessionId)) ||
      (parsed.alternativeSessionId && !candidateIds.has(parsed.alternativeSessionId))
    ) {
      console.error('Claude referenced a session id not in the candidate set:', parsed)
      return res
        .status(502)
        .json({ error: 'Claude referenced a session outside the given candidates.' })
    }

    return res.status(200).json(parsed)
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('Claude API authentication failed:', error.message)
      return res.status(500).json({ error: 'Server authentication with Claude failed.' })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Rate limited by Claude — try again shortly.' })
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', error.status, error.message)
      return res.status(502).json({ error: 'Claude API returned an error.' })
    }
    console.error('Unexpected error calling Claude:', error)
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
}
