'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function LoginPage() {
  const { signIn, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';
  const message = searchParams.get('message');
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const captchaRef = useRef<HCaptcha>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
    captchaToken: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle automatic redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [user, redirectTo, router]);

  // Handle success message from URL parameter
  useEffect(() => {
    if (message === 'registration_successful') {
      setSuccessMessage('Account created successfully! Please log in with your credentials.');
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCaptchaVerify = (token: string) => {
    console.log("Captcha verified with token:", token ? `${token.substring(0, 10)}...` : "No token");
    setFormData(prev => ({
      ...prev,
      captchaToken: token
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Allow login without captcha in development with the test key
    const isTestEnvironment = 
      process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001';

    if (!formData.captchaToken && !isTestEnvironment) {
      setError("Please complete the captcha verification");
      return;
    }

    try {
      console.log("Attempting to login with:", formData.email);
      await signIn(formData.email, formData.password, formData.captchaToken, redirectTo);
      
      // The signIn function now handles the redirection
      // No need to redirect here as it's already handled
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      // Reset captcha on error
      captchaRef.current?.resetCaptcha();
      setFormData(prev => ({ ...prev, captchaToken: '' }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Log in to access your account</p>
          {redirectTo && redirectTo !== '/dashboard' && (
            <p className="text-sm text-muted-foreground mt-1">
              You'll be redirected to {redirectTo.split('?')[0]} after login
            </p>
          )}
        </div>
        
        <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6 space-y-6">
          <div className="flex gap-2 mb-4">
            <Link 
              href={`/auth/login?${new URLSearchParams({
                ...(redirectTo ? { redirectTo } : {})
              })}`}
              className={`flex-1 py-2 border-b-2 text-center font-medium ${role === 'patient' ? 'border-primary' : 'border-border hover:border-primary transition-colors'}`}
            >
              Patient
            </Link>
            <Link 
              href={`/auth/login?${new URLSearchParams({
                role: 'doctor',
                ...(redirectTo ? { redirectTo } : {})
              })}`}
              className={`flex-1 py-2 border-b-2 text-center font-medium ${role === 'doctor' ? 'border-primary' : 'border-border hover:border-primary transition-colors'}`}
            >
              Doctor
            </Link>
          </div>
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}
          
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
            
            <div className="mt-4 flex justify-center">
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
                onVerify={handleCaptchaVerify}
                ref={captchaRef}
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading || 
                (!formData.captchaToken && 
                  !(process.env.NODE_ENV === 'development' && 
                    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001'))}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href={`/auth/register?${new URLSearchParams({
                  ...(redirectTo ? { redirectTo } : {}),
                  ...(role === 'doctor' ? { role: 'doctor' } : {})
                })}`} 
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 