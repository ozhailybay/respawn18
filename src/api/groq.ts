interface GroqOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

export async function generateGroqText(prompt: string, options: GroqOptions = {}): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY не задан');
  }

  if (!prompt.trim()) {
    throw new Error('Пустой запрос');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content:
            options.systemPrompt ||
            'Ты AI-ментор для школьников и студентов Казахстана. Отвечай только на русском, давай практичные и короткие рекомендации.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature ?? 0.65,
      top_p: 1,
      max_completion_tokens: options.maxTokens ?? 1200,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq вернул пустой ответ');

  return text;
}

