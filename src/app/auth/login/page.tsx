'use client';

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log("Attempting to login with:", formData.email);
      await signIn(formData.email, formData.password);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Log in to access your account</p>
        </div>
        
        <div className="card p-6 space-y-6">
          <div className="flex gap-2 mb-4">
            <Link 
              href="/auth/login" 
              className={`flex-1 py-2 border-b-2 text-center font-medium ${role === 'patient' ? 'border-primary' : 'border-border hover:border-primary transition-colors'}`}
            >
              Patient
            </Link>
            <Link 
              href="/auth/login?role=doctor" 
              className={`flex-1 py-2 border-b-2 text-center font-medium ${role === 'doctor' ? 'border-primary' : 'border-border hover:border-primary transition-colors'}`}
            >
              Doctor
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="input w-full"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="input w-full"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember" className="text-sm">
                  Remember me
                </label>
              </div>
              
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 