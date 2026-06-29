import LoginForm from '@/components/auth/LoginForm';

export default function AdminLogin() {
  return <LoginForm role="admin" title="Admin Login" redirectPath="/admin" />;
}
