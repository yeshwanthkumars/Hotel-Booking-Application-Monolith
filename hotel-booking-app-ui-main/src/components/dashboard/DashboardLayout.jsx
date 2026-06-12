import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNav from './DashboardTopNav';

/**
 * DashboardLayout wraps authenticated pages with navigation and sidebar.
 * Handles sidebar toggle state for mobile responsiveness.
 *
 * @param {React.ReactNode} children - Page content to display
 */
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden flex-col bg-slate-50 lg:flex-row">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Top Navigation */}
        <DashboardTopNav onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 motion-safe:animate-[fade-in_.22s_ease-out]">{children}</main>
      </div>
    </div>
  );
}
