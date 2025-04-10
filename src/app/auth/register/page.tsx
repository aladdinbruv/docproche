import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to get started with DocToProche</p>
        </div>
        
        <div className="card p-6 space-y-6">
          <div className="flex gap-2 mb-4">
            <Link 
              href="/auth/register" 
              className="flex-1 py-2 border-b-2 border-primary text-center font-medium"
            >
              Patient
            </Link>
            <Link 
              href="/auth/register?role=doctor" 
              className="flex-1 py-2 border-b-2 border-border hover:border-primary text-center font-medium transition-colors"
            >
              Doctor
            </Link>
          </div>
          
          <form className="space-y-4">
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
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                required
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
            
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Create Account
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 