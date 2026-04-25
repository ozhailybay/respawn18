import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiSend, FiZap } from 'react-icons/fi';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface ShadowData {
  category: string;
  profession: string;
  achievements?: string;
}

interface ShadowResult {
  strengths: string[];
  fit_score: number;
  fit_description: string;
  key_insights: string[];
  growth_plan: string[];
  best_work_style: string;
  portfolio_text: string;
  salary_junior: string;
  salary_mid: string;
  salary_senior: string;
  universities: string[];
  grants: string[];
}

interface ChoiceScenario {
  scenario: string;
  choices: string[];
}

const TIMER_SECONDS = 90;
const TOTAL_EXCHANGES = 3;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'openai/gpt-oss-120b';

const fallbackFinal = (profession: string, achievements?: string): ShadowResult => ({
  strengths: ['Аналитическое мышление', 'Ответственность', 'Адаптивность'],
  fit_score: 78,
  fit_description: `У тебя есть потенциал в направлении "${profession}", особенно в ситуациях, где важны скорость решения и ответственность.`,
  key_insights: [
    'Ты быстро принимаешь решения в условиях неопределенности.',
    'Тебе лучше подходят роли с высокой динамикой и ответственностью.',
    'Сильная сторона — умение держать фокус под давлением.',
  ],
  growth_plan: [
    'Прокачать профильные hard skills через практические проекты.',
    'Развивать коммуникацию и аргументацию решений.',
    'Собрать портфолио из 2-3 кейсов по выбранной профессии.',
  ],
  best_work_style:
    'Проектная среда с четкими целями, быстрым циклом обратной связи и зоной самостоятельных решений.',
  portfolio_text: achievements
    ? `Я развиваюсь в профессии "${profession}" и уже подтверждаю мотивацию достижениями: ${achievements}. Умею быстро анализировать ситуацию, принимать решения и доводить задачи до результата.`
    : `Я развиваюсь в профессии "${profession}", умею быстро анализировать ситуацию, принимать решения и доводить задачи до результата.`,
  salary_junior: '250 000 - 450 000 тг',
  salary_mid: '500 000 - 900 000 тг',
  salary_senior: '1 000 000+ тг',
  universities: [
    'Nazarbayev University — NUET / SAT + IELTS',
    'КБТУ — ЕНТ / внутренний конкурс + английский',
    'Satbayev University — ЕНТ профильные предметы',
  ],
  grants: [
    'Государственный образовательный грант МНВО РК',
    'Целевой грант акимата',
    'Вузовский академический грант',
  ],
});

const safeJsonParse = <T,>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
};

const buildLongIntroPrompt = (profession: string): string => `
Ты проводишь профориентационную симуляцию для школьника из Казахстана.
Профессия: ${profession}
Язык: только русский.

Сделай СТРОГО такой формат:
1) 2 предложения: кто я и где нахожусь (город Казахстана + реальный контекст).
2) 2 предложения: простая рабочая проблема уровня junior/стажер.
3) 1 предложение: что будет, если ошибиться.
4) 1 вопрос в конце: "Что ты делаешь первым и почему?"

Ограничения:
- Общий объем: 6-7 предложений.
- Без сложных терминов и без драматичных крайностей.
- Только понятные ситуации: школа, кружок, стажировка, городской проект, локальный бизнес, колледж/вуз.
- Не пиши варианты ответа.
`.trim();

const buildChoicePrompt = (profession: string, exchangeNumber: number): string => `
Ты симулятор профессий для школьников Казахстана.
Профессия: ${profession}
Обмен: ${exchangeNumber} из 3
Отвечай только валидным JSON без markdown:
{
  "scenario": "ровно 3 простых предложения с развитием сюжета и последствиями предыдущего решения",
  "choices": ["вариант 1", "вариант 2", "вариант 3"]
}
Требования:
- Сценарий: только бытовой реалистичный контекст Казахстана.
- Без сложных профессиональных терминов и без лишней драмы.
- Каждый вариант в choices: 6-10 слов, очень конкретный, понятный школьнику.
- Вариант 1: осторожный/безопасный шаг.
- Вариант 2: сбалансированный шаг.
- Вариант 3: более смелый шаг.
- Не пиши ничего кроме JSON.
`.trim();

const buildFinalPrompt = (profession: string, achievements?: string): string => `
Ты карьерный аналитик для школьников Казахстана.
Профессия: ${profession}
Верни ТОЛЬКО валидный JSON без markdown в структуре:
{
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "fit_score": число 1-100,
  "fit_description": "2-3 предложения",
  "key_insights": ["4-6 конкретных инсайтов о стиле принятия решений, мотивации и рисках"],
  "growth_plan": ["3-5 шагов роста на ближайшие 6-12 месяцев"],
  "best_work_style": "1-2 предложения о лучшем формате работы для пользователя",
  "portfolio_text": "красивый, профессиональный текст от первого лица (5-7 предложений), с сильным позиционированием, достижениями: ${achievements || 'нет данных'}, и акцентом на ценность для команды/проекта",
  "salary_junior": "строка в тенге",
  "salary_mid": "строка в тенге",
  "salary_senior": "строка в тенге",
  "universities": ["три строки, включая реальные условия поступления (NUET/SAT+IELTS для NU)"],
  "grants": ["2-3 реальных гранта МОН РК"]
}
`.trim();

const parseAiError = (e: unknown): string => {
  if (e instanceof Error) {
    if (e.message.includes('API_KEY_INVALID')) return 'Неверный Gemini API ключ';
    if (e.message.includes('PERMISSION_DENIED')) return 'Нет доступа к Gemini API (проверь API restrictions)';
    if (e.message.includes('RESOURCE_EXHAUSTED')) return 'Квота Gemini исчерпана';
    if (e.message.includes('invalid_api_key')) return 'Неверный Groq API ключ';
    if (e.message.includes('rate_limit')) return 'Превышен лимит запросов Groq';
    if (e.message.includes('429')) return 'Слишком много запросов к Gemini (429)';
    if (e.message.includes('400')) return 'Ошибка запроса к Gemini (400)';
    return e.message;
  }
  return 'Неизвестная ошибка AI';
};

const normalizeChoices = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : String(item || '').trim()))
    .filter(Boolean)
    .slice(0, 3);
};

const ShadowSimulate: React.FC = () => {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugError, setDebugError] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [aiMode, setAiMode] = useState<'groq' | 'gemini' | 'fallback'>('groq');
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);

  const shadowData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('shadowData') || 'null') as ShadowData | null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!shadowData?.profession) navigate('/shadow');
  }, [navigate, shadowData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isLoading || exchangeCount >= TOTAL_EXCHANGES) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exchangeCount, isLoading]);

  useEffect(() => {
    if (timeLeft === 0 && !isLoading && exchangeCount < TOTAL_EXCHANGES) {
      if (currentChoices.length > 0) {
        void handleSend(currentChoices[0]);
      } else {
        void handleSend('Время вышло, выбираю максимально безопасное и практичное решение.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const resetTimer = () => setTimeLeft(TIMER_SECONDS);

  const setAiFailed = (e: unknown) => {
    setAiMode('fallback');
    const details = parseAiError(e);
    setDebugError(details);
    setError(`AI временно недоступен: ${details}`);
  };

  const clearAiError = () => {
    if (debugError) setDebugError('');
    if (error.startsWith('AI временно недоступен:')) setError('');
  };

  const askGroq = async (prompt: string, history?: ChatMessage[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GROQ_API_KEY не задан');
    }

    const messagesForGroq: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: 'Ты AI-симулятор профессий для школьников Казахстана. Отвечай только на русском языке.',
      },
      ...(history || []).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messagesForGroq,
        temperature: 0.6,
        top_p: 1,
        max_completion_tokens: 2048,
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
  };

  const askGemini = async (prompt: string, history?: ChatMessage[]): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY не задан');
    }

    const historyText =
      history?.map((m) => `${m.role === 'assistant' ? 'AI' : 'Пользователь'}: ${m.content}`).join('\n') || '';
    const fullPrompt = `${prompt}\n\nИстория диалога:\n${historyText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1400,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Gemini вернул пустой ответ');
    }
    return text;
  };

  const askModel = async (prompt: string, history?: ChatMessage[]): Promise<string> => {
    try {
      const groqText = await askGroq(prompt, history);
      setAiMode('groq');
      return groqText;
    } catch {
      const geminiText = await askGemini(prompt, history);
      setAiMode('gemini');
      return geminiText;
    }
  };

  const startFirstScenario = async () => {
    if (!shadowData || messages.length) return;
    setIsLoading(true);
    setError('');
    setDebugError('');
    setCurrentChoices([]);
    try {
      const firstPrompt = buildLongIntroPrompt(shadowData.profession);
      const text = await askModel(firstPrompt, [{ role: 'user', content: 'Начни симуляцию.' }]);
      clearAiError();
      setMessages([{ role: 'assistant', content: text.trim() }]);
    } catch (e) {
      setAiFailed(e);
      setMessages([
        {
          role: 'assistant',
          content: `Моя смена как ${shadowData.profession.toLowerCase()} начинается с критической ситуации: команда на грани провала сроков, клиент уже ждет результат, а ресурсы ограничены. Я беру ответственность на себя, потому что мое решение повлияет на качество, деньги и репутацию проекта. Один неверный шаг — и мы теряем доверие. Что ты делаешь первым и почему?`,
        },
      ]);
    } finally {
      setIsLoading(false);
      resetTimer();
    }
  };

  useEffect(() => {
    void startFirstScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadowData]);

  const getFinalResult = async (history: ChatMessage[]): Promise<ShadowResult> => {
    if (!shadowData) return fallbackFinal('Профессия');
    const finalPrompt = buildFinalPrompt(shadowData.profession, shadowData.achievements);

    try {
      const raw = await askModel(finalPrompt, history);
      const parsed = safeJsonParse<ShadowResult>(raw);
      if (parsed && Array.isArray(parsed.strengths)) {
        clearAiError();
        return parsed;
      }

      const repair = await askModel(
        `Преобразуй текст в валидный JSON строго по требуемой структуре, без markdown. Текст:\n${raw}`
      );
      const repaired = safeJsonParse<ShadowResult>(repair);
      if (repaired && Array.isArray(repaired.strengths)) {
        clearAiError();
        return repaired;
      }

      setAiMode('fallback');
      return fallbackFinal(shadowData.profession, shadowData.achievements);
    } catch (e) {
      setAiFailed(e);
      return fallbackFinal(shadowData.profession, shadowData.achievements);
    }
  };

  const handleSend = async (forcedText?: string) => {
    if (!shadowData || isLoading) return;
    const userText = forcedText ?? input.trim();
    if (!userText) return;

    const newHistory: ChatMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(newHistory);
    setInput('');
    setError('');

    const nextCount = exchangeCount + 1;
    setExchangeCount(nextCount);
    setIsLoading(true);

    try {
      if (nextCount >= TOTAL_EXCHANGES) {
        const finalResult = await getFinalResult(newHistory);
        localStorage.setItem('shadowResult', JSON.stringify(finalResult));
        setCurrentChoices([]);
        navigate('/result');
        return;
      }

      try {
        const choicePrompt = buildChoicePrompt(shadowData.profession, nextCount + 1);
        const raw = await askModel(choicePrompt, newHistory);
        const parsed = safeJsonParse<ChoiceScenario>(raw);
        const choices = normalizeChoices(parsed?.choices);
        const scenarioText =
          parsed?.scenario?.trim() ||
          `Твое решение "${userText}" уже повлияло на ситуацию. Нужно быстро выбрать следующий ход.`;

        clearAiError();
        setCurrentChoices(
          choices.length
            ? choices
            : [
                'Сразу стабилизировать риски и зафиксировать минимально безопасный план.',
                'Проверить данные и принять решение после короткой экспресс-оценки.',
                'Делегировать часть задач и сфокусироваться на критическом узком месте.',
              ]
        );
        setMessages((prev) => [...prev, { role: 'assistant', content: scenarioText }]);
      } catch (e) {
        setAiFailed(e);
        setCurrentChoices([
          'Сначала снижаю риски и фиксирую базовый план.',
          'Быстро сверяю факты и выбираю наиболее эффективный вариант.',
          'Делегирую часть задач и закрываю критический блок лично.',
        ]);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Твой ответ "${userText}" дал последствия. Ситуация усложнилась, времени мало — выбери следующий шаг.`,
          },
        ]);
      }
    } catch {
      setError('Ошибка обработки. Попробуй еще раз.');
    } finally {
      setIsLoading(false);
      resetTimer();
    }
  };

  const timerProgress = (timeLeft / TIMER_SECONDS) * 100;
  const isChoiceStep = exchangeCount >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 rounded-2xl border border-gray-800 bg-gray-950/90 p-4 shadow-2xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Shadowing: {shadowData?.profession || 'Профессия'}</h1>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-3 py-1 text-sm">
                <FiClock />
                {timeLeft}с
              </div>
              <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
                aiMode === 'groq'
                  ? 'bg-fuchsia-600/20 text-fuchsia-300'
                  : aiMode === 'gemini'
                    ? 'bg-emerald-600/20 text-emerald-300'
                    : 'bg-amber-600/20 text-amber-300'
              }`}>
                <FiZap />
                {aiMode === 'groq' ? 'Groq AI' : aiMode === 'gemini' ? 'Gemini AI' : 'Fallback'}
              </div>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-400">Быстрые решения: {exchangeCount} / {TOTAL_EXCHANGES}</p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-800">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${(Math.min(exchangeCount, TOTAL_EXCHANGES) / TOTAL_EXCHANGES) * 100}%` }}
            />
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-gray-800">
            <div
              className={`h-1 rounded-full transition-all ${timeLeft <= 15 ? 'bg-red-400' : 'bg-blue-400'}`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        </div>

        <div className="mb-4 h-[56vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950/80 p-4">
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <motion.div
                key={`${idx}-${m.role}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user' ? 'bg-white text-black' : 'border border-gray-700 bg-gray-900 text-white'
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
            {isLoading && <p className="text-sm text-gray-400">AI анализирует ситуацию...</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        {error && <p className="mb-2 text-sm text-red-300">{error}</p>}
        {debugError && <p className="mb-2 text-xs text-gray-500">DIAG: {debugError}</p>}

        {isChoiceStep ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Выбери, как поступить дальше:</p>
            <div className="grid gap-2">
              {currentChoices.map((choice, index) => (
                <button
                  key={`${index}-${choice}`}
                  onClick={() => void handleSend(choice)}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-left text-sm text-white transition hover:border-gray-500 disabled:opacity-40"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-white outline-none focus:border-gray-500"
              placeholder="Опиши, что ты делаешь первым и почему..."
            />
            <button
              onClick={() => void handleSend()}
              disabled={isLoading || !input.trim()}
              className="inline-flex h-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-black disabled:opacity-40"
            >
              <FiSend />
              Отправить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShadowSimulate;

