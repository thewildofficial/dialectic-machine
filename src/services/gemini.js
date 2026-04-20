/**
 * Gemini AI service for auto-populating entry metadata
 * All API calls are made directly from the browser - keys stay local
 */

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const DEFAULT_GEMINI_MODEL = 'gemma-4-31b-it'
const BASE_MAX_OUTPUT_TOKENS = 800
const RETRY_MAX_OUTPUT_TOKENS = 1600

function isThinkingModel(model) {
  return model.startsWith('gemini-2.5') || model.startsWith('gemini-3')
}

function buildGenerationConfig(model, maxOutputTokens = BASE_MAX_OUTPUT_TOKENS) {
  const config = {
    temperature: 0.2,
    maxOutputTokens,
    // Ask Gemini to return strict JSON, not prose/markdown.
    responseMimeType: 'application/json',
  }

  // Prevent hidden "thoughts" from consuming output budget on thinking models.
  if (isThinkingModel(model)) {
    config.thinkingConfig = { thinkingBudget: 0 }
  }

  return config
}

/**
 * Analyze a quote/text and suggest entry metadata
 * @param {string} content - The quote or text to analyze
 * @param {string} context - Optional additional context
 * @param {string} apiKey - The Gemini API key
 * @param {string} model - Gemini model to use
 * @returns {Promise<{type: string, source: string, url: string, tags: string[], commentary: string}>}
 */
export async function analyzeEntry(content, context = '', apiKey, model = DEFAULT_GEMINI_MODEL) {
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  if (!content.trim()) {
    throw new Error('Content is required for analysis')
  }

  const prompt = `Analyze this quote/text and extract metadata for a knowledge management system.

QUOTE/TEXT:
"""${content}"""

${context ? `ADDITIONAL CONTEXT:\n"""${context}"""` : ''}

Based on the content, determine:
1. ENTRY TYPE: One of [claim, question, idea, quote, reference, opinion, task, reflection]
2. SOURCE: Author — Title / Book / Article / Podcast (if identifiable)
3. URL: Any URL mentioned or relevant (or empty string)
4. TAGS: 3-7 relevant topical tags (comma-separated keywords)
5. COMMENTARY: Brief analytical commentary connecting this to broader themes (1-2 sentences)

Respond ONLY with valid JSON in this exact format:
{
  "type": "one of the types above",
  "source": "Author — Title or empty string",
  "url": "url or empty string",
  "tags": ["tag1", "tag2", "tag3"],
  "commentary": "analytical commentary"
}`

  const requestUrl = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`

  const runRequest = async (maxOutputTokens) => {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: buildGenerationConfig(model, maxOutputTokens),
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    return response.json()
  }

  let data = await runRequest(BASE_MAX_OUTPUT_TOKENS)

  // Check for blocked or empty responses
  if (data.candidates?.[0]?.finishReason === 'SAFETY') {
    throw new Error('Response blocked by safety filters. Try different content or a different model.')
  }

  if (data.candidates?.[0]?.finishReason === 'RECITATION') {
    throw new Error('Response blocked due to copyright concerns. Try rephrasing your content.')
  }

  // Retry once with a larger output budget if response was truncated.
  if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
    data = await runRequest(RETRY_MAX_OUTPUT_TOKENS)
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API. The model may not be available or returned empty content.')
  }

  const text = data.candidates[0].content.parts[0].text

  // Extract JSON from the response (handle markdown code blocks fallback).
  const jsonCodeBlockMatch = text.match(/```json\s*([\s\S]*?)```/) ||
                             text.match(/```\s*([\s\S]*?)```/)

  // If no code block, try to find JSON object pattern.
  const jsonObjectMatch = !jsonCodeBlockMatch && text.match(/\{[\s\S]*\}/)

  const jsonStr = jsonCodeBlockMatch
    ? jsonCodeBlockMatch[1].trim()
    : jsonObjectMatch
      ? jsonObjectMatch[0].trim()
      : text.trim()

  try {
    const result = JSON.parse(jsonStr)

    // Validate and sanitize
    const validTypes = ['claim', 'question', 'idea', 'quote', 'reference', 'opinion', 'task', 'reflection']
    const type = validTypes.includes(result.type) ? result.type : 'idea'

    return {
      type,
      source: result.source?.trim() || '',
      url: result.url?.trim() || '',
      tags: Array.isArray(result.tags) ? result.tags.map(t => t.trim().toLowerCase()) : [],
      commentary: result.commentary?.trim() || ''
    }
  } catch (err) {
    throw new Error('Failed to parse AI response. Try again or switch models.')
  }
}

/**
 * Quick paste mode - analyze clipboard content with optional context
 * @param {string} apiKey
 * @param {string} model
 * @returns {Promise<{content: string, context: string, suggestions: object}>}
 */
export async function quickPasteAnalysis(apiKey, model = DEFAULT_GEMINI_MODEL) {
  try {
    const clipboardText = await navigator.clipboard.readText()
    if (!clipboardText.trim()) {
      throw new Error('Clipboard is empty')
    }

    // Split into content and context if there's a delimiter
    const parts = clipboardText.split(/\n---\n|\n===\n/)
    const content = parts[0].trim()
    const context = parts[1]?.trim() || ''

    const suggestions = await analyzeEntry(content, context, apiKey, model)

    return { content, context, suggestions }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Clipboard access denied. Please paste manually.')
    }
    throw err
  }
}
