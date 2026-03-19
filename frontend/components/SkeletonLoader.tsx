'use client';

export function StepSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-pulse">
      {/* Title */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded-xl w-48 mb-3" />
        <div className="h-4 bg-gray-100 rounded-lg w-80" />
      </div>

      {/* Content card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded-lg w-full" />
          <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
          <div className="h-4 bg-gray-200 rounded-lg w-4/6" />
          <div className="h-4 bg-gray-100 rounded-lg w-full" />
          <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="h-5 bg-gray-200 rounded-lg w-48 mb-3" />
          <div className="h-3 bg-gray-100 rounded-lg w-32 mb-4" />
          <div className="h-2 bg-gray-100 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
}
