import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background via-background to-accent/20 pt-16 pb-24">
        <div className="container-tight">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-6">
              <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-2">
                Healthcare Simplified
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Your Health, <span className="text-primary">Our Priority</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Schedule appointments with top specialists, manage your health records, and receive care from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link href="/doctors" className="btn-primary flex items-center justify-center gap-2">
                  Find a Doctor
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="ml-1"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/auth/register" className="btn-outline">
                  Create Account
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">4,500+</span> satisfied patients this month
                </div>
              </div>
            </div>
            <div className="md:col-span-6 relative">
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent rounded-full blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent mix-blend-overlay"></div>
        <Image
                  src="/images/doctoproche-hero.png"
                  alt="Doctor with patient"
                  width={600}
                  height={500}
                  className="w-full object-cover aspect-[4/3]"
          priority
        />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[var(--card)] rounded-lg shadow-lg p-3 border border-[var(--border)] flex items-center gap-3 max-w-[240px]">
                <div className="bg-success/20 p-2 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-success"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Appointment Booked</p>
                  <p className="text-xs text-muted-foreground">Dr. Emma Wilson at 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search Widget - Add after Hero Section */}
      <section className="py-12 bg-background relative -mt-12">
        <div className="container-tight">
          <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] shadow-lg p-6 md:p-8 border relative z-10">
            <h3 className="text-xl font-semibold mb-4">Find a Doctor Now</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Specialty</label>
                <select className="input w-full">
                  <option value="">All Specialties</option>
                  <option value="cardiologist">Cardiologist</option>
                  <option value="dermatologist">Dermatologist</option>
                  <option value="pediatrician">Pediatrician</option>
                  <option value="neurologist">Neurologist</option>
                  <option value="orthopedic">Orthopedic Surgeon</option>
                </select>
              </div>
              
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Location</label>
                <input 
                  type="text" 
                  placeholder="City or Zip Code" 
                  className="input w-full"
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Date</label>
                <input 
                  type="date" 
                  className="input w-full"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="md:col-span-1">
                <button className="btn-primary w-full py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div className="p-6">
              <p className="text-4xl font-bold text-primary">2500+</p>
              <p className="text-muted-foreground">Doctors</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary">150k+</p>
              <p className="text-muted-foreground">Patients</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary">30+</p>
              <p className="text-muted-foreground">Specialties</p>
            </div>
            <div className="p-6">
              <p className="text-4xl font-bold text-primary">98%</p>
              <p className="text-muted-foreground">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-tight">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              Our Benefits
            </div>
            <h2 className="text-3xl font-bold mb-4">Why Choose DocToProche?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide a seamless experience for both patients and doctors, making healthcare accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-8 space-y-5 transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-primary"
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
              <Link href="/doctors" className="inline-flex items-center text-primary font-medium text-sm">
                Find available slots
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-8 space-y-5 transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-primary"
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
              <Link href="/about" className="inline-flex items-center text-primary font-medium text-sm">
                Learn about security
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-8 space-y-5 transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-primary"
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
              <Link href="/contact" className="inline-flex items-center text-primary font-medium text-sm">
                Contact support
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Add after Features Section */}
      <section className="section-padding bg-gradient-to-b from-background to-secondary/20">
        <div className="container-tight">
          <div className="text-center mb-16">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              Simple Process
            </div>
            <h2 className="text-3xl font-bold mb-4">How DocToProche Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the care you need in just a few simple steps - it's that easy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-primary/30 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Search Doctors</h3>
                <p className="text-center text-muted-foreground">
                  Find specialists by location, specialty, rating or availability
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Book Appointment</h3>
                <p className="text-center text-muted-foreground">
                  Select a convenient time slot that works for your schedule
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Get Consultation</h3>
                <p className="text-center text-muted-foreground">
                  Meet your doctor in-person or through secure video call
                </p>
              </div>
            </div>
            
            {/* Step 4 */}
            <div className="relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center">Follow-up Care</h3>
                <p className="text-center text-muted-foreground">
                  Get prescriptions, follow-up appointments and care plans online
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/doctors" className="btn-primary">
              Find a Doctor Now
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Add before CTA Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container-tight">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              Patient Testimonials
            </div>
            <h2 className="text-3xl font-bold mb-4">What Our Patients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from patients who have used DocToProche to transform their healthcare experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6 relative transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xl">
                    L
                  </div>
                  <div>
                    <p className="font-medium">Lisa M.</p>
                    <p className="text-sm text-muted-foreground">Pediatric Patient</p>
                  </div>
                </div>
                <div className="text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                </div>
              </div>
              
              <blockquote className="text-foreground/90 mb-4">
                "Finding a pediatrician for my son used to be stressful. DocToProche made it so simple! We found Dr. Roberts within minutes and booked an appointment for the same day."
              </blockquote>
              
              <div className="flex gap-2 mt-auto">
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Quick booking</span>
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Pediatrics</span>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6 relative transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xl">
                    R
                  </div>
                  <div>
                    <p className="font-medium">Robert T.</p>
                    <p className="text-sm text-muted-foreground">Cardiology Patient</p>
                  </div>
                </div>
                <div className="text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                </div>
              </div>
              
              <blockquote className="text-foreground/90 mb-4">
                "I needed to see a specialist quickly for a heart concern. Through DocToProche, I connected with Dr. Johnson, reviewed his credentials, and scheduled a video consultation all within an hour."
              </blockquote>
              
              <div className="flex gap-2 mt-auto">
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Video consult</span>
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Urgent care</span>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-6 relative transition-all duration-200 ease-in-out hover:shadow-md">
              <div className="flex justify-between mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xl">
                    J
                  </div>
                  <div>
                    <p className="font-medium">Jennifer K.</p>
                    <p className="text-sm text-muted-foreground">Dermatology Patient</p>
                  </div>
                </div>
                <div className="text-amber-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                </div>
              </div>
              
              <blockquote className="text-foreground/90 mb-4">
                "The follow-up care on this platform is amazing. My dermatologist Dr. Williams sends me reminders for skincare routines, and I can message him with quick questions without scheduling a full appointment."
              </blockquote>
              
              <div className="flex gap-2 mt-auto">
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Follow-up care</span>
                <span className="badge bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">Direct messaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        <div className="container-tight text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to simplify your healthcare?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of patients and doctors who are transforming healthcare with DocToProche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register?role=patient" 
              className="bg-white text-primary font-medium py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors shadow-lg"
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
          
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p>HIPAA Compliant</p>
            </div>
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>Board-Certified Doctors</p>
            </div>
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>24/7 Support</p>
            </div>
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p>Same-Day Appointments</p>
            </div>
          </div>
    </div>
      </section>

      {/* Add this to the bottom of your page.tsx, before the closing tags */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Link 
          href="/doctors" 
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <path d="M3 10h18" />
            <path d="M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
          </svg>
        </Link>
      </div>
    </>
  );
}