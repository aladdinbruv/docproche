import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarMedicalIcon } from './MedicalIcons';

const specialties = [
  { id: 'all', label: 'All Specialties' },
  { id: 'cardiologist', label: 'Cardiologist' },
  { id: 'dermatologist', label: 'Dermatologist' },
  { id: 'neurologist', label: 'Neurologist' },
  { id: 'orthopedic', label: 'Orthopedic Surgeon' },
  { id: 'pediatrician', label: 'Pediatrician' },
  { id: 'psychiatrist', label: 'Psychiatrist' },
];

export const DoctorSearchWidget: React.FC = () => {
  const router = useRouter();
  const [specialty, setSpecialty] = useState('all');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (specialty !== 'all') {
      params.append('specialty', specialty);
    }
    
    if (location) {
      params.append('location', location);
    }
    
    if (date) {
      params.append('date', date);
    }
    
    router.push(`/doctors?${params.toString()}`);
  };

  return (
    <div className="doctor-search-widget">
      <div className="flex items-center gap-2 mb-4">
        <CalendarMedicalIcon className="text-primary w-6 h-6" />
        <h3 className="text-xl font-semibold">Find a Doctor Now</h3>
      </div>
      
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Specialty
          </label>
          <select 
            className="input w-full"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-4">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Location
          </label>
          <input 
            type="text" 
            placeholder="City or Zip Code" 
            className="input w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        <div className="md:col-span-3">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Date
          </label>
          <input 
            type="date" 
            className="input w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="md:col-span-1">
          <button 
            type="submit" 
            className="btn-primary w-full h-[42px] flex items-center justify-center"
            aria-label="Search for doctors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}; 