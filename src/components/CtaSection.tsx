import React from 'react';
import Link from 'next/link';
import { MedicalCrossIcon } from './MedicalIcons';

interface CtaSectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export const CtaSection: React.FC<CtaSectionProps> = ({
  title = "Take control of your health today!",
  description = "Schedule your first appointment and receive a free consultation with our healthcare specialists.",
  primaryButtonText = "Book Your Appointment",
  primaryButtonLink = "/doctors",
  secondaryButtonText = "Learn More",
  secondaryButtonLink = "/about",
}) => {
  return (
    <section className="py-12 md:py-20">
      <div className="container-tight">
        <div className="cta-gradient">
          {/* Decorative circles */}
          <div className="cta-circle -top-16 -right-16 w-32 h-32"></div>
          <div className="cta-circle top-1/2 right-1/4 w-12 h-12"></div>
          <div className="cta-circle bottom-8 left-8 w-24 h-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <MedicalCrossIcon className="w-8 h-8 text-white/80" />
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h3>
              <p className="text-white/80 mb-6 max-w-xl">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={primaryButtonLink} 
                  className="bg-white text-[var(--primary)] font-medium py-2.5 px-6 rounded-md hover:bg-white/90 transition-colors shadow-lg text-center"
                >
                  {primaryButtonText}
                </Link>
                {secondaryButtonText && (
                  <Link 
                    href={secondaryButtonLink || '#'} 
                    className="bg-white/10 border border-white/30 text-white font-medium py-2.5 px-6 rounded-md hover:bg-white/20 transition-colors text-center"
                  >
                    {secondaryButtonText}
                  </Link>
                )}
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white animate-heartbeat" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 