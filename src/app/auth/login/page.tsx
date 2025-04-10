import Link from "next/link";

export default function LoginPage() {
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
              className="flex-1 py-2 border-b-2 border-primary text-center font-medium"
            >
              Patient
            </Link>
            <Link 
              href="/auth/login?role=doctor" 
              className="flex-1 py-2 border-b-2 border-border hover:border-primary text-center font-medium transition-colors"
            >
              Doctor
            </Link>
          </div>
          
          <form className="space-y-4">
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
                placeholder="Enter your password"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="mr-2"
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
            >
              Log In
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