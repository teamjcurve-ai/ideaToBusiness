'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-white/60 px-2 py-0.5 rounded-lg text-sm font-mono text-gray-800" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl overflow-x-auto mb-3 border border-white/40" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-3" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full divide-y divide-gray-200/60" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-white/40" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 text-sm text-gray-700 border-t border-gray-200/40" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
