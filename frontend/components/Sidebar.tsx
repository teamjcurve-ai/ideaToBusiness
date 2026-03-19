'use client';

import { ChevronLeft, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Step {
  stepNumber: number;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  description?: string;
}

const STEPS: Array<{ number: number; name: string; description: string }> = [
  { number: 1, name: '입력', description: '아이디어 & 제약조건' },
  { number: 2, name: '시장 리서치', description: '경쟁사 & 시장 분석' },
  { number: 3, name: '고객 발견', description: '페르소나 서베이 ICP' },
  { number: 4, name: '핵심 기능 선정', description: '기능 후보 선택' },
  { number: 5, name: 'PRD 작성', description: '요구사항 문서' },
  { number: 6, name: '마케팅 전략', description: 'GTM & 메시지' },
  { number: 7, name: '사전 부검', description: '리스크 분석' },
  { number: 8, name: '킥오프 준비', description: '결정할 사항 정리' },
];

interface SidebarProps {
  projectId: string;
  projectTitle: string;
  projectDate: string;
  currentStep: number;
  steps: Step[];
  onDeleteProject: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  projectId,
  projectTitle,
  projectDate,
  currentStep,
  steps,
  onDeleteProject,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const getStepStatus = (stepNumber: number) => {
    const step = steps.find((s) => s.stepNumber === stepNumber);
    return step?.status || 'PENDING';
  };

  const getStepIcon = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);

    if (status === 'COMPLETED') {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }

    if (status === 'IN_PROGRESS') {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    }

    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <aside
      className={`
        w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0
        fixed md:static inset-y-0 top-16 left-0 z-40 md:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Back to List */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/projects"
          onClick={handleLinkClick}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          목록으로
        </Link>
      </div>

      {/* Project Info */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{projectTitle}</h3>
        <p className="text-xs text-gray-500">{projectDate}</p>
      </div>

      {/* Steps */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {STEPS.map((step) => {
          const isActive = step.number === currentStep;

          return (
            <Link
              key={step.number}
              href={`/projects/${projectId}/step/${step.number}`}
              onClick={handleLinkClick}
              className={`
                flex items-start gap-3 px-3 py-2.5 rounded-2xl transition-all
                ${isActive
                  ? 'bg-blue-50 border border-blue-100'
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.number)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-gray-500'}`}>
                    {step.number}
                  </span>
                  <h4 className={`text-sm font-medium truncate ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {step.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 truncate">{step.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Delete Project */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onDeleteProject}
          className="flex items-center gap-2 text-sm text-destructive hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          프로젝트 삭제
        </button>
      </div>
    </aside>
  );
}
