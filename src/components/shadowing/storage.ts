import { ShadowOnboardingData, ShadowResult } from './types';

export const SHADOW_ONBOARDING_KEY = 'shadowOnboarding';
export const SHADOW_RESULT_KEY = 'shadowResult';
export const SHADOW_FIRST_LOGIN_KEY = 'shadowFirstLoginProfession';

export const readShadowOnboarding = (): ShadowOnboardingData | null => {
  try {
    const raw = localStorage.getItem(SHADOW_ONBOARDING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShadowOnboardingData;
  } catch {
    return null;
  }
};

export const saveShadowOnboarding = (data: ShadowOnboardingData): void => {
  localStorage.setItem(SHADOW_ONBOARDING_KEY, JSON.stringify(data));
};

export const readShadowResult = (): ShadowResult | null => {
  try {
    const raw = localStorage.getItem(SHADOW_RESULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShadowResult;
  } catch {
    return null;
  }
};

export const saveShadowResult = (data: ShadowResult): void => {
  localStorage.setItem(SHADOW_RESULT_KEY, JSON.stringify(data));
};

