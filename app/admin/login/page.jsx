import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm role="admin" title="Admin Login" redirectPath="/admin" />
    </Suspense>
  );
}