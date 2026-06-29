import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function ManagerLogin() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm role="manager" title="Manager Login" redirectPath="/manager" />
    </Suspense>
  );
}