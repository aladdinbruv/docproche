"use client";

import React, { useState, useEffect } from 'react';
import { 
  DoctorCard, 
  DoctorSearchWidget, 
  CtaSection, 
  HeartbeatLoader,
  MedicalSpinner,
  DoctorCardSkeleton,
  AppointmentTimeline,
  CircularProgress,
  PulseLoader,
  DoctorIcon,
  StethoscopeIcon,
  HeartbeatIcon
} from '@/components';

export default function DoctorsDemo() {
  const [loading, setLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock doctor data
  const doctors = [
    {
      id: "d1",
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      image: "https://randomuser.me/api/portraits/women/76.jpg",
      location: "New York Medical Center",
      rating: 4.8,
      reviewCount: 124,
      price: 150,
      available: true
    },
    {
      id: "d2",
      name: "Dr. Michael Williams",
      specialty: "Dermatologist",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      location: "Manhattan Skin Clinic",
      rating: 4.6,
      reviewCount: 98,
      price: 130,
      available: true
    },
    {
      id: "d3",
      name: "Dr. Emily Roberts",
      specialty: "Pediatrician",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      location: "Children's Medical Center",
      rating: 4.9,
      reviewCount: 156,
      price: 120,
      available: false
    }
  ];
  
  // Mock appointments data
  const appointments = [
    {
      id: 'a1',
      date: 'April 15, 2023',
      time: '10:30 AM',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      description: 'Regular checkup and blood pressure monitoring',
      status: 'completed'
    },
    {
      id: 'a2',
      date: 'May 20, 2023',
      time: '2:00 PM',
      doctorName: 'Dr. Michael Williams',
      specialty: 'Dermatologist',
      description: 'Skin examination and allergy test',
      status: 'cancelled'
    },
    {
      id: 'a3',
      date: 'June 8, 2023',
      time: '11:15 AM',
      doctorName: 'Dr. Emily Roberts',
      specialty: 'Pediatrician',
      description: 'Annual wellness checkup',
      status: 'upcoming'
    }
  ];

  return (
    <div className="bg-[var(--background)] py-8">
      <div className="container-tight">
        <h1 className="text-3xl font-bold mb-3 text-center">Doctor Appointment Components</h1>
        <p className="text-center text-muted-foreground mb-10">Visual components for the DocToProche medical appointment system</p>
        
        {/* Search Widget */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Doctor Search</h2>
          <DoctorSearchWidget />
        </section>
        
        {/* Doctor Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Doctor Cards</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <DoctorCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {doctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id}
                  id={doctor.id}
                  name={doctor.name}
                  specialty={doctor.specialty}
                  image={doctor.image}
                  location={doctor.location}
                  rating={doctor.rating}
                  reviewCount={doctor.reviewCount}
                  price={doctor.price}
                  available={doctor.available}
                />
              ))}
            </div>
          )}
        </section>
        
        {/* Appointment Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Appointment Timeline</h2>
          <AppointmentTimeline appointments={appointments} />
        </section>
        
        {/* Health Stats and Badges */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Health Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <CircularProgress value={75} maxValue={100} title="Heart Health" />
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress value={80} maxValue={100} title="Blood Pressure" color="accent" />
            </div>
            <div className="flex flex-col items-center">
              <CircularProgress value={92} maxValue={100} title="Overall Health" color="success" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="badge-pill badge-primary">Primary</span>
            <span className="badge-pill badge-accent">Accent</span>
            <span className="badge-pill badge-success">Success</span>
            <span className="badge-pill badge-warning">Warning</span>
            <span className="badge-pill badge-destructive">Destructive</span>
            <span className="badge-pill badge-info">Info</span>
          </div>
        </section>
        
        {/* Loading States */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-4">Heartbeat Loader</h3>
              <HeartbeatLoader />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-4">Medical Spinner</h3>
              <MedicalSpinner />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-4">Pulse Loader</h3>
              <PulseLoader />
            </div>
          </div>
        </section>
        
        {/* Medical Icons */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Medical Icons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-[var(--primary)]/10 rounded-xl">
                <DoctorIcon className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <p className="mt-2 text-center">Doctor</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-[var(--primary)]/10 rounded-xl">
                <StethoscopeIcon className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <p className="mt-2 text-center">Stethoscope</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-[var(--primary)]/10 rounded-xl">
                <HeartbeatIcon className="w-12 h-12 text-[var(--primary)]" />
              </div>
              <p className="mt-2 text-center">Heartbeat</p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <CtaSection 
          title="Ready to book your appointment?"
          description="Schedule a consultation with one of our top specialists today and take the first step towards better health."
          primaryButtonText="Book Now"
          primaryButtonLink="/booking"
        />
      </div>
    </div>
  );
} 