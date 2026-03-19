'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, session, loading, initialize } = useAuthStore();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && session) {
      router.push('/projects');
    }
  }, [loading, session, router]);

  const handleGoogleLogin = async () => {
    setError('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google 로그인에 실패했습니다.');
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-3xl p-8 space-y-8 shadow-sm border border-gray-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              ideaToBusiness
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              AI 기반 아이디어를 비즈니스로
            </p>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50/80 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {signingIn ? '로그인 중...' : 'Google로 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
