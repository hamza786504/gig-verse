import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function FreelancerLogin() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm role="freelancer" title="Freelancer Login" redirectPath="/freelancer" />
    </Suspense>
  );
}