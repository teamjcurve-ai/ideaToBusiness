'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface StepLayoutProps {
  children: React.ReactNode;
  projectId: string;
  projectTitle: string;
  projectDate: string;
  currentStep: number;
  steps: any[];
  breadcrumb: string;
  onDeleteProject: () => void;
}

export default function StepLayout({
  children,
  projectId,
  projectTitle,
  projectDate,
  currentStep,
  steps,
  breadcrumb,
  onDeleteProject,
}: StepLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col">
        <Header
          title={projectTitle}
          breadcrumb={breadcrumb}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <Sidebar
            projectId={projectId}
            projectTitle={projectTitle}
            projectDate={projectDate}
            currentStep={currentStep}
            steps={steps}
            onDeleteProject={onDeleteProject}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
