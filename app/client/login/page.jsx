import LoginForm from '@/components/auth/LoginForm';

export default function ClientLogin() {
  return <LoginForm role="client" title="Client Login" redirectPath="/client" />;
}
