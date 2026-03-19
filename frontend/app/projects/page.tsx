'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, setProjects } = useProjectStore();
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (session) {
      loadProjects();
    }
  }, [session]);

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await api.post('/projects', newProject);
      router.push(`/projects/${response.data.id}/step/1`);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setCreating(false);
    }
  };

  const getCompletedSteps = (project: any) => {
    return project.steps.filter((s: any) => s.status === 'COMPLETED').length;
  };

  const getProgressText = (project: any) => {
    const completed = getCompletedSteps(project);
    if (completed === 0) return '시작 전';
    if (completed === 8) return '완료';
    return `${completed}/8 진행 중`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header title="프로젝트 목록" />

        <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">프로젝트 목록</h1>
              <p className="mt-1 text-sm text-gray-600">
                새로운 아이디어를 검증하고 제품으로 만들어보세요
              </p>
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">새 프로젝트</span>
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">프로젝트를 불러오는 중...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-heavy rounded-3xl text-center py-16 px-6">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">프로젝트가 없습니다</h3>
              <p className="text-gray-600 mb-6">첫 번째 프로젝트를 만들어보세요</p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/25"
              >
                <Plus className="w-5 h-5" />
                새 프로젝트 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}/step/${project.currentStep}`)}
                  className="glass-card rounded-2xl p-6 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {getProgressText(project)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200/60 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(getCompletedSteps(project) / 8) * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="glass-heavy rounded-3xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-white/20 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">새 프로젝트 만들기</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-2 hover:bg-white/40 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 이름 *
                </label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="예: 습관 추적 앱"
                  className="w-full rounded-2xl glass-input px-4 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="프로젝트에 대한 간단한 설명"
                  rows={3}
                  className="w-full rounded-2xl glass-input px-4 py-3 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-white/40 rounded-2xl transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
                >
                  {creating ? '생성 중...' : '만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
