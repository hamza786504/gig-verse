import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function ClientLogin() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm role="client" title="Client Login" redirectPath="/client" />
    </Suspense>
  );
}