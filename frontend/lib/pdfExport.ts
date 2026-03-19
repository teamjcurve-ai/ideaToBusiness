import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { marked } from 'marked';

// jspdf-autotable extends jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface StepData {
  stepNumber: number;
  name: string;
  content?: string;
  data?: any;
}

interface PdfOptions {
  projectTitle: string;
  projectDate: string;
  steps: StepData[];
}

const STEP_NAMES: Record<number, string> = {
  1: '아이디어 입력',
  2: '시장 리서치',
  3: '고객 발견',
  4: '핵심 기능 선정',
  5: 'PRD 작성',
  6: '마케팅 전략',
  7: '사전 부검',
  8: '킥오프 준비',
};

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const PAGE_HEIGHT = 297;
const FOOTER_Y = PAGE_HEIGHT - 15;
const HEADER_Y = 12;

let fontLoaded = false;

async function loadFont(doc: jsPDF) {
  if (fontLoaded) return;
  const { nanumGothicNormal } = await import('@/lib/fonts/nanumGothic-normal');
  doc.addFileToVFS('NanumGothic-Regular.ttf', nanumGothicNormal);
  doc.addFont('NanumGothic-Regular.ttf', 'NanumGothic', 'normal');
  fontLoaded = true;
}

async function initDoc(): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await loadFont(doc);
  doc.setFont('NanumGothic', 'normal');
  return doc;
}

function addPageNumbers(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`${i} / ${totalPages}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' });
  }
}

function addRunningHeader(doc: jsPDF, projectTitle: string) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180);
    doc.text(projectTitle, MARGIN, HEADER_Y);
    doc.setDrawColor(230);
    doc.line(MARGIN, HEADER_Y + 2, PAGE_WIDTH - MARGIN, HEADER_Y + 2);
  }
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > FOOTER_Y - 10) {
    doc.addPage();
    return 22;
  }
  return y;
}

function renderCoverPage(doc: jsPDF, title: string, date: string) {
  // Background accent line
  doc.setDrawColor(0, 122, 255);
  doc.setLineWidth(1);
  doc.line(MARGIN, 80, MARGIN + 40, 80);

  // Title
  doc.setFontSize(28);
  doc.setTextColor(30);
  doc.text(title, MARGIN, 95);

  // Date
  doc.setFontSize(12);
  doc.setTextColor(120);
  doc.text(date, MARGIN, 108);

  // Footer branding
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('ideaToBusiness', MARGIN, PAGE_HEIGHT - 30);
  doc.setFontSize(8);
  doc.text('AI 기반 아이디어 → 비즈니스 파이프라인', MARGIN, PAGE_HEIGHT - 24);
}

function renderStepHeader(doc: jsPDF, stepNumber: number, stepName: string): number {
  let y = 22;

  // Step number badge
  doc.setFillColor(0, 122, 255);
  doc.roundedRect(MARGIN, y - 4, 8, 8, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255);
  doc.text(`${stepNumber}`, MARGIN + 4, y + 1.5, { align: 'center' });

  // Step name
  doc.setFontSize(18);
  doc.setTextColor(30);
  doc.text(stepName, MARGIN + 12, y + 2);

  y += 12;

  // Separator line
  doc.setDrawColor(230);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  return y + 8;
}

function renderStep1Data(doc: jsPDF, data: any, startY: number): number {
  let y = startY;

  const fields = [
    { label: '아이디어', value: data?.idea || '-' },
    { label: '해결하려는 문제', value: data?.problem || '-' },
    { label: '타겟 사용자', value: data?.targetUser || '-' },
    { label: '개발 기간', value: data?.developmentPeriod || '-' },
    { label: '팀 규모', value: data?.teamSize || '-' },
    { label: '프로젝트 목표 (KPI)', value: Array.isArray(data?.kpis) ? data.kpis.join(', ') : '-' },
    { label: '기타 제약 사항', value: data?.otherConstraints || '-' },
  ];

  doc.autoTable({
    startY: y,
    head: [],
    body: fields.map((f) => [f.label, f.value]),
    theme: 'plain',
    styles: {
      font: 'NanumGothic',
      fontSize: 10,
      cellPadding: 4,
      lineColor: [230, 230, 230],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', textColor: [80, 80, 80] },
      1: { cellWidth: CONTENT_WIDTH - 45, textColor: [50, 50, 50] },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  return doc.lastAutoTable.finalY + 8;
}

function renderMarkdownContent(doc: jsPDF, markdown: string, startY: number): number {
  const tokens = marked.lexer(markdown);
  let y = startY;

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const sizes: Record<number, number> = { 1: 16, 2: 14, 3: 12 };
        const fontSize = sizes[token.depth] || 11;
        const spacing = token.depth === 1 ? 10 : 7;

        y = checkPageBreak(doc, y, spacing + fontSize * 0.5);
        y += spacing;

        doc.setFontSize(fontSize);
        doc.setTextColor(30);

        const headText = stripInlineMarkdown(token.text);
        const lines = doc.splitTextToSize(headText, CONTENT_WIDTH);
        doc.text(lines, MARGIN, y);
        y += lines.length * fontSize * 0.45 + 3;
        break;
      }

      case 'paragraph': {
        y = checkPageBreak(doc, y, 8);
        doc.setFontSize(10);
        doc.setTextColor(60);

        const text = stripInlineMarkdown(token.text);
        const lines = doc.splitTextToSize(text, CONTENT_WIDTH);

        for (let i = 0; i < lines.length; i++) {
          y = checkPageBreak(doc, y, 5);
          doc.text(lines[i], MARGIN, y);
          y += 4.5;
        }
        y += 3;
        break;
      }

      case 'list': {
        y = checkPageBreak(doc, y, 6);
        const items = token.items || [];

        items.forEach((item: any, idx: number) => {
          y = checkPageBreak(doc, y, 6);
          doc.setFontSize(10);
          doc.setTextColor(60);

          const bullet = token.ordered ? `${idx + 1}.` : '•';
          const text = stripInlineMarkdown(item.text);
          const lines = doc.splitTextToSize(text, CONTENT_WIDTH - 8);

          doc.text(bullet, MARGIN + 2, y);
          for (let i = 0; i < lines.length; i++) {
            y = checkPageBreak(doc, y, 5);
            doc.text(lines[i], MARGIN + 8, y);
            y += 4.5;
          }
          y += 1;
        });
        y += 2;
        break;
      }

      case 'table': {
        y = checkPageBreak(doc, y, 20);

        const head = token.header?.map((h: any) => stripInlineMarkdown(h.text || h)) || [];
        const body = token.rows?.map((row: any) =>
          row.map((cell: any) => stripInlineMarkdown(cell.text || cell))
        ) || [];

        doc.autoTable({
          startY: y,
          head: [head],
          body: body,
          theme: 'grid',
          styles: {
            font: 'NanumGothic',
            fontSize: 9,
            cellPadding: 3,
            textColor: [50, 50, 50],
          },
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [30, 30, 30],
            fontStyle: 'bold',
          },
          margin: { left: MARGIN, right: MARGIN },
        });

        y = doc.lastAutoTable.finalY + 6;
        break;
      }

      case 'blockquote': {
        y = checkPageBreak(doc, y, 10);
        const bqText = stripInlineMarkdown(
          token.tokens?.map((t: any) => t.text || t.raw || '').join('') || token.text || ''
        );
        const lines = doc.splitTextToSize(bqText, CONTENT_WIDTH - 10);

        // Left bar
        doc.setDrawColor(0, 122, 255);
        doc.setLineWidth(0.8);
        const barHeight = lines.length * 4.5 + 4;
        doc.line(MARGIN + 2, y - 2, MARGIN + 2, y + barHeight - 2);

        doc.setFontSize(10);
        doc.setTextColor(100);
        for (const line of lines) {
          y = checkPageBreak(doc, y, 5);
          doc.text(line, MARGIN + 8, y);
          y += 4.5;
        }
        y += 4;
        break;
      }

      case 'code': {
        y = checkPageBreak(doc, y, 10);
        doc.setFontSize(8);
        doc.setTextColor(80);

        const codeLines = (token.text || '').split('\n');
        const bgHeight = codeLines.length * 3.8 + 6;

        doc.setFillColor(245, 245, 245);
        doc.roundedRect(MARGIN, y - 3, CONTENT_WIDTH, Math.min(bgHeight, FOOTER_Y - y - 5), 2, 2, 'F');

        y += 1;
        for (const line of codeLines) {
          y = checkPageBreak(doc, y, 4);
          doc.text(line, MARGIN + 4, y);
          y += 3.8;
        }
        y += 5;
        break;
      }

      case 'hr': {
        y = checkPageBreak(doc, y, 6);
        doc.setDrawColor(220);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 6;
        break;
      }

      case 'space': {
        y += 3;
        break;
      }

      default:
        break;
    }
  }

  return y;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/~~(.*?)~~/g, '$1');
}

// ============ Public API ============

export async function exportStepPdf(
  projectTitle: string,
  projectDate: string,
  stepNumber: number,
  stepName: string,
  content: string | null,
  data?: any,
): Promise<void> {
  const doc = await initDoc();

  const y = renderStepHeader(doc, stepNumber, stepName);

  if (stepNumber === 1 && data) {
    renderStep1Data(doc, data, y);
  } else if (content) {
    renderMarkdownContent(doc, content, y);
  }

  addPageNumbers(doc);
  addRunningHeader(doc, projectTitle);

  const filename = `${projectTitle}_${stepNumber}단계_${stepName}.pdf`;
  doc.save(filename);
}

export async function exportAllStepsPdf(options: PdfOptions): Promise<void> {
  const { projectTitle, projectDate, steps } = options;
  const doc = await initDoc();

  // Cover page
  renderCoverPage(doc, projectTitle, projectDate);

  // Each step
  for (let i = 1; i <= 8; i++) {
    const step = steps.find((s) => s.stepNumber === i);
    if (!step) continue;

    const stepName = STEP_NAMES[i] || step.name;
    const hasContent = (i === 1 && step.data) || (i > 1 && step.content);
    if (!hasContent) continue;

    doc.addPage();
    const y = renderStepHeader(doc, i, stepName);

    if (i === 1 && step.data) {
      renderStep1Data(doc, step.data, y);
    } else if (step.content) {
      renderMarkdownContent(doc, step.content, y);
    }
  }

  addPageNumbers(doc);
  addRunningHeader(doc, projectTitle);

  const filename = `${projectTitle}_전체_비즈니스플랜.pdf`;
  doc.save(filename);
}
