export interface ShadowCategory {
  id: string;
  title: string;
  subtitle: string;
  professions: string[];
}

export const SHADOW_CATEGORIES: ShadowCategory[] = [
  {
    id: 'help',
    title: 'Спасаю людей',
    subtitle: 'Врач, психолог, пожарный',
    professions: ['Врач', 'Психолог', 'Пожарный'],
  },
  {
    id: 'build',
    title: 'Строю системы',
    subtitle: 'Программист, инженер, архитектор',
    professions: ['Программист', 'Инженер', 'Архитектор'],
  },
  {
    id: 'influence',
    title: 'Убеждаю людей',
    subtitle: 'Юрист, маркетолог, предприниматель',
    professions: ['Юрист', 'Маркетолог', 'Предприниматель'],
  },
];

export const professionKeywords = (profession: string): string[] => {
  const normalized = profession.toLowerCase();

  if (normalized.includes('програм')) return ['react', 'frontend', 'backend', 'web', 'разработка', 'it'];
  if (normalized.includes('инжен')) return ['инженер', 'automation', 'devops', 'infrastructure', 'hardware'];
  if (normalized.includes('архитектор')) return ['архитектура', 'design', 'ui', 'ux', 'system'];
  if (normalized.includes('маркет')) return ['маркетинг', 'smm', 'контент', 'бренд', 'analytics'];
  if (normalized.includes('юрист')) return ['legal', 'law', 'compliance', 'договор'];
  if (normalized.includes('предприним')) return ['startup', 'business', 'продукт', 'product', 'growth'];
  if (normalized.includes('врач')) return ['health', 'medical', 'med', 'clinic'];
  if (normalized.includes('психолог')) return ['mental', 'support', 'community', 'coaching'];
  if (normalized.includes('пожар')) return ['security', 'safety', 'risk', 'incident'];

  return [normalized];
};

