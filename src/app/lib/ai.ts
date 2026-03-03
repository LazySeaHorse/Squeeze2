import { useAppStore, type CompressionLevel, type TonePreset } from '../stores/appStore';

function buildPrompt(text: string, level: CompressionLevel, tone: TonePreset): string {
  const levelDesc: Record<CompressionLevel, string> = {
    0: 'Return the text as-is, cleaned up slightly for clarity. Preserve all Markdown formatting.',
    1: 'Summarize the text into a concise paragraph that captures all key points. Use Markdown formatting (bold for key terms, headings if appropriate).',
    2: 'Compress the text into 1-2 brief sentences capturing the essence. Use Markdown bold for the most important terms.',
    3: 'Extract only the core keywords or key phrases. Format as a single line with phrases separated by " · ". Bold the most critical term using Markdown **bold**.',
  };

  const toneDesc: Record<TonePreset, string> = {
    normal: 'Use a clear, neutral tone.',
    eli5: 'Explain it like I\'m 5 years old. Use simple words and analogies.',
    noJargon: 'Remove all technical jargon. Use plain, everyday language.',
    bullets: 'Format as a Markdown bullet list using "- " prefix for each point.',
  };

  return `${levelDesc[level]} ${toneDesc[tone]}

Text to process:
${text}

Respond ONLY with the processed text in Markdown format, no preamble or explanation.`;
}

export interface AIResult {
  text: string;
  model: string;
  tokens?: number;
  error?: string;
}

export async function generateCompression(
  inputText: string,
  level: CompressionLevel,
  tone: TonePreset,
  onChunk?: (chunk: string) => void
): Promise<AIResult> {
  const { settings } = useAppStore.getState();
  const prompt = buildPrompt(inputText, level, tone);

  // Try Groq first, then OpenRouter
  if (settings.groqKey) {
    return callGroq(settings.groqKey, settings.selectedModel, prompt, onChunk);
  }

  if (settings.openRouterKey) {
    return callOpenRouter(settings.openRouterKey, settings.selectedModel, prompt, onChunk);
  }

  // Fallback: simulate
  return simulateAI(inputText, level, tone);
}

async function callGroq(
  apiKey: string,
  model: string,
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<AIResult> {
  // Use a Groq-compatible model name
  const groqModel = model.includes('/') ? 'llama-3.3-70b-versatile' : model;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [{ role: 'user', content: prompt }],
        stream: !!onChunk,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { text: '', model: groqModel, error: `Groq error ${res.status}: ${err}` };
    }

    if (onChunk && res.body) {
      return streamResponse(res.body, groqModel, onChunk);
    }

    const data = await res.json();
    return {
      text: data.choices[0].message.content.trim(),
      model: groqModel,
      tokens: data.usage?.total_tokens,
    };
  } catch (e: any) {
    return { text: '', model: groqModel, error: e.message };
  }
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  onChunk?: (chunk: string) => void
): Promise<AIResult> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Squeeze 2.0',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: !!onChunk,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { text: '', model, error: `OpenRouter error ${res.status}: ${err}` };
    }

    if (onChunk && res.body) {
      return streamResponse(res.body, model, onChunk);
    }

    const data = await res.json();
    return {
      text: data.choices[0].message.content.trim(),
      model,
      tokens: data.usage?.total_tokens,
    };
  } catch (e: any) {
    return { text: '', model, error: e.message };
  }
}

async function streamResponse(
  body: ReadableStream<Uint8Array>,
  model: string,
  onChunk: (chunk: string) => void
): Promise<AIResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          full += content;
          onChunk(full);
        }
      } catch {}
    }
  }

  return { text: full, model };
}

function simulateAI(
  text: string,
  level: CompressionLevel,
  tone: TonePreset
): Promise<AIResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sentences = text
        .replace(/\n\n/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim());

      let result = text;

      if (level === 1) {
        const picked = sentences.slice(0, Math.min(4, sentences.length));
        result = tone === 'bullets'
          ? picked.map((s) => `- ${s.trim()}`).join('\n')
          : `## Summary\n\n${picked.join(' ')}`;
      } else if (level === 2) {
        const picked = sentences.slice(0, Math.min(2, sentences.length));
        result = tone === 'bullets'
          ? picked.map((s) => `- ${s.trim()}`).join('\n')
          : `**${picked.join(' ')}**`;
      } else if (level === 3) {
        const words = text
          .replace(/[^a-zA-Z\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 5);
        const kw = [...new Set(words)].slice(0, 6);
        result = kw.length > 0
          ? `**${kw[0]}** · ${kw.slice(1).join(' · ')}`
          : '';
      }

      resolve({ text: result, model: 'simulated' });
    }, 600 + Math.random() * 400);
  });
}