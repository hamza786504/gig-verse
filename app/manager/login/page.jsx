import LoginForm from '@/components/auth/LoginForm';

export default function ManagerLogin() {
  return <LoginForm role="manager" title="Manager Login" redirectPath="/manager" />;
}
