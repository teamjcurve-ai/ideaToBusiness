'use client';

import { Settings, User, Menu, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SettingsModal from './SettingsModal';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, breadcrumb, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors md:hidden"
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
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            title="설정"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:inline max-w-[120px] truncate">
                {displayName}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
