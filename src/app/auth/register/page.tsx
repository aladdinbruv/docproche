'use client';

import Link from "next/link";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function RegisterPage() {
  const { isLoading, setIsLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';
  const captchaRef = useRef<HCaptcha>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    captchaToken: ''
  });
  const [error, setError] = useState<string | null>(null);

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    // Allow submission without captcha in development with the test key
    const isTestEnvironment = 
      process.env.NODE_ENV === 'development' && 
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001';

    if (!formData.captchaToken && !isTestEnvironment) {
      setError("Please complete the captcha verification");
      return;
    }

    try {
      setIsLoading(true);
      
      console.log("Attempting to register with:", { 
        email: formData.email, 
        role,
        full_name: formData.fullName
      });
      
      // Use the server API route instead of direct signup
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          captchaToken: formData.captchaToken,
          userData: {
            full_name: formData.fullName,
            role,
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      console.log('Registration successful:', data);
      // Redirect to login page with a success message
      router.push('/auth/login?message=registration_successful');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      // Reset captcha on error
      captchaRef.current?.resetCaptcha();
      setFormData(prev => ({ ...prev, captchaToken: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started with DocToProche</p>
        </div>
        
        <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6 space-y-6">
          <div className="flex gap-2 mb-4">
            <Link 
              href="/auth/register" 
              className={`flex-1 py-2 border-b-2 text-center font-medium ${role === 'patient' ? 'border-primary' : 'border-border hover:border-primary transition-colors'}`}
            >
              Patient
            </Link>
            <Link 
              href="/auth/register/doctor" 
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
              <label htmlFor="fullName" className="block mb-1 font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className="input w-full"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            
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
                placeholder="Create a password (min. 8 characters)"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="input w-full"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                required
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
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
                    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001')) || 
                !formData.terms}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 