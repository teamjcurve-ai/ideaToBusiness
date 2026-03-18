'use client';

import { Settings, User, Menu } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, breadcrumb, onMenuToggle }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const user = useAuthStore((state) => state.user);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="h-16 glass-heavy sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-white/40 rounded-xl transition-colors md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">ideaToBusiness</h1>
          {breadcrumb && (
            <>
              <span className="text-gray-400 hidden sm:inline">/</span>
              <span className="text-sm text-gray-600 hidden sm:inline">{breadcrumb}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/40 rounded-xl transition-colors"
            title="설정"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 rounded-full">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <User className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[120px] truncate">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
