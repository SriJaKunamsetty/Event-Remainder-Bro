import type { GenerativeModelPort } from './assistant-service';

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
}
interface GeminiResponsePayload {
  candidates?: GeminiCandidate[];
  usageMetadata?: { totalTokenCount?: number };
}

function parseGeminiResponse(data: GeminiResponsePayload): { text: string; tokenUsage: number } {
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const tokenUsage = data.usageMetadata?.totalTokenCount ?? 0;
  return { text, tokenUsage };
}

/**
 * Concrete implementation of GenerativeModelPort targeting Google Gemini REST API.
 * Keeps dependencies zero-overhead (no bloated vendor SDKs), and supports AbortSignal.
 */
export class GeminiRestAdapter implements GenerativeModelPort {
  constructor(
    private readonly apiKey: string = process.env.GEMINI_API_KEY ?? '',
    private readonly model: string = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  ) {}

  public async generateStructuredResponse(params: {
    readonly systemPrompt: string;
    readonly userPrompt: string;
    readonly temperature: number;
    readonly signal?: AbortSignal;
  }): Promise<{ readonly text: string; readonly tokenUsage: number }> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const requestBody = {
      systemInstruction: { parts: [{ text: params.systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: params.userPrompt }] }],
      generationConfig: { temperature: params.temperature, maxOutputTokens: 1024 },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: params.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 150)}`);
    }

    const data = (await response.json()) as GeminiResponsePayload;
    return parseGeminiResponse(data);
  }
}
