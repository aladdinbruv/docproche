import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

// Lazily load heavy components
export const LazyHealthRecordsList = dynamic(
  () => import('./HealthRecordsList').then(mod => mod.default || mod),
  { 
    loading: () => <LoadingFallback />,
    ssr: false // Don't render on server to reduce initial bundle size
  }
);

export const LazyPrescriptionForm = dynamic(
  () => import('./PrescriptionForm').then(mod => mod.default || mod),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
);

export const LazyAppointmentsList = dynamic(
  () => import('./AppointmentsList').then(mod => mod.default || mod),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
);

export const LazyDoctorCard = dynamic(
  () => import('./DoctorCard').then(mod => mod.default || mod),
  {
    loading: () => <LoadingFallback />,
    ssr: false
  }
);

// Example usage with Suspense:
// <Suspense fallback={<LoadingFallback />}>
//   <LazyHealthRecordsList records={records} />
// </Suspense> 