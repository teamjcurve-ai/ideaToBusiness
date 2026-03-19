'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Play, Download, RotateCw, Loader2, Layers, Lock } from 'lucide-react';
import StepLayout from '@/components/StepLayout';
import { StepSkeleton } from '@/components/SkeletonLoader';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { api } from '@/lib/api';
import { aiRequest } from '@/lib/aiRequest';
import { useProjectStore } from '@/store/projectStore';
import { usePdfExport } from '@/hooks/usePdfExport';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Step4Page({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentProject, setCurrentProject, updateStep } = useProjectStore();
  const { exporting, exportStep } = usePdfExport();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setCurrentProject(response.data);

      const step = response.data.steps.find((s: any) => s.stepNumber === 4);
      if (step?.content) {
        setContent(step.content);
      }
    } catch (error) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const step3 = currentProject?.steps.find((s) => s.stepNumber === 3);
      const icpData = step3?.content || '';

      if (!icpData) {
        toast.error('먼저 3단계에서 고객 발견을 완료해주세요.');
        return;
      }

      await api.put(`/projects/${id}/steps/4`, { status: 'IN_PROGRESS' });

      const response = await aiRequest('/ai/features', { icpData });
      const generatedContent = response.content;

      await api.put(`/projects/${id}/steps/4`, {
        content: generatedContent,
        status: 'COMPLETED',
      });

      setContent(generatedContent);
      updateStep(id, 4, { content: generatedContent, status: 'COMPLETED' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || '생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/projects/${id}`);
        router.push('/projects');
      } catch (error) {
        toast.error('삭제에 실패했습니다.');
      }
    }
  };

  const firstIncompleteStep = currentProject?.steps
    ?.filter((s: any) => s.stepNumber < 4)
    .find((s: any) => s.status !== 'COMPLETED');
  const prevStepsCompleted = !firstIncompleteStep;

  if (loading || !currentProject) {
    return <StepSkeleton />;
  }

  if (!prevStepsCompleted) {
    return (
      <StepLayout
        projectId={currentProject.id}
        projectTitle={currentProject.title}
        projectDate={new Date(currentProject.createdAt).toLocaleDateString('ko-KR')}
        currentStep={4}
        steps={currentProject.steps}
        breadcrumb="4단계: 핵심 기능 선정"
        onDeleteProject={handleDeleteProject}
      >
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <div className="glass-heavy rounded-3xl p-12 text-center">
            <div className="p-3 bg-gray-100 rounded-2xl inline-block mb-6">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">이전 단계를 먼저 완료해주세요</h3>
            <p className="text-gray-600 mb-6">
              {firstIncompleteStep?.stepNumber}단계를 완료해야 이 단계를 시작할 수 있습니다.
            </p>
            <button
              onClick={() => router.push(`/projects/${id}/step/${firstIncompleteStep?.stepNumber}`)}
              className="px-6 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25"
            >
              {firstIncompleteStep?.stepNumber}단계로 이동
            </button>
          </div>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout
      projectId={currentProject.id}
      projectTitle={currentProject.title}
      projectDate={new Date(currentProject.createdAt).toLocaleDateString('ko-KR')}
      currentStep={4}
      steps={currentProject.steps}
      breadcrumb="4단계: 핵심 기능 선정"
      onDeleteProject={handleDeleteProject}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">핵심 기능 선정</h1>
          <p className="text-gray-600">
            ICP를 기반으로 MVP에 포함할 핵심 기능을 AI가 추천합니다.
          </p>
        </div>

        {!content ? (
          <div className="glass-heavy rounded-3xl p-12 text-center">
            <div className="p-3 bg-primary/10 rounded-2xl inline-block mb-6">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">기능 추천 시작하기</h3>
            <p className="text-gray-600 mb-6">
              ICP 분석 결과를 바탕으로 MVP 핵심 기능 5-7개를 추천합니다.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> 생성 중...</>
              ) : (
                <><Play className="w-5 h-5" /> 기능 추천 받기</>
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
                  onClick={() => { setContent(''); handleGenerate(); }}
                  disabled={generating}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl text-gray-700 hover:bg-white/90 transition-all font-medium disabled:opacity-50"
                >
                  <RotateCw className="w-4 h-4" /> 재생성
                </button>
                <button
                  onClick={() => exportStep(
                    currentProject.title,
                    new Date(currentProject.createdAt).toLocaleDateString('ko-KR'),
                    4, '핵심 기능 선정', content
                  )}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl text-gray-700 hover:bg-white/90 transition-all font-medium disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  다운로드
                </button>
              </div>
              <button
                onClick={() => router.push(`/projects/${id}/step/5`)}
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
