"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Hide global navbar for dashboard routes as they will use sidebars
  const isDashboardRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/manager');

  if (isDashboardRoute) {
    return null;
  }

  return <Navbar />;
}
