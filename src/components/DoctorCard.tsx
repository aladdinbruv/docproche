'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DoctorIcon } from './MedicalIcons';

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  available: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  specialty,
  image,
  location,
  rating,
  reviewCount,
  price,
  available,
}) => {
  return (
    <div className="doctor-card-enhanced group">
      {available && (
        <div className="absolute top-4 right-4 z-10">
          <span className="badge-pill badge-success">
            Available Today
          </span>
        </div>
      )}
      
      <div className="doctor-image-container">
        <div className="doctor-image-overlay"></div>
        <Image 
          src={image} 
          alt={name}
          width={400}
          height={300}
          className="doctor-image"
        />
        <div className="doctor-rating">
          <div className="flex items-center space-x-1 text-amber-300 mb-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-white/80">({reviewCount})</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-semibold text-neutral-800">{name}</h3>
        <p className="text-[var(--primary)] font-medium flex items-center gap-1.5">
          <DoctorIcon className="w-4 h-4" />
          {specialty}
        </p>
        
        <div className="flex items-center mt-4 text-neutral-600 text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>{location}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-neutral-500 text-sm">Consultation Fee</span>
            <p className="font-bold text-neutral-900">${price}</p>
          </div>
          {!available && (
            <div className="badge-pill badge-destructive">
              Unavailable
            </div>
          )}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href={`/doctors/${id}`} className="btn-outline py-2 text-sm text-center">
            View Profile
          </Link>
          <Link 
            href={available ? `/booking/appointment?doctorId=${id}` : '#'} 
            className={`py-2 text-sm text-center ${available ? 'btn-primary' : 'btn-secondary opacity-70 cursor-not-allowed'}`}
            {...(!available && { onClick: (e) => e.preventDefault() })}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}; 