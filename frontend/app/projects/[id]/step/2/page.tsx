'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Download, RotateCw, Loader2 } from 'lucide-react';
import StepLayout from '@/components/StepLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { api } from '@/lib/api';
import { aiRequest } from '@/lib/aiRequest';
import { useProjectStore } from '@/store/projectStore';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Step2Page({ params }: PageProps) {
  const router = useRouter();
  const { currentProject, setCurrentProject, updateStep } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${params.id}`);
      setCurrentProject(response.data);

      const step = response.data.steps.find((s: any) => s.stepNumber === 2);
      if (step?.content) {
        setContent(step.content);
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const step1 = currentProject?.steps.find((s) => s.stepNumber === 1);
      if (!step1?.data) {
        alert('먼저 1단계에서 아이디어를 입력해주세요.');
        return;
      }

      await api.put(`/projects/${params.id}/steps/2`, { status: 'IN_PROGRESS' });

      const response = await aiRequest('/ai/market-research', step1.data);
      const generatedContent = response.content;

      await api.put(`/projects/${params.id}/steps/2`, {
        content: generatedContent,
        status: 'COMPLETED',
      });

      setContent(generatedContent);
      updateStep(params.id, 2, { content: generatedContent, status: 'COMPLETED' });
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || '생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('기존 내용을 삭제하고 다시 생성하시겠습니까?')) return;
    await handleGenerate();
  };

  const handleNextStep = () => {
    router.push(`/projects/${params.id}/step/3`);
  };

  const handleDeleteProject = async () => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/projects/${params.id}`);
        router.push('/projects');
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <StepLayout
      projectId={currentProject.id}
      projectTitle={currentProject.title}
      projectDate={new Date(currentProject.createdAt).toLocaleDateString('ko-KR')}
      currentStep={2}
      steps={currentProject.steps}
      breadcrumb="2단계: 시장 리서치"
      onDeleteProject={handleDeleteProject}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">시장 리서치</h1>
          <p className="text-gray-600">
            경쟁사 분석, 시장 트렌드, 차별화 포인트를 AI가 분석합니다.
          </p>
        </div>

        {!content ? (
          <div className="glass-heavy rounded-3xl p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">시장 조사 시작하기</h3>
            <p className="text-gray-600 mb-6">
              입력하신 아이디어를 바탕으로 시장 조사를 시작합니다.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  조사 시작하기
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="glass-heavy rounded-3xl p-6 sm:p-8 mb-6">
              <MarkdownRenderer content={content} />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl text-gray-700 hover:bg-white/90 transition-all font-medium disabled:opacity-50"
                >
                  <RotateCw className="w-4 h-4" />
                  재생성
                </button>

                <button className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl text-gray-700 hover:bg-white/90 transition-all font-medium">
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
              </div>

              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25"
              >
                다음 단계 →
              </button>
            </div>
          </>
        )}
      </div>
    </StepLayout>
  );
}
