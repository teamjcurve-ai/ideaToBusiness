'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import StepLayout from '@/components/StepLayout';
import { StepSkeleton } from '@/components/SkeletonLoader';
import { api } from '@/lib/api';
import { useProjectStore } from '@/store/projectStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

const KPI_OPTIONS = [
  { value: '매출 증대', label: '매출 증대' },
  { value: '유저 확보', label: '유저 확보' },
  { value: '리텐션 향상', label: '리텐션 향상' },
  { value: '비용 절감', label: '비용 절감' },
  { value: '시장 검증', label: '시장 검증' },
];

export default function Step1Page({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentProject, setCurrentProject, updateStep } = useProjectStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    idea: '',
    problem: '',
    targetUser: '',
    developmentPeriod: '',
    teamSize: '',
    kpis: [] as string[],
    otherConstraints: '',
  });

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setCurrentProject(response.data);

      const step = response.data.steps.find((s: any) => s.stepNumber === 1);
      if (step?.data) {
        setFormData(step.data);
      }
    } catch (error) {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/projects/${id}/steps/1`, {
        data: formData,
        status: 'COMPLETED',
      });

      updateStep(id, 1, { data: formData, status: 'COMPLETED' });

      await api.put(`/projects/${id}`, { currentStep: 2 });
      router.push(`/projects/${id}/step/2`);
    } catch (error) {
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleKPI = (kpi: string) => {
    setFormData((prev) => ({
      ...prev,
      kpis: prev.kpis.includes(kpi)
        ? prev.kpis.filter((k) => k !== kpi)
        : [...prev.kpis, kpi],
    }));
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

  if (loading || !currentProject) {
    return <StepSkeleton />;
  }

  return (
    <StepLayout
      projectId={currentProject.id}
      projectTitle={currentProject.title}
      projectDate={new Date(currentProject.createdAt).toLocaleDateString('ko-KR')}
      currentStep={1}
      steps={currentProject.steps}
      breadcrumb="1단계: 아이디어 입력"
      onDeleteProject={handleDeleteProject}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">아이디어 입력</h1>
          <p className="text-gray-600">
            아이디어와 제약 조건을 입력하세요. AI가 이를 바탕으로 분석합니다.
          </p>
        </div>

        <div className="glass-heavy rounded-3xl p-6 sm:p-8 space-y-6">
          {/* 아이디어 */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              아이디어 <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              value={formData.idea}
              onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
              placeholder="만들고 싶은 서비스나 제품을 설명해주세요"
              rows={4}
              className="w-full rounded-2xl glass-input px-4 py-3 resize-none"
            />
          </div>

          {/* 해결하려는 문제 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              해결하려는 문제 또는 원하는 목표
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              placeholder="예: 사람들이 식습관을 기록하고 개선하는데 어려움을 겪고 있습니다"
              rows={3}
              className="w-full rounded-2xl glass-input px-4 py-3 resize-none"
            />
          </div>

          {/* 타겟 사용자 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              타겟 사용자
            </label>
            <input
              type="text"
              value={formData.targetUser}
              onChange={(e) => setFormData({ ...formData, targetUser: e.target.value })}
              placeholder="예: 20-30대 직장인"
              className="w-full rounded-2xl glass-input px-4 py-2.5"
            />
          </div>

          {/* 제약 조건 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">제약 조건</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개발 기간
                </label>
                <select
                  value={formData.developmentPeriod}
                  onChange={(e) => setFormData({ ...formData, developmentPeriod: e.target.value })}
                  className="w-full rounded-2xl glass-input px-4 py-2.5"
                >
                  <option value="">선택 안 함</option>
                  <option value="1개월 이내">1개월 이내</option>
                  <option value="2-3개월">2-3개월</option>
                  <option value="3-6개월">3-6개월</option>
                  <option value="6개월 이상">6개월 이상</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 규모
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  className="w-full rounded-2xl glass-input px-4 py-2.5"
                >
                  <option value="">선택 안 함</option>
                  <option value="1명 (솔로)">1명 (솔로)</option>
                  <option value="2-3명">2-3명</option>
                  <option value="4-5명">4-5명</option>
                  <option value="6명 이상">6명 이상</option>
                </select>
              </div>
            </div>
          </div>

          {/* 프로젝트 목표 (KPI) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              프로젝트 목표 (KPI)
            </label>
            <div className="flex flex-wrap gap-2">
              {KPI_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleKPI(option.value)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    formData.kpis.includes(option.value)
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'glass-input text-gray-700 hover:bg-white/80'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 기타 제약 사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기타 제약 사항
            </label>
            <textarea
              value={formData.otherConstraints}
              onChange={(e) => setFormData({ ...formData, otherConstraints: e.target.value })}
              placeholder="기술 스택, 예산, 기타 제약 사항 등"
              rows={3}
              className="w-full rounded-2xl glass-input px-4 py-3 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.idea}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
