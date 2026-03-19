'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface StepData {
  stepNumber: number;
  name: string;
  content?: string;
  data?: any;
}

interface ExportAllOptions {
  projectTitle: string;
  projectDate: string;
  steps: StepData[];
}

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);

  const exportStep = async (
    projectTitle: string,
    projectDate: string,
    stepNumber: number,
    stepName: string,
    content: string | null,
    data?: any,
  ) => {
    setExporting(true);
    try {
      const { exportStepPdf } = await import('@/lib/pdfExport');
      await exportStepPdf(projectTitle, projectDate, stepNumber, stepName, content, data);
      toast.success('PDF가 다운로드되었습니다.');
    } catch (error) {
      toast.error('PDF 생성에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const exportAllSteps = async (options: ExportAllOptions) => {
    setExporting(true);
    try {
      const { exportAllStepsPdf } = await import('@/lib/pdfExport');
      await exportAllStepsPdf(options);
      toast.success('전체 PDF가 다운로드되었습니다.');
    } catch (error) {
      toast.error('PDF 생성에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportStep, exportAllSteps };
}
