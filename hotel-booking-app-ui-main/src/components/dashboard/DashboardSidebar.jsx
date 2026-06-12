import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const MENU_ITEMS = {
  USER: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'hotels', label: 'Hotels', path: '/hotels', icon: 'Building2' },
    { id: 'rooms', label: 'Rooms', path: '/rooms', icon: 'Door' },
    { id: 'bookings', label: 'My Bookings', path: '/my-bookings', icon: 'Calendar' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'User' },
  ],
  ADMIN: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'hotels', label: 'Hotels', path: '/admin/hotels', icon: 'Building2' },
    { id: 'rooms', label: 'Rooms', path: '/admin/rooms', icon: 'Door' },
    { id: 'bookings', label: 'Bookings', path: '/admin/bookings', icon: 'Calendar' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'User' },
  ],
};

function Icon({ name, className = 'w-5 h-5' }) {
  const icons = {
    LayoutDashboard: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75h.008v.008H9.75V12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75a.75.75 0 000 1.5.75.75 0 000-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12.75h.008v.008h-.008V12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 100 1.5.75.75 0 000-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 12.75h.008v.008h-.008V12.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 19.5h.008v.008H9.75V19.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 19.5h.008v.008h-.008V19.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 19.5h.008v.008h-.008V19.5z" />
      </svg>
    ),
    Building2: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h10V3" />
      </svg>
    ),
    Door: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6zm6 10a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
    Calendar: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    Users: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5c-3.315 0-6-1.343-6-3s2.685-3 6-3 6 1.343 6 3-2.685 3-6 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    ),
    User: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  return icons[name] || null;
}

function SidebarLink({ item, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-lg bg-indigo-600" />
      )}
      <Icon name={item.icon} className="w-5 h-5" />
      <span>{item.label}</span>
    </button>
  );
}

export default function DashboardSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const menuItems = MENU_ITEMS[user?.role] || MENU_ITEMS.USER;

  const handleNavigation = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-sm font-extrabold tracking-wide text-white">
              YK
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">YK StayEase</p>
              <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Admin Panel' : 'Traveler'}</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.id}
              item={item}
              isActive={pathname === item.path || pathname.startsWith(item.path + '/')}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
