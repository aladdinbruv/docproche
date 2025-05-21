"use client";

import { motion } from "framer-motion";
import { MedicalCrossIcon } from "@/components/MedicalIcons";
import { CtaSection } from "@/components/CtaSection";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <div className="flex justify-center mb-4">
              <MedicalCrossIcon className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About DocToProche</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Transforming healthcare by connecting patients with top medical professionals through our seamless appointment platform.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Mission */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At DocToProche, our mission is to make quality healthcare accessible to everyone by simplifying the process of finding and connecting with healthcare providers.
              </p>
              <p className="text-muted-foreground mb-4">
                We believe that technology can bridge the gap between patients and medical professionals, making healthcare more efficient, transparent, and patient-centered.
              </p>
              <p className="text-muted-foreground">
                Our platform is designed to save time, reduce administrative barriers, and improve the overall patient experience in healthcare.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="/images/doctor-patient.jpg" 
                alt="Doctor with patient" 
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/e6f7ff/0099cc?text=Doctor+Consultation";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              DocToProche was founded in 2025 by a team of healthcare professionals and technology experts who experienced firsthand the challenges in healthcare access and coordination.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
            
            <div className="space-y-24 relative">
              <TimelineItem 
                year="2024" 
                title="Foundation" 
                description="DocToProche was established with a vision to transform healthcare scheduling and access."
                position="left"
                delay={0.3}
              />
              
              <TimelineItem 
                year="2024" 
                title="Platform Launch" 
                description="Our first version of the appointment platform was launched, connecting patients with doctors in major cities."
                position="right"
                delay={0.5}
              />
              
              <TimelineItem 
                year="2025" 
                title="Expanding Services" 
                description="Added telemedicine capabilities and expanded our network of healthcare providers to include specialists across multiple disciplines."
                position="left"
                delay={0.7}
              />
              
              <TimelineItem 
                year="Future" 
                title="AI-Assisted Health" 
                description="We're developing AI-powered health insights to provide personalized recommendations and improve preventive care."
                position="right"
                delay={0.9}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Team</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Meet the dedicated professionals behind DocToProche who are passionate about improving healthcare through technology.
            </p>
          </motion.div>

          <div className="flex justify-center">
            <div className="max-w-md w-full">
              <TeamMember 
                name="Alaaeddine barakat"
                role="Founder and Developer of DocToProche"
                image="/images/dashinobi.webp"
                bio="Full-stack developer with expertise in healthcare technology solutions, dedicated to improving patient care through innovative digital platforms."
                delay={0.4}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The principles that guide our work and decision-making every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ValueCard 
              icon={
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              } 
              title="Patient Safety"
              description="We prioritize patient safety and security in every aspect of our service."
              delay={0.3}
            />
            
            <ValueCard 
              icon={
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              } 
              title="Accessibility"
              description="Making healthcare accessible to everyone regardless of location or circumstance."
              delay={0.4}
            />
            
            <ValueCard 
              icon={
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              } 
              title="Transparency"
              description="Providing clear information about doctors, services, and appointment processes."
              delay={0.5}
            />
            
            <ValueCard 
              icon={
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              } 
              title="Innovation"
              description="Continuously improving our platform with new technologies to enhance the healthcare experience."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaSection 
        title="Ready to experience better healthcare?"
        description="Join thousands of patients who have simplified their healthcare journey with DocToProche."
        primaryButtonText="Find a Doctor"
        primaryButtonLink="/doctors"
        secondaryButtonText="Learn How It Works"
        secondaryButtonLink="/how-it-works"
      />
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ year, title, description, position, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`flex ${position === "left" ? "md:flex-row" : "md:flex-row-reverse"} items-center`}
    >
      <div className="flex-1">
        <div className={`bg-white p-6 rounded-xl shadow-md ${position === "left" ? "md:mr-8" : "md:ml-8"}`}>
          <span className="text-sm text-blue-600 font-semibold">{year}</span>
          <h3 className="text-xl font-bold mt-1 mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <div className="hidden md:block">
        <div className="w-5 h-5 rounded-full bg-blue-600 border-4 border-blue-100 z-10 relative"></div>
      </div>
      
      <div className="flex-1"></div>
    </motion.div>
  );
}

// Team Member Component
function TeamMember({ name, role, image, bio, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="h-64 relative overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/400x400/e6f7ff/0099cc?text=${name.charAt(0)}`;
          }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-blue-600 mb-4">{role}</p>
        <p className="text-muted-foreground">{bio}</p>
      </div>
    </motion.div>
  );
}

// Value Card Component
function ValueCard({ icon, title, description, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl p-6 shadow-md"
    >
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}