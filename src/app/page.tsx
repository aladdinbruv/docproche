import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                <span className="text-primary">Healthcare</span> Made Simple
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Schedule appointments with doctors, manage prescriptions, and receive care from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/doctors" className="btn-primary text-center">
                  Find a Doctor
                </Link>
                <Link href="/auth/register" className="btn-secondary text-center">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/hero-doctor.jpg"
                alt="Doctor with patient"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose DocToProche?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless experience for both patients and doctors, making healthcare accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 space-y-4">
              <div className="p-2 bg-primary/10 rounded-full w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Easy Scheduling</h3>
              <p className="text-muted-foreground">
                Book appointments with doctors in just a few clicks, choose between in-person or video consultations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 space-y-4">
              <div className="p-2 bg-primary/10 rounded-full w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your health data and prescriptions are securely stored and only accessible to you and your doctor.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 space-y-4">
              <div className="p-2 bg-primary/10 rounded-full w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Easy Communication</h3>
              <p className="text-muted-foreground">
                Chat with your doctor, receive prescription updates, and get follow-up care through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify your healthcare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients and doctors who are transforming healthcare with DocToProche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register?role=patient" 
              className="bg-white text-primary font-medium py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors"
            >
              Sign Up as Patient
            </Link>
            <Link 
              href="/auth/register?role=doctor" 
              className="bg-primary-foreground/10 border border-primary-foreground font-medium py-3 px-6 rounded-md hover:bg-primary-foreground/20 transition-colors"
            >
              Join as Doctor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
