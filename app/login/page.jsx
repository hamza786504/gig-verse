"use client";

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password
    });
    
    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-soft border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-secondary mb-8 tracking-tight">Welcome Back</h2>
        
        {registered && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-center font-medium border border-green-100">Account created successfully. Please log in.</div>}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-primary to-primary-hover hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5">
            Sign in
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary-hover">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

// Main exported component wrapped in Suspense
export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}