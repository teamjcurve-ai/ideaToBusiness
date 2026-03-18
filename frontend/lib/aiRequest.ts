import { api } from '@/lib/api';
import { useAiSettingsStore } from '@/store/aiSettingsStore';

export async function aiRequest(endpoint: string, data: any) {
  const { provider, model, apiKey } = useAiSettingsStore.getState().getAiConfig();

  if (!apiKey) {
    throw new Error('API Key가 설정되지 않았습니다. 설정에서 API Key를 입력해주세요.');
  }

  const response = await api.post(endpoint, {
    ...data,
    provider,
    model,
    apiKey,
  });

  return response.data;
}
