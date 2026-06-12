import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/ToastProvider';
import { useConfirmDialog } from '../ui/ConfirmDialogProvider';

export default function DashboardTopNav({ onMenuToggle }) {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { openConfirm } = useConfirmDialog();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    openConfirm({
      title: 'Sign out of your account?',
      description: 'You will need to sign in again to access dashboard features.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Logged In',
      tone: 'danger',
      onConfirm: () => {
        clearSession();
        toast.info('You have been signed out.');
        navigate('/login', { replace: true });
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Menu toggle + Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-cyan-500 text-[10px] font-extrabold tracking-wide text-white">
              YK
            </span>
            <h1 className="text-lg font-semibold text-slate-900">YK StayEase</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              {user?.role === 'ADMIN' ? 'Admin' : 'User'}
            </span>
          </div>
        </div>

        {/* Right: Profile + Logout */}
        <div className="flex items-center gap-4">
          {/* Notifications (placeholder) */}
          <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls="profile-menu"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div id="profile-menu" role="menu" className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg motion-safe:animate-[fade-in_.2s_ease-out]">
                {/* User Info */}
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <p className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.26 2.37 1.806a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.26 3.31-1.806 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.26-2.37-1.806a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.26-3.31 1.806-2.37a1.724 1.724 0 002.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
