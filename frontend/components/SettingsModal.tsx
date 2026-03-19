'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, Info } from 'lucide-react';
import {
  useAiSettingsStore,
  PROVIDER_MODELS,
  PROVIDER_LABELS,
  type AiProvider,
} from '@/store/aiSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    provider,
    model,
    openaiApiKey,
    anthropicApiKey,
    googleApiKey,
    setProvider,
    setModel,
    setApiKey,
  } = useAiSettingsStore();

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
  });

  if (!isOpen) return null;

  const providers: AiProvider[] = ['openai', 'anthropic', 'google'];
  const apiKeys: Record<AiProvider, string> = {
    openai: openaiApiKey,
    anthropic: anthropicApiKey,
    google: googleApiKey,
  };
  const placeholders: Record<AiProvider, string> = {
    openai: 'sk-...',
    anthropic: 'sk-ant-...',
    google: 'AIza...',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="glass-heavy rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-heavy border-b border-white/20 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-xl font-semibold text-gray-900">설정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Security Notice */}
          <div className="flex items-start gap-3 rounded-2xl bg-blue-50/80 backdrop-blur-sm p-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              API Key는 브라우저 로컬 스토리지에만 저장되며, 서버나 DB에 전송/저장되지 않습니다.
              AI 호출 시에만 암호화된 연결을 통해 해당 AI 서비스로 전달됩니다.
            </p>
          </div>

          {/* AI Provider Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">AI 에이전트 선택</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 프로바이더
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      provider === p
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'glass-input text-gray-700 hover:bg-white/80'
                    }`}
                  >
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모델
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-2xl glass-input px-4 py-2.5"
              >
                {PROVIDER_MODELS[provider].map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>

            {providers.map((p) => (
              <div key={p}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {PROVIDER_LABELS[p]}
                  {provider === p && (
                    <span className="ml-2 text-xs text-primary font-normal">(현재 선택됨)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showKeys[p] ? 'text' : 'password'}
                    value={apiKeys[p]}
                    onChange={(e) => setApiKey(p, e.target.value)}
                    placeholder={placeholders[p]}
                    className="w-full rounded-2xl glass-input px-4 py-2.5 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys({ ...showKeys, [p]: !showKeys[p] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/60 rounded-lg"
                  >
                    {showKeys[p] ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 glass-heavy border-t border-white/20 px-6 py-4 flex items-center justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
