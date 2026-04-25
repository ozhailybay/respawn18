import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, updateDoc, increment, collection, query, where, getDocs, limit, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { sanitizeHTML } from '../utils/security';

// Type definitions
interface Tag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: {
    toDate: () => Date;
  };
}


type DemoPostSlug = 'how-to-create-perfect-resume' | 'top-interview-questions' | 'networking-tips' | 'tech-interview-tips' | 'cover-letter-mistakes' | 'internship-platforms-kazakhstan' | 'pomodoro-technique-for-students';

interface BlogPost {
  id: string;
  title: string;
  slug: DemoPostSlug;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: Tag[];
  author: Author;
  publishedAt: {
    toDate: () => Date;
  };
  createdAt?: {
    toDate: () => Date;
  };
  views: number;
  likes: number;
  featured: boolean;
  comments?: Comment[];
}


const DEMO_COMMENTS: Record<DemoPostSlug, Comment[]> = {
  'how-to-create-perfect-resume': [
    {
      id: 'comment1',
      userId: 'user1',
      userName: 'Талгатов Даниял',
      userAvatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      content: 'Отличная статья! Благодаря этим советам я смог составить резюме, которое привлекло внимание работодателя.',
      createdAt: {
        toDate: () => new Date('2023-05-15')
      }
    },
    {
      id: 'comment2',
      userId: 'user2',
      userName: 'Талгатов Даниял',
      userAvatar: 'https://randomuser.me/api/portraits/women/24.jpg',
      content: 'А можно еще примеры готовых резюме? Я учусь в 11 классе и хочу уже начать подготовку к поиску работы.',
      createdAt: {
        toDate: () => new Date('2023-05-16')
      }
    }
  ],
  'top-interview-questions': [
    {
      id: 'comment3',
      userId: 'user3',
      userName: 'Талгатов Даниял',
      userAvatar: 'https://randomuser.me/api/portraits/men/91.jpg',
      content: 'Готовлюсь к собеседованию в IT-компанию, эта шпаргалка просто спасение! Особенно полезны советы про GitHub-портфолио.',
      createdAt: {
        toDate: () => new Date('2023-06-02')
      }
    }
  ],
  'networking-tips': [],
  'tech-interview-tips': [],
  'cover-letter-mistakes': [],
  'internship-platforms-kazakhstan': [],
  'pomodoro-technique-for-students': []
};

// Demo posts with placeholder content for missing slugs
const DEMO_POSTS: Record<DemoPostSlug, BlogPost> = {
  'how-to-create-perfect-resume': {
    id: '1',
    title: 'Как школьнику написать первое резюме и не облажаться',
    slug: 'how-to-create-perfect-resume',
    content: `
      <h2>Вступление: ваш ключ к успеху</h2>
      <p>Представьте: вы отправили резюме, и через час вам звонит рекрутер. Звучит нереально? А между тем именно от качественного резюме зависит, получите ли вы приглашение на стажировку мечты. Давайте сделаем так, чтобы ваше первое резюме стало магнитом для работодателей.</p>
      
      <h2>1. Шапка: сразу цепляйте взгляд</h2>
      <ul>
        <li><strong>ФИО и возраст</strong>: Алексей Иванов, 16 лет</li>
        <li><strong>Контакты</strong>: +7 701 123-45-67 · ivanov.alex@mail.com · LinkedIn/Telegram</li>
        <li><strong>Цель</strong> (кратко): «Стажёр-разработчик Python в IT-стартапе»</li>
      </ul>
      <blockquote>
        <p><strong>Совет:</strong> используйте современную шрифт и не забывайте про иконки для телефона и почты — так ваше резюме сразу выглядит профессионально.</p>
      </blockquote>
      
      <h2>2. Образование и достижения</h2>
      <ol>
        <li><strong>Школа</strong>: «Лицей № 12, профиль — информационные технологии» (2022–2025)</li>
        <li><strong>Курсы и сертификаты</strong>:
          <ul>
            <li>«Основы Python», Stepik (март 2025)</li>
            <li>«Веб-разработка», Hexlet (апрель 2025)</li>
          </ul>
        </li>
        <li><strong>Достижения</strong>:
          <ul>
            <li>Победитель хакатона «CodeFest» (1 место)</li>
            <li>Автор школьного IT-клуба (провёл 5 мастер-классов)</li>
          </ul>
        </li>
      </ol>
      <blockquote>
        <p><strong>Фишка:</strong> цифры и конкретика! «+30% скорости загрузки» звучит намного убедительнее, чем «работал над ускорением сайта».</p>
      </blockquote>
      
      <h2>3. Практический опыт: даже если он минимален</h2>
      <ul>
        <li><strong>GitHub-репозиторий</strong>: github.com/alex-ivanov/portfolio</li>
        <li><strong>Мини-проект</strong>: «ToDo-приложение на Flask» —
          <ul>
            <li>регистрация и авторизация пользователей</li>
            <li>REST-API для управления задачами</li>
            <li>простая схема БД на SQLite</li>
          </ul>
        </li>
      </ul>
      <blockquote>
        <p><strong>Секрет:</strong> в описании проекта укажите, какие библиотеки вы использовали и для чего: это покажет вашу глубину знаний.</p>
      </blockquote>
      
      <h2>4. Топ-3 навыка, которые ищут работодатели</h2>
      <table>
        <thead>
          <tr>
            <th>Навык</th>
            <th>Уровень</th>
            <th>Как прокачать</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Python</td>
            <td>★★★★☆</td>
            <td>Решайте задачи на Codewars</td>
          </tr>
          <tr>
            <td>HTML/CSS/JS</td>
            <td>★★★☆☆</td>
            <td>Доработайте стиль своего сайта</td>
          </tr>
          <tr>
            <td>Git и GitHub Flow</td>
            <td>★★★★☆</td>
            <td>Ведите ветки и пулл-реквесты</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <p><strong>Подсказка:</strong> добавьте шкалу «звёздочек» или прогресс-бар — это читается на ура.</p>
      </blockquote>
      
      <h2>5. Личные качества и мотивация</h2>
      <blockquote>
        <p>«Люблю учиться новому и доводить задачи до конца. Ценю командную работу и готов вкладываться на 100 %.»</p>
      </blockquote>
      <ul>
        <li><strong>Командный игрок:</strong> участвовал в трёх школьных проектах</li>
        <li><strong>Усидчивость:</strong> писал код по 3 часа подряд, пока не заработал</li>
      </ul>
      
      <h2>6. Дополнительные блоки (по желанию)</h2>
      <ul>
        <li><strong>Языки</strong>: русский (родной), английский (B1)</li>
        <li><strong>Интересы</strong>: киберспортивные турниры, робототехника</li>
      </ul>
      
      <h2>Заключение и шаблон «call-to-action»</h2>
      <p>Поздравляем — ваше резюме готово!</p>
      <ol>
        <li>Сохраните в PDF и проверьте верстку.</li>
        <li>Отправьте первым письмом:
          <blockquote>
            <p>«Добрый день, [Имя]! С радостью направляю своё резюме на вакансию…»</p>
          </blockquote>
        </li>
        <li>Ждите отклика и готовьтесь к первому собеседованию.</li>
      </ol>
      <blockquote>
        <p><strong>Бонус:</strong> приложите портфолио-ссылку в письме и в подписи — пусть HR сразу перейдёт к вашим работам.</p>
      </blockquote>
      
      <p>🎉 Теперь вы полностью вооружены: от шапки до финального письма.</p>
      <p><em>Не бойтесь отправлять резюме — каждая отправка приближает вас к первой настоящей практике!</em></p>
    `,
    excerpt: 'Шаг-за-шагом разберём идеальную структуру, расскажем, какие ключевые слова добавить и как оформить шаблон, чтобы HR сразу заметил ваш профиль.',
    coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070',
    category: 'Резюме и письма',
    tags: [
      { id: 'tag1', name: 'резюме' },
      { id: 'tag2', name: 'школьники' },
      { id: 'tag3', name: 'шаблоны' },
      { id: 'tag4', name: 'HR' }
    ],
    author: {
      id: 'author1',
      name: 'Талгатов Даниял',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
      role: 'HR-консультант'
    },
    publishedAt: {
      toDate: () => new Date('2023-05-12')
    },
    views: 125,
    likes: 18,
    featured: true
  },
  'top-interview-questions': {
    id: '5',
    title: 'AI-генератор резюме: настройки для школьников',
    slug: 'top-interview-questions',
    content: `
      <h2>Введение</h2>
      <p>Для школьников составить резюме — почти миссия невыполнима: опыта мало, а хочется произвести впечатление. Сегодня AI-генераторы умеют не только подставлять шаблоны, но и «чувствовать» ваш профиль, помогая грамотно расставить акценты. Рассказываем, какие параметры выставить, чтобы получить сильное резюме за пару минут.</p>
      
      <h2>1. Задайте правильный тон</h2>
      <ul>
        <li><strong>Уровень формальности.</strong> Выберите «нейтрально-деловой» или «молодёжный», чтобы текст звучал не чересчур сухо, но и не слишком фамильярно.</li>
        <li><strong>Акцент на достижениях.</strong> В настройках укажите: «Выделить учебные проекты, волонтёрство и внеурочные активности». Даже кружок робототехники или участие в школьном медиапроекте — ценный опыт.</li>
        <li><strong>Пример подсказки:</strong>
          <blockquote>
            <p>«Сформируй резюме для старшеклассника, подчеркнув командные проекты и навыки публичных выступлений.»</p>
          </blockquote>
        </li>
      </ul>
      
      <h2>2. Выберите ключевые разделы</h2>
      <p>AI-генератор может сам добавить нужные блоки. Рекомендуем включить:</p>
      <ol>
        <li><strong>Контактные данные</strong> (телефон, email, ссылка на профиль Respawn).</li>
        <li><strong>Цель/Objective</strong>: одно-два предложения о том, какую стажировку вы ищете и зачем.</li>
        <li><strong>Образование</strong>: школьный уклон стоит развивать, добавив профильный класс, профильные курсы.</li>
        <li><strong>Проекты и мероприятия</strong>: лабораторная работа, участие в хакатоне, лидерство в школьном клубе.</li>
        <li><strong>Навыки</strong>: софт (коммуникация, тайм-менеджмент) и базовые hard skills (MS Office, основы программирования).</li>
      </ol>
      
      <h2>3. Настройте формат и дизайн</h2>
      <ul>
        <li><strong>Шаблон</strong>: одно-колоночный, без излишних графических элементов — чтобы ATS (системы автоматического разбора резюме) и преподаватели легко читали.</li>
        <li><strong>Шрифт и размеры</strong>: Arial или Roboto, 10–12 pt, заголовки 14–16 pt.</li>
        <li><strong>Поля и интервалы</strong>: стандартные (2–2.5 см), между разделами — чёткий отступ 8–12 pt.</li>
      </ul>
      
      <h2>4. Проверьте и адаптируйте вручную</h2>
      <ul>
        <li><strong>Орфография и пунктуация.</strong> AI грамотно расставляет запятые, но иногда «сливает» слова — пройдитесь проверкой.</li>
        <li><strong>Локация и формат.</strong> Перед подачей на конкретную стажировку уточните, нужен ли формат PDF или DOCX.</li>
        <li><strong>Персонализация под роль.</strong> Для каждой вакансии меняйте Objective и ключевые навыки, добавляя термины из описания работодателя.</li>
      </ul>
      
      <h2>Заключение</h2>
      <p>С AI-генератором даже новичок за пару кликов получает аккуратное, ёмкое и структурированное резюме. Остаётся только добавить каплю индивидуальности: честно указать свой учебный опыт и стремление учиться дальше. Готовы попробовать? Зайдите в раздел <strong>Resume Generator</strong> на Respawn и создайте своё первое «взрослое» резюме уже сегодня!</p>
    `,
    excerpt: 'Как использовать искусственный интеллект для создания профессионального резюме, даже если у вас минимальный опыт.',
    coverImage: 'https://images.unsplash.com/photo-1679403766669-957cc2fafef8?q=80&w=2070',
    category: 'Резюме и письма',
    tags: [
      { id: 'tag5', name: 'AI' },
      { id: 'tag2', name: 'школьники' },
      { id: 'tag6', name: 'резюме' },
      { id: 'tag7', name: 'генератор' }
    ],
    author: {
      id: 'author1',
      name: 'Талгатов Даниял',
      avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
      role: 'HR-консультант'
    },
    publishedAt: {
      toDate: () => new Date('2023-04-28')
    },
    views: 76,
    likes: 11,
    featured: false
  },
  'networking-tips': {
    id: '8',
    title: 'Как устроить стажёрскую программу для школьников',
    slug: 'networking-tips',
    content: `
      <h2>Введение: почему школьники — будущее вашей компании</h2>
      <p>Школьники приходят к вам с чистым взглядом и жаждой знаний. Они умеют быстро осваивать цифровые инструменты и привносят свежие идеи в устоявшиеся процессы. Стажёрская программа для подростков — это не просто социальная миссия, но и способ заложить фундамент кадрового резерва и укрепить бренд работодателя на рынке труда.</p>
      
      <blockquote>
        <p><strong>«Те, кто учится сегодня — будут управлять завтра»</strong><br>
        ― Даниэль Пинк, автор «Драйва»</p>
      </blockquote>
      
      <h2>Шаг 1. Определите чёткие цели и KPI</h2>
      <ol>
        <li><strong>Что вы хотите дать подростку?</strong>
          <ul>
            <li>Практические навыки (HTML/CSS, работа с CRM, базовый анализ данных).</li>
            <li>Навыки soft skills (командная работа, тайм-менеджмент, публичные выступления).</li>
          </ul>
        </li>
        <li><strong>Что вы хотите получить от стажёра?</strong>
          <ul>
            <li>Мини-проект в виде лэндинга или простого приложения.</li>
            <li>Идеи для улучшения внутренних процессов.</li>
          </ul>
        </li>
        <li><strong>Как будете измерять успех?</strong>
          <ul>
            <li>Количество реализованных задач.</li>
            <li>Отзывы наставников и самих школьников.</li>
            <li>Длительность дальнейшего сотрудничества.</li>
          </ul>
        </li>
      </ol>
      
      <h2>Шаг 2. Подготовьте программу и расписание</h2>
      <ul>
        <li><strong>Длительность</strong>: 4–6 недель, 3–4 дня в неделю, по 3–4 часа в день.</li>
        <li><strong>Структура</strong>:
          <ol>
            <li><strong>Онбординг</strong> — вводный день: знакомство с командой и инструментами.</li>
            <li><strong>Теория + практика</strong> — короткие лекции и сразу же практические задания.</li>
            <li><strong>Менторские сессии</strong> — раз в неделю разбор самых сложных моментов.</li>
            <li><strong>Итоговый проект</strong> — защита мини-кейса перед руководителем.</li>
          </ol>
        </li>
      </ul>
      
      <blockquote>
        <p><strong>Совет:</strong> добавьте внутрь программы «challenge-день», когда школьники сами формулируют задачи для бизнеса.</p>
      </blockquote>
      
      <h2>Шаг 3. Назначьте опытных наставников</h2>
      <ul>
        <li><strong>Критерии отбора ментора</strong>: терпеливость, умение объяснять сложное простыми словами, желание развивать новое поколение.</li>
        <li><strong>Формат работы</strong>:
          <ul>
            <li>Ежедневные «stand-up»-совещания (10 мин).</li>
            <li>Еженедельные проверки прогресса (30 мин).</li>
            <li>Онлайн-чат для оперативных вопросов.</li>
          </ul>
        </li>
        <li><strong>Материальная мотивация</strong>: сертификаты, растущие оценки и рекомендация для будущей работы.</li>
      </ul>
      
      <h2>Шаг 4. Подготовьте реальные кейсы</h2>
      <ol>
        <li><strong>Автоматизация рутинной задачи</strong> (например, парсинг данных из Excel)</li>
        <li><strong>Разработка простого сайта-визитки</strong> (Landing Page для нового продукта)</li>
        <li><strong>Анализ рынка</strong> (составить краткий отчёт по конкурентам)</li>
      </ol>
      
      <blockquote>
        <p><strong>Важно:</strong> кейсы должны быть небольшими, но результативными — пусть школьник увидит результат своего труда уже в первую неделю.</p>
      </blockquote>
      
      <h2>Шаг 5. Организуйте обратную связь и презентацию</h2>
      <ul>
        <li><strong>Ежедневная мини-ревью</strong>: что получилось, что затруднило, какие следующие шаги.</li>
        <li><strong>Итоговая презентация</strong>: школьник презентует свой проект перед вами и получает бейдж «Junior-талант Respawn».</li>
        <li><strong>Фидбэк-анкета</strong>: обратная связь от стажёра о том, что понравилось, а что можно улучшить.</li>
      </ul>
      
      <h2>Преимущества для компании</h2>
      <ul>
        <li>🌱 <strong>Привлечение молодых талантов:</strong> вы растите будущих сотрудников.</li>
        <li>🚀 <strong>Новые идеи и нестандартные решения:</strong> подростки смотрят на задачи без рамок.</li>
        <li>💼 <strong>Улучшение HR-бренда:</strong> активное участие в образовательных проектах повышает лояльность аудитории.</li>
      </ul>
      
      <h2>Заключение</h2>
      <p>Стажёрская программа для школьников — это инвестиция в будущее вашей компании и в развитие сообщества. Чёткие цели, реальные кейсы, сильный менторинг и регулярная обратная связь позволят превратить подростков из наблюдателей в полноценную часть вашей команды.</p>
      
      <blockquote>
        <p><strong>Готовы запустить первый поток?</strong><br>
        Свяжитесь с нами через раздел «Контакты» или задайте вопрос в чат — и мы поможем адаптировать программу под ваши задачи!</p>
      </blockquote>
    `,
    excerpt: 'Полное руководство для работодателей по организации эффективной стажёрской программы для школьников.',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070',
    category: 'Советы работодателям',
    tags: [
      { id: 'tag8', name: 'стажировка' },
      { id: 'tag2', name: 'школьники' },
      { id: 'tag7', name: 'работодатели' },
      { id: 'tag9', name: 'программа' }
    ],
    author: {
      id: 'author2',
      name: 'Талгатов Даниял',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      role: 'Бизнес-тренер'
    },
    publishedAt: {
      toDate: () => new Date('2023-05-08')
    },
    views: 67,
    likes: 9,
    featured: false
  },
  'tech-interview-tips': {
    id: 'tech-interview-tips',
    title: 'Технические вопросы на собеседованиях в IT-компаниях: чего ожидать и как подготовиться',
    slug: 'tech-interview-tips',
    content: `<p>Технические собеседования в IT-компаниях могут быть пугающими, особенно если вы не знаете, чего ожидать. В этой статье мы расскажем о типичных технических вопросах и дадим советы по подготовке.</p>
              <h2>Общие технические вопросы</h2>
              <p>Независимо от конкретной позиции, на техническом собеседовании в IT-компании вам могут задать общие вопросы о вашем опыте работы с технологиями, вашем подходе к решению проблем и ваших технических знаниях.</p>
              <h2>Специфические вопросы для разработчиков</h2>
              <p>Если вы претендуете на позицию разработчика, то характер технических вопросов будет зависеть от конкретного языка программирования и технологического стека, с которым вы работаете.</p>`,
    excerpt: 'Подготовьтесь к техническому собеседованию в IT-компании, узнав о типичных вопросах и эффективных стратегиях подготовки.',
    coverImage: '/images/blog/tech-interview.jpg',
    category: 'Интервью',
    tags: [
      { id: '1', name: 'Техническое интервью' },
      { id: '2', name: 'Подготовка к интервью' },
      { id: '3', name: 'Карьера в IT' }
    ],
    author: {
      id: '1',
      name: 'Талгатов Даниял',
      avatar: '/images/avatars/1.jpg',
      role: 'HR специалист'
    },
    createdAt: { toDate: () => new Date(2023, 5, 15) },
    publishedAt: { toDate: () => new Date(2023, 5, 15) },
    views: 98,
    likes: 12,
    comments: [],
    featured: false
  },
  'cover-letter-mistakes': {
    id: 'cover-letter-mistakes',
    title: '5 ошибок в сопроводительных письмах, которые отпугивают работодателей',
    slug: 'cover-letter-mistakes',
    content: `<p>Сопроводительное письмо может существенно повысить ваши шансы на получение работы, но только если оно написано правильно. Вот 5 распространенных ошибок, которых следует избегать.</p>
              <h2>1. Использование шаблонного письма</h2>
              <p>Рекрутеры быстро замечают, когда кандидат отправляет одно и то же письмо всем работодателям. Персонализируйте каждое письмо под конкретную компанию и позицию.</p>
              <h2>2. Повторение резюме</h2>
              <p>Ваше сопроводительное письмо должно дополнять, а не дублировать информацию из резюме. Используйте его, чтобы рассказать историю или привести примеры своих достижений.</p>`,
    excerpt: 'Избегайте этих распространенных ошибок в сопроводительных письмах, чтобы повысить свои шансы на получение работы.',
    coverImage: '/images/blog/cover-letter.jpg',
    category: 'Резюме',
    tags: [
      { id: '1', name: 'Сопроводительное письмо' },
      { id: '2', name: 'Поиск работы' },
      { id: '3', name: 'Ошибки при трудоустройстве' }
    ],
    author: {
      id: '1',
      name: 'Талгатов Даниял',
      avatar: '/images/avatars/1.jpg',
      role: 'HR специалист'
    },
    createdAt: { toDate: () => new Date(2023, 6, 22) },
    publishedAt: { toDate: () => new Date(2023, 6, 22) },
    views: 87,
    likes: 10,
    comments: [],
    featured: false
  },
  'internship-platforms-kazakhstan': {
    id: 'internship-platforms-kazakhstan',
    title: 'Лучшие платформы для поиска стажировок в Казахстане',
    slug: 'internship-platforms-kazakhstan',
    content: `<p>Поиск стажировки может быть сложной задачей, особенно в Казахстане. В этой статье мы рассмотрим лучшие платформы и ресурсы для поиска стажировок в разных отраслях.</p>
              <h2>Специализированные платформы для поиска стажировок</h2>
              <p>В Казахстане существует несколько платформ, специализирующихся на стажировках и вакансиях для молодых специалистов:</p>
              <ul>
                <li>Respawn - наша платформа предлагает множество возможностей для начинающих специалистов</li>
                <li>HeadHunter Kazakhstan</li>
                <li>Программы стажировок крупных компаний</li>
              </ul>`,
    excerpt: 'Обзор лучших ресурсов и платформ для поиска стажировок в Казахстане в различных отраслях.',
    coverImage: '/images/blog/internship.jpg',
    category: 'Стажировки',
    tags: [
      { id: '1', name: 'Стажировки' },
      { id: '2', name: 'Казахстан' },
      { id: '3', name: 'Начало карьеры' }
    ],
    author: {
      id: '1',
      name: 'Талгатов Даниял',
      avatar: '/images/avatars/1.jpg',
      role: 'HR специалист'
    },
    createdAt: { toDate: () => new Date(2023, 7, 10) },
    publishedAt: { toDate: () => new Date(2023, 7, 10) },
    views: 110,
    likes: 15,
    comments: [],
    featured: false
  },
  'pomodoro-technique-for-students': {
    id: 'pomodoro-technique-for-students',
    title: 'Техника Помодоро для продуктивной подготовки к собеседованиям',
    slug: 'pomodoro-technique-for-students',
    content: `<p>Техника Помодоро – это метод управления временем, который может значительно повысить вашу продуктивность при подготовке к собеседованиям.</p>
              <h2>Что такое техника Помодоро?</h2>
              <p>Техника Помодоро была разработана Франческо Чирилло в конце 1980-х. Суть метода заключается в разделении работы на короткие интервалы (обычно 25 минут), называемые "помидорами", с короткими перерывами между ними.</p>
              <h2>Как применять технику Помодоро при подготовке к собеседованиям</h2>
              <p>Вот пошаговое руководство по использованию техники Помодоро для эффективной подготовки к собеседованиям:</p>
              <ol>
                <li>Составьте список задач, которые нужно выполнить (например, повторить вопросы по программированию, подготовить рассказ о себе).</li>
                <li>Установите таймер на 25 минут и полностью сосредоточьтесь на выполнении одной задачи.</li>
                <li>После завершения "помидора" сделайте короткий перерыв (5 минут).</li>
                <li>После четырех "помидоров" сделайте длинный перерыв (15-30 минут).</li>
              </ol>`,
    excerpt: 'Использование техники Помодоро для повышения эффективности при подготовке к собеседованиям и интервью.',
    coverImage: '/images/blog/pomodoro.jpg',
    category: 'Продуктивность',
    tags: [
      { id: '1', name: 'Техника Помодоро' },
      { id: '2', name: 'Продуктивность' },
      { id: '3', name: 'Подготовка к собеседованиям' }
    ],
    author: {
      id: '1',
      name: 'Талгатов Даниял',
      avatar: '/images/avatars/1.jpg',
      role: 'HR специалист'
    },
    createdAt: { toDate: () => new Date(2023, 8, 5) },
    publishedAt: { toDate: () => new Date(2023, 8, 5) },
    views: 75,
    likes: 9,
    comments: [],
    featured: false
  }
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchPostAndRelated = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Проверяем, есть ли демо-пост с таким slug
        if (slug in DEMO_POSTS && DEMO_POSTS[slug as DemoPostSlug]) {
          console.log('Using demo post data for slug:', slug);
          setPost(DEMO_POSTS[slug as DemoPostSlug]);
          
          // Увеличиваем счетчик просмотров только на 1 для текущего пользователя
          const updatedPost = {
            ...DEMO_POSTS[slug as DemoPostSlug],
            views: DEMO_POSTS[slug as DemoPostSlug].views + 1
          };
          
          // Обновляем только локальное состояние, а не глобальную переменную DEMO_POSTS
          setPost(updatedPost);
          
          // Устанавливаем демо-комментарии
          if (slug in DEMO_COMMENTS) {
            setComments(DEMO_COMMENTS[slug as DemoPostSlug]);
          } else {
            setComments([]);
          }
          
          // Получаем связанные посты
          const related = Object.values(DEMO_POSTS)
            .filter(p => p.slug !== slug && p.category === DEMO_POSTS[slug as DemoPostSlug].category)
            .slice(0, 3);
          setRelatedPosts(related);
          
          setLoading(false);
          return;
        }
        
        // Если нет демо-поста, пробуем получить из Firestore
        try {
          const postsQuery = query(collection(db, 'blog_posts'));
          const postDocs = await getDocs(postsQuery);
          
          // Ищем пост по slug
          const postDoc = postDocs.docs.find(doc => {
            const data = doc.data();
            return data.slug === slug;
          });
          
          if (!postDoc) {
            setError('Статья не найдена');
            setLoading(false);
            return;
          }
          
          const postData = {
            id: postDoc.id,
            ...postDoc.data(),
            publishedAt: postDoc.data().publishedAt || postDoc.data().createdAt || { 
              toDate: () => new Date() 
            },
          } as BlogPost;
          
          setPost(postData);
          
          // Увеличиваем счетчик просмотров на 1
          try {
            await updateDoc(doc(db, 'blog_posts', postData.id), {
              views: increment(1)
            });
          } catch (error) {
            console.error('Error incrementing view count:', error);
          }
          
          // Получаем связанные статьи по категории
          try {
            const relatedQuery = query(
              collection(db, 'blog_posts'),
              where('category', '==', postData.category),
              where('id', '!=', postData.id),
              limit(3)
            );
            
            const relatedDocs = await getDocs(relatedQuery);
            const relatedData = relatedDocs.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              publishedAt: doc.data().publishedAt || doc.data().createdAt || { 
                toDate: () => new Date() 
              },
            })) as BlogPost[];
            
            setRelatedPosts(relatedData);
          } catch (error) {
            console.error('Error fetching related posts:', error);
            setRelatedPosts([]);
          }
          
          // Получаем комментарии
          try {
            const commentsQuery = query(
              collection(db, 'blog_comments'),
              where('postId', '==', postData.id),
              orderBy('createdAt', 'desc'),
              limit(20)
            );
            
            const commentDocs = await getDocs(commentsQuery);
            const commentsData = commentDocs.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt || { 
                toDate: () => new Date() 
              },
            })) as Comment[];
            
            setComments(commentsData);
          } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
          }
        } catch (error) {
          console.error('Error fetching blog post from Firestore:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Не удалось загрузить статью. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndRelated();
  }, [slug]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleLike = async () => {
    if (!post || !user) return;
    
    // Оптимистичное обновление UI
    setLiked(!liked);
    
    try {
      if (post.id in DEMO_POSTS) {
        // Для демо-постов просто обновляем локальное состояние
        setPost({
          ...post,
          likes: liked ? post.likes - 1 : post.likes + 1
        });
      } else {
        // Для реальных постов обновляем в Firestore
        await updateDoc(doc(db, 'blog_posts', post.id), {
          likes: increment(liked ? -1 : 1)
        });
        
        // Обновляем состояние поста
        setPost({
          ...post,
          likes: liked ? post.likes - 1 : post.likes + 1
        });
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      // Откатываем состояние в случае ошибки
      setLiked(!liked);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !post || !user) {
      if (!user) {
        alert('Пожалуйста, войдите в систему, чтобы оставить комментарий');
      }
      return;
    }
    
    try {
      if (post.slug in DEMO_POSTS) {
        // Для демо-постов просто показываем сообщение
        alert(`Комментарий отправлен: ${newComment}`);
        
        // Добавляем комментарий локально для демонстрации
        const newCommentObj: Comment = {
          id: `comment-${Date.now()}`,
          userId: user.uid || 'demo-user',
          userName: user.displayName || 'Пользователь',
          userAvatar: user.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
          content: newComment,
          createdAt: {
            toDate: () => new Date()
          }
        };
        
        setComments([newCommentObj, ...comments]);
      } else {
        
        alert('Комментарий будет добавлен в базу данных');
      }
      
      // Очищаем поле ввода
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Не удалось отправить комментарий. Пожалуйста, попробуйте позже.');
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || 'Интересная статья на Respawn';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Ссылка скопирована в буфер обмена!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Загрузка статьи...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-300">{error || 'Статья не найдена'}</p>
          <Link 
            to="/blog" 
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Вернуться к блогу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-16">
      
      <div className="relative h-96 bg-gray-800 mb-8">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover opacity-70" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="inline-block bg-primary text-white px-3 py-1 rounded-md text-sm font-medium mb-4">
              {post.category}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-200">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-sm">
                  {formatDate(post.publishedAt.toDate())} &middot; {post.views} просмотров
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <main>
          
          <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-md p-6 sm:p-8 mb-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-6">
                {post.excerpt}
              </p>
              
              
              <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map(tag => (
                  <span 
                    key={tag.id} 
                    className="px-3 py-1 bg-gray-100 dark:bg-dark text-gray-800 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-4 my-8">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500'
                    }`}
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill={liked ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes}</span>
                  </button>
                  
                  <a 
                    href="#comments" 
                    className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent px-3 py-2 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{comments.length}</span>
                  </a>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Поделиться:</span>
                  
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="text-blue-400 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200 p-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleShare('telegram')}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.04.01-.19-.08-.27-.09-.08-.21-.05-.3-.03-.13.03-2.2 1.4-6.22 4.12-.59.4-1.12.6-1.6.58-.53-.01-1.54-.3-2.29-.55-.92-.31-1.66-.47-1.6-1 .03-.27.38-.54 1.05-.83 4.15-1.83 6.92-3.03 8.32-3.61 3.97-1.64 4.8-1.92 5.33-1.93.12 0 .37.03.54.17.14.12.18.29.2.47.02.16 0 .33 0 .33z" />
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleShare('copy')}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Похожие статьи
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    to={`/blog/${relatedPost.slug}`} 
                    key={relatedPost.id}
                    className="block group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={relatedPost.coverImage} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(relatedPost.publishedAt.toDate())}</span>
                          <span>{relatedPost.views} просмотров</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Comments section */}
          <div id="comments" className="bg-white dark:bg-dark-lighter rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Комментарии ({comments.length})
            </h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Оставьте свой комментарий..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent dark:bg-dark-lighter dark:text-white"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark dark:bg-accent dark:hover:bg-accent-dark text-white font-medium py-2 px-6 rounded-lg"
                >
                  Отправить
                </button>
              </form>
            ) : (
              <div className="bg-gray-100 dark:bg-dark rounded-lg p-4 mb-8 text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  Чтобы оставить комментарий, пожалуйста,{' '}
                  <Link to="/login" className="text-primary dark:text-accent hover:underline">
                    войдите в аккаунт
                  </Link>
                </p>
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 my-8">
                Будьте первым, кто оставит комментарий!
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                    <div className="flex items-start">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full mr-4" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {comment.userName}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {formatDistanceToNow(comment.createdAt.toDate(), { 
                              addSuffix: true,
                              locale: ru
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                        <div className="mt-2">
                          <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent text-sm">
                            Ответить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BlogPost; 