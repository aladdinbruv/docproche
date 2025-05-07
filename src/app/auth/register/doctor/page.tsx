'use client';

import Link from "next/link";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// Specialties list 
const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Family Medicine",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Gynecology",
  "Hematology",
  "Infectious Disease",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Obstetrics",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology"
];

// Weekdays for available_days selection
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function DoctorRegisterPage() {
  const { isLoading, setIsLoading } = useAuth();
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    
    // Professional info
    specialty: '',
    yearsOfExperience: '',
    education: '',
    bio: '',
    consultationFee: '',
    location: '',
    medicalLicense: '',
    availableDays: [] as string[],
    
    // Agreement and verification
    terms: false,
    captchaToken: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      
      if (id === 'terms') {
        setFormData(prev => ({
          ...prev,
          terms: checkbox.checked
        }));
      } else if (id.startsWith('day-')) {
        const day = id.replace('day-', '');
        setFormData(prev => {
          const currentDays = [...prev.availableDays];
          
          if (checkbox.checked && !currentDays.includes(day)) {
            currentDays.push(day);
          } else if (!checkbox.checked && currentDays.includes(day)) {
            const index = currentDays.indexOf(day);
            currentDays.splice(index, 1);
          }
          
          return {
            ...prev,
            availableDays: currentDays
          };
        });
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCaptchaVerify = (token: string) => {
    console.log("Captcha verified with token:", token ? `${token.substring(0, 10)}...` : "No token");
    setFormData(prev => ({
      ...prev,
      captchaToken: token
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required");
      return false;
    }
    
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!formData.specialty) {
      setError("Specialty is required");
      return false;
    }
    
    if (!formData.yearsOfExperience) {
      setError("Years of experience is required");
      return false;
    }
    
    if (!formData.education.trim()) {
      setError("Education information is required");
      return false;
    }
    
    if (!formData.bio.trim()) {
      setError("Bio is required");
      return false;
    }
    
    if (!formData.consultationFee) {
      setError("Consultation fee is required");
      return false;
    }
    
    if (!formData.medicalLicense.trim()) {
      setError("Medical license number is required");
      return false;
    }
    
    if (formData.availableDays.length === 0) {
      setError("Please select at least one available day");
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      
      console.log("Registering doctor with:", { 
        email: formData.email, 
        full_name: formData.fullName,
        specialty: formData.specialty,
        yearsOfExperience: parseFloat(formData.yearsOfExperience),
        consultationFee: parseFloat(formData.consultationFee)
      });
      
      // Use the server API route for registration
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
            role: 'doctor',
            phone_number: formData.phoneNumber,
            specialty: formData.specialty,
            years_of_experience: parseFloat(formData.yearsOfExperience),
            education: formData.education,
            bio: formData.bio,
            consultation_fee: parseFloat(formData.consultationFee),
            available_days: formData.availableDays,
            location: formData.location,
            medical_license: formData.medicalLicense
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      console.log('Doctor registration successful:', data);
      // Redirect to login page with a message
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Join as a Healthcare Provider</h1>
          <p className="text-muted-foreground mt-2">Create your professional account on DocToProche</p>
        </div>
        
        <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6">
          <div className="flex justify-between mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="ml-3">
                <p className="font-medium">Basic Information</p>
                <p className="text-sm text-muted-foreground">Your account details</p>
              </div>
            </div>
            <div className="w-16 h-0.5 self-center bg-gray-200"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <div className="ml-3">
                <p className="font-medium">Professional Details</p>
                <p className="text-sm text-muted-foreground">Your practice information</p>
              </div>
            </div>
            <div className="w-16 h-0.5 self-center bg-gray-200"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <div className="ml-3">
                <p className="font-medium">Verification</p>
                <p className="text-sm text-muted-foreground">Final steps</p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block mb-1 font-medium">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="input w-full"
                    placeholder="Dr. Jane Smith"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block mb-1 font-medium">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input w-full"
                    placeholder="doctor@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block mb-1 font-medium">
                      Password*
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="input w-full"
                      placeholder="Min. 8 characters"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-1 font-medium">
                      Confirm Password*
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
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block mb-1 font-medium">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    className="input w-full"
                    placeholder="+1 (555) 123-4567"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Professional Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="specialty" className="block mb-1 font-medium">
                      Specialty*
                    </label>
                    <select
                      id="specialty"
                      className="input w-full"
                      required
                      value={formData.specialty}
                      onChange={handleChange}
                    >
                      <option value="">Select your specialty</option>
                      {SPECIALTIES.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="yearsOfExperience" className="block mb-1 font-medium">
                      Years of Experience*
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      className="input w-full"
                      placeholder="10"
                      min="0"
                      step="0.5"
                      required
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="education" className="block mb-1 font-medium">
                    Education & Qualifications*
                  </label>
                  <textarea
                    id="education"
                    rows={3}
                    className="input w-full"
                    placeholder="MD from University of Medicine, Board Certified in Internal Medicine"
                    required
                    value={formData.education}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block mb-1 font-medium">
                    Professional Bio*
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="input w-full"
                    placeholder="Tell patients about your practice, experience, and approach to care..."
                    required
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="consultationFee" className="block mb-1 font-medium">
                      Consultation Fee (USD)*
                    </label>
                    <input
                      type="number"
                      id="consultationFee"
                      className="input w-full"
                      placeholder="100.00"
                      min="0"
                      step="0.01"
                      required
                      value={formData.consultationFee}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="medicalLicense" className="block mb-1 font-medium">
                      Medical License Number*
                    </label>
                    <input
                      type="text"
                      id="medicalLicense"
                      className="input w-full"
                      placeholder="Enter your medical license number"
                      required
                      value={formData.medicalLicense}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block mb-1 font-medium">
                    Practice Location*
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="input w-full"
                    placeholder="123 Medical Plaza, New York, NY"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">
                    Available Days*
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`day-${day}`}
                          checked={formData.availableDays.includes(day)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <label htmlFor={`day-${day}`}>{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Verification */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-2">Review Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                      <p><span className="font-medium">Email:</span> {formData.email}</p>
                      <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                      <p><span className="font-medium">Specialty:</span> {formData.specialty}</p>
                      <p><span className="font-medium">Experience:</span> {formData.yearsOfExperience} years</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Education:</span> {formData.education}</p>
                      <p><span className="font-medium">Fee:</span> ${formData.consultationFee}</p>
                      <p><span className="font-medium">Location:</span> {formData.location || 'Not specified'}</p>
                      <p><span className="font-medium">License:</span> {formData.medicalLicense}</p>
                      <p><span className="font-medium">Available:</span> {formData.availableDays.join(', ')}</p>
                    </div>
                  </div>
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
                    I confirm that the information provided is accurate and I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
                    onVerify={handleCaptchaVerify}
                    ref={captchaRef}
                    size="normal"
                    theme="light"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-ghost"
                >
                  Back
                </button>
              ) : (
                <Link href="/auth/register" className="btn-ghost">
                  Register as Patient
                </Link>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading || 
                    (!formData.captchaToken && 
                      !(process.env.NODE_ENV === 'development' && 
                        process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001')) || 
                    !formData.terms}
                >
                  {isLoading ? 'Creating Account...' : 'Create Doctor Account'}
                </button>
              )}
            </div>
          </form>
          
          <div className="text-center pt-6 mt-6 border-t border-border">
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