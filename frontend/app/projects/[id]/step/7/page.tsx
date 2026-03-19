'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCw, Loader2, AlertTriangle, Lock } from 'lucide-react';
import StepLayout from '@/components/StepLayout';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { api } from '@/lib/api';
import { aiRequest } from '@/lib/aiRequest';
import { useProjectStore } from '@/store/projectStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Step7Page({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentProject, setCurrentProject, updateStep } = useProjectStore();
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

      const step = response.data.steps.find((s: any) => s.stepNumber === 7);
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
      const allStepsData = currentProject?.steps.reduce((acc: any, s: any) => {
        acc[`step${s.stepNumber}`] = { data: s.data, content: s.content?.substring(0, 500) };
        return acc;
      }, {});

      await api.put(`/projects/${id}/steps/7`, { status: 'IN_PROGRESS' });

      const response = await aiRequest('/ai/premortem', {
        idea: step1?.data?.idea,
        ...allStepsData,
      });
      const generatedContent = response.content;

      await api.put(`/projects/${id}/steps/7`, {
        content: generatedContent,
        status: 'COMPLETED',
      });

      setContent(generatedContent);
      updateStep(id, 7, { content: generatedContent, status: 'COMPLETED' });
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || '생성에 실패했습니다.');
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
        console.error('삭제 실패:', error);
      }
    }
  };

  const firstIncompleteStep = currentProject?.steps
    ?.filter((s: any) => s.stepNumber < 7)
    .find((s: any) => s.status !== 'COMPLETED');
  const prevStepsCompleted = !firstIncompleteStep;

  if (loading || !currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!prevStepsCompleted) {
    return (
      <StepLayout
        projectId={currentProject.id}
        projectTitle={currentProject.title}
        projectDate={new Date(currentProject.createdAt).toLocaleDateString('ko-KR')}
        currentStep={7}
        steps={currentProject.steps}
        breadcrumb="7단계: 사전 부검"
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
      currentStep={7}
      steps={currentProject.steps}
      breadcrumb="7단계: 사전 부검"
      onDeleteProject={handleDeleteProject}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">사전 부검 (Pre-mortem)</h1>
          <p className="text-gray-600">
            프로젝트의 잠재적 실패 요인을 사전에 분석하고 대비합니다.
          </p>
        </div>

        {!content ? (
          <div className="glass-heavy rounded-3xl p-12 text-center">
            <div className="p-3 bg-warning/10 rounded-2xl inline-block mb-6">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">리스크 분석 시작하기</h3>
            <p className="text-gray-600 mb-6">
              핵심 가정, 잠재적 실패 요인, 검증 방법을 도출합니다.
            </p>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> 분석 중...</>
              ) : (
                <><Play className="w-5 h-5" /> 분석 시작하기</>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="glass-heavy rounded-3xl p-6 sm:p-8 mb-6">
              <MarkdownRenderer content={content} />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={() => { setContent(''); handleGenerate(); }}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 glass-card rounded-2xl text-gray-700 hover:bg-white/90 transition-all font-medium disabled:opacity-50"
              >
                <RotateCw className="w-4 h-4" /> 재생성
              </button>
              <button
                onClick={() => router.push(`/projects/${id}/step/8`)}
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
