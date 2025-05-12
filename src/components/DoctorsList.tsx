import { memo, useMemo } from 'react';
import { LazyDoctorCard } from './LazyComponents';
import { User } from '@/types/supabase';

interface DoctorsListProps {
  doctors: User[];
  searchQuery?: string;
  specialtyFilter?: string;
}

// Memoized component for individual doctor card
const MemoizedDoctorCard = memo(LazyDoctorCard);

// Memoized filtered doctors component
function DoctorsList({ doctors, searchQuery = '', specialtyFilter = '' }: DoctorsListProps) {
  // Calculate and memoize filtered doctors to prevent unnecessary re-renders
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = searchQuery === '' || 
        doctor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = specialtyFilter === '' || 
        doctor.specialty === specialtyFilter;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, specialtyFilter]);

  // Memoize the sort function to prevent unnecessary calculations
  const sortedDoctors = useMemo(() => {
    return [...filteredDoctors].sort((a, b) => {
      // Sort by rating if available, otherwise by name
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      return a.full_name.localeCompare(b.full_name);
    });
  }, [filteredDoctors]);

  if (sortedDoctors.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-800 mb-2">No doctors found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search criteria or browse all doctors.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedDoctors.map(doctor => (
        <MemoizedDoctorCard 
          key={doctor.id} 
          doctor={doctor} 
        />
      ))}
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export default memo(DoctorsList); 