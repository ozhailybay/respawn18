import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateText } from '../../api/gemini';
import ShadowChatMessage from '../../components/shadowing/ShadowChatMessage';
import {
  readShadowOnboarding,
  saveShadowResult,
} from '../../components/shadowing/storage';
import type { ShadowChatMessage as ShadowChatMessageType, ShadowResult } from '../../components/shadowing/types';

const createMessage = (role: 'user' | 'assistant', content: string): ShadowChatMessageType => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  createdAt: new Date().toISOString(),
});

const parseShadowResult = (rawText: string): ShadowResult | null => {
  try {
    return JSON.parse(rawText) as ShadowResult;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    try {
      return JSON.parse(jsonMatch[0]) as ShadowResult;
    } catch {
      return null;
    }
  }
};

const ShadowSimulationPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ShadowChatMessageType[]>([]);
  const [userInput, setUserInput] = useState('');
  const [userRepliesCount, setUserRepliesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const onboarding = readShadowOnboarding();

  useEffect(() => {
    if (!onboarding) {
      navigate('/shadow');
    }
  }, [onboarding, navigate]);

  const conversationHistory = useMemo(
    () =>
      messages
        .map((item) => `${item.role === 'assistant' ? 'AI' : 'Школьник'}: ${item.content}`)
        .join('\n'),
    [messages]
  );

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const startSimulation = async () => {
      if (!onboarding || messages.length > 0) return;
      setIsLoading(true);
      setError('');

      const prompt = `
Ты — симулятор профессий для школьников Казахстана. Отвечай только на русском языке.
Профессия: ${onboarding.profession}
Номер обмена: 1 из 3
История диалога: нет, это начало
Последний ответ школьника: старт симуляции

Если это первый обмен (номер 1) — начни с драматичного рабочего сценария от первого лица (3-4 предложения), потом задай ОДИН конкретный вопрос-решение с реальными последствиями. Никаких вариантов ответа — только живая ситуация.

Пиши живо, без занудства. Максимум 5 предложений.
      `.trim();

      try {
        const aiText = await generateText(prompt, 'default', { useCache: false, temperature: 0.8 });
        setMessages([createMessage('assistant', aiText.trim())]);
      } catch {
        setMessages([
          createMessage(
            'assistant',
            'Ночная смена. В приёмное отделение одновременно поступают два пациента, и у тебя есть всего 90 секунд, чтобы выбрать, кого стабилизировать первым. Ошибка может стоить жизни. Что ты делаешь и почему?'
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    startSimulation();
  }, [onboarding, messages.length]);

  const handleFinish = async (fullMessages: ShadowChatMessageType[]) => {
    if (!onboarding) return;
    const fullHistory = fullMessages
      .map((item) => `${item.role === 'assistant' ? 'AI' : 'Школьник'}: ${item.content}`)
      .join('\n');

    const finalPrompt = `
Ты — карьерный аналитик для школьников Казахстана. Отвечай только на русском языке.
Профессия: ${onboarding.profession}
Вся история симуляции: ${fullHistory}

Дай финальный разбор в формате JSON:
{
  "strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"],
  "fit_score": число от 1 до 100,
  "fit_description": "2-3 предложения — подходит ли эта профессия и почему",
  "portfolio_text": "готовый текст о себе для резюме/профиля (3-4 предложения, от первого лица, профессионально) — используй достижения из онбординга если они есть: ${onboarding.achievements || 'нет данных'}",
  "salary_junior": "зарплата джуна в тенге",
  "salary_mid": "зарплата мида в тенге",
  "salary_senior": "зарплата сеньора в тенге",
  "top_universities": ["вуз 1 с проходным баллом ЕНТ", "вуз 2", "вуз 3"],
  "grants": ["грант 1 МОН РК", "грант 2"]
}

Данные по зарплатам и вузам Казахстана — используй реальные актуальные данные.
    `.trim();

    let parsed: ShadowResult | null = null;

    try {
      const finalText = await generateText(finalPrompt, 'default', {
        useCache: false,
        temperature: 0.4,
      });
      parsed = parseShadowResult(finalText);
    } catch {
      parsed = null;
    }

    if (!parsed) {
      parsed = {
        strengths: ['Стрессоустойчивость', 'Быстрая реакция', 'Ответственность за решение'],
        fit_score: 72,
        fit_description:
          'У тебя есть потенциал для этой профессии: ты принимаешь решения в условиях давления и думаешь о последствиях. Чтобы усилить результат, развивай профильные навыки и практикуйся на кейсах.',
        portfolio_text: onboarding.achievements
          ? `Я развиваюсь в направлении "${onboarding.profession}" и уже подтверждаю мотивацию реальными достижениями: ${onboarding.achievements}. Умею анализировать сложные ситуации и принимать обоснованные решения. Готов(а) работать в команде и брать ответственность за результат.`
          : `Я развиваюсь в направлении "${onboarding.profession}" и системно прокачиваю ключевые навыки. Умею анализировать сложные ситуации и принимать обоснованные решения. Готов(а) работать в команде и брать ответственность за результат.`,
        salary_junior: '250 000 - 450 000 тг',
        salary_mid: '500 000 - 900 000 тг',
        salary_senior: '1 000 000+ тг',
        top_universities: [
          'Назарбаев Университет (ЕНТ от 120+)',
          'КБТУ (ЕНТ от 100+)',
          'Satbayev University (ЕНТ от 90+)',
        ],
        grants: ['Госгранты МНВО РК по итогам ЕНТ', 'Целевые гранты акиматов и вузовские гранты'],
      };
    }

    saveShadowResult(parsed);
    navigate('/shadow/result');
  };

  const sendMessage = async () => {
    if (!onboarding || !userInput.trim() || isLoading) return;

    const content = userInput.trim();
    setUserInput('');
    setError('');

    const userMessage = createMessage('user', content);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    const nextUserCount = userRepliesCount + 1;
    setUserRepliesCount(nextUserCount);

    setIsLoading(true);
    try {
      if (nextUserCount >= 3) {
        await handleFinish(nextMessages);
        return;
      }

      const aiExchangeNumber = nextUserCount + 1;
      const prompt = `
Ты — симулятор профессий для школьников Казахстана. Отвечай только на русском языке.
Профессия: ${onboarding.profession}
Номер обмена: ${aiExchangeNumber} из 3
История диалога: ${conversationHistory}
Последний ответ школьника: ${content}

Если это первый обмен (номер 1) — начни с драматичного рабочего сценария от первого лица (3-4 предложения), потом задай ОДИН конкретный вопрос-решение с реальными последствиями. Никаких вариантов ответа — только живая ситуация.

Если это обмен 2 или 3 — продолжи сценарий исходя из ответа школьника, добавь последствия его решения, задай следующий вопрос.

Пиши живо, без занудства. Максимум 5 предложений.
      `.trim();

      const aiText = await generateText(prompt, 'default', { useCache: false, temperature: 0.8 });
      setMessages((prev) => [...prev, createMessage('assistant', aiText.trim())]);
    } catch {
      setError('Сбой связи с AI. Попробуй отправить ответ ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!onboarding) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-6 md:px-8">
        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-950 p-4">
          <p className="text-sm text-gray-400">Shadowing AI / Ночная смена</p>
          <h1 className="mt-1 text-xl font-semibold md:text-2xl">
            Симуляция профессии: {onboarding.profession}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Обменов завершено: {userRepliesCount} из 3
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-800">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${Math.min(100, (userRepliesCount / 3) * 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-4 h-[58vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ShadowChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                className="text-sm text-gray-400"
              >
                AI анализирует ситуацию...
              </motion.div>
            )}
            <div ref={chatBottomRef} />
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={3}
            placeholder="Напиши, какое решение ты принимаешь и почему..."
            className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-900 p-3 text-sm text-white outline-none focus:border-gray-400"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !userInput.trim()}
            className="h-fit rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShadowSimulationPage;

