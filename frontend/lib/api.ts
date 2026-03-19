import axios from 'axios';
import { supabase } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Supabase 세션 토큰 자동 추가
api.interceptors.request.use(async (config) => {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // Supabase not available
    }
  }
  return config;
});

// 응답 인터셉터: 에러 처리 (401 시 로그인으로 리다이렉트하지 않음 — ProtectedRoute가 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);
