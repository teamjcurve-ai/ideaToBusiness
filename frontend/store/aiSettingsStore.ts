import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiProvider = 'openai' | 'anthropic' | 'google';

export interface AiModel {
  id: string;
  name: string;
}

export const PROVIDER_MODELS: Record<AiProvider, AiModel[]> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  ],
};

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: 'GPT (OpenAI)',
  anthropic: 'Claude (Anthropic)',
  google: 'Gemini (Google)',
};

interface AiSettingsStore {
  provider: AiProvider;
  model: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  setProvider: (provider: AiProvider) => void;
  setModel: (model: string) => void;
  setApiKey: (provider: AiProvider, key: string) => void;
  getActiveApiKey: () => string;
  getAiConfig: () => { provider: AiProvider; model: string; apiKey: string };
}

export const useAiSettingsStore = create<AiSettingsStore>()(
  persist(
    (set, get) => ({
      provider: 'openai',
      model: 'gpt-4o',
      openaiApiKey: '',
      anthropicApiKey: '',
      googleApiKey: '',

      setProvider: (provider) => {
        const defaultModel = PROVIDER_MODELS[provider][0].id;
        set({ provider, model: defaultModel });
      },

      setModel: (model) => set({ model }),

      setApiKey: (provider, key) => {
        switch (provider) {
          case 'openai':
            set({ openaiApiKey: key });
            break;
          case 'anthropic':
            set({ anthropicApiKey: key });
            break;
          case 'google':
            set({ googleApiKey: key });
            break;
        }
      },

      getActiveApiKey: () => {
        const state = get();
        switch (state.provider) {
          case 'openai':
            return state.openaiApiKey;
          case 'anthropic':
            return state.anthropicApiKey;
          case 'google':
            return state.googleApiKey;
        }
      },

      getAiConfig: () => {
        const state = get();
        return {
          provider: state.provider,
          model: state.model,
          apiKey: state.getActiveApiKey(),
        };
      },
    }),
    {
      name: 'ai-settings',
    }
  )
);
