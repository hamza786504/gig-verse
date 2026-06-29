"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Briefcase, LayoutDashboard, LogOut, Menu, X, ArrowLeft, Activity } from 'lucide-react';

export default function ManagerLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/manager/login') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center animate-pulse text-gray-500">Loading portal...</div>;
  }

  if (!session) {
    router.push('/manager/login');
    return null;
  }

  if (session.user.role !== 'manager') {
    router.push('/');
    return null;
  }

  const navLinks = [
    { href: '/manager/dashboard', label: 'Approvals Dashboard', icon: LayoutDashboard },
    { href: '/manager/active-orders', label: 'Active Orders', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-soft transform transition-transform duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:static lg:w-72`}
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0 justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Briefcase className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-secondary tracking-tight">Manager Portal</span>
          </Link>
          <button className="lg:hidden text-gray-500 hover:text-secondary" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-secondary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-bold text-secondary">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
          
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-500 hover:text-secondary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Main Site
          </Link>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center px-4 justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-500 hover:text-secondary rounded-lg hover:bg-gray-50">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-secondary">Manager Portal</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
