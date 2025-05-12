# DoctoProche - Modern Medical Appointment Booking Platform 🏥

DoctoProche is a comprehensive, secure, and user-friendly Next.js application that revolutionizes the healthcare appointment booking experience. Our platform connects patients with qualified healthcare professionals, streamlines the booking process, and secures payments - all in one place!

## ✨ Key Features

- **🔐 Secure Authentication System**: Role-based registration and login for patients and doctors
- **👨‍⚕️ Doctor Discovery**: Search doctors by specialty, location, ratings, and availability
- **📅 Smart Appointment Scheduling**: Interactive calendar for selecting available time slots
- **🏠 Versatile Appointment Options**: Book in-person visits or virtual consultations
- **💳 Stripe Payment Integration**: Secure payment processing for appointment bookings
- **📱 Responsive Design**: Seamless experience across desktop and mobile devices
- **📋 Health Records Management**: Store and access your medical history securely
- **📊 Doctor Dashboard**: Complete overview of appointments, patient records, and earnings
- **📱 Patient Dashboard**: Track upcoming appointments and medical history
- **🔔 Appointment Reminders**: Get notified about upcoming appointments
- **📝 Symptom Recording**: Document your symptoms before appointments
- **📊 Health Statistics**: Visual representation of your health records
- **⚡ Performance Optimizations**: Multi-level caching for fast page loads and responsive UI
- **💊 Prescription Management**: Create, update, and track medical prescriptions

## 🛠️ Tech Stack

### 🖼️ Frontend
- **Framework**: Next.js 14 with TypeScript for type safety and better developer experience
- **Styling**: Tailwind CSS with custom UI components for a modern look and feel
- **Animations**: Framer Motion for smooth transitions and engaging user interactions
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **State Management**: React Context API for global state management
- **Data Fetching**: React Query for efficient data fetching with automatic caching

### ⚙️ Backend
- **Supabase Auth**: Secure authentication with JWT tokens and row-level security
- **Supabase Database**: PostgreSQL database with robust data models and relationships
- **API Routes**: Next.js API routes for server-side operations and business logic
- **Middleware**: Custom middleware for route protection and role-based access
- **Caching**: Multi-level caching strategy with Service Workers and local storage

### 💸 Payment Processing
- **Stripe Integration**: Secure payment collection with Stripe Checkout
- **Webhook Handling**: Automated payment status updates via Stripe webhooks
- **Transaction Records**: Comprehensive payment history and receipt generation

## 📚 Database Schema

Our application uses a carefully designed database schema:

- **users**: Core user profiles with authentication details and role information
- **doctor_profiles**: Comprehensive doctor information including specialties, education, and experience
- **appointments**: Complete appointment details with status tracking and payment information
- **health_records**: Secure storage of patient medical history and test results
- **payments**: Detailed payment transaction records with status tracking
- **availability**: Doctor availability windows for smart scheduling
- **specialties**: Medical specialties catalog for accurate doctor categorization
- **prescriptions**: Complete prescription records with medications and instructions

## ⚡ Performance Optimizations

DoctoProche implements a comprehensive caching strategy to ensure optimal performance:

### React Query Caching
- **Appointments**: Cached for 5 minutes with background revalidation
- **Prescriptions**: Optimized queries with automatic invalidation on updates
- **Doctor Listings**: Efficiently cached with pagination support

### Component Optimizations
- **Memoization**: Heavy components use React.memo to prevent unnecessary re-renders
- **Code Splitting**: Dynamic imports with Next.js for optimal bundle sizes
- **Lazy Loading**: Components loaded only when needed for faster initial page load

### Service Worker Cache
- **Static Assets**: Images, CSS, fonts cached at the network level
- **API Responses**: Non-sensitive API responses cached with appropriate TTL
- **Offline Support**: Basic offline capabilities for core functionality

### Local Storage Cache
- **Reference Data**: Specialties, locations, and other static data
- **User Preferences**: Settings and preferences stored locally
- **Recent Searches**: Quick access to recent doctor searches

## 🔄 Implementation Details

### React Query Setup
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

### Service Worker Registration
```typescript
// In layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}, []);
```

### Component Memoization
```typescript
// Example of memoized component
const MemoizedDoctorCard = memo(LazyDoctorCard);

// With useMemo for expensive calculations
const sortedDoctors = useMemo(() => {
  return [...filteredDoctors].sort((a, b) => {
    if (a.rating && b.rating) {
      return b.rating - a.rating;
    }
    return a.full_name.localeCompare(b.full_name);
  });
}, [filteredDoctors]);
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Supabase account
- Stripe account for payment processing

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/doctoproche.git
   cd doctoproche
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌟 Use Cases

- **For Patients**: Find the right doctor, book appointments with ease, manage health records, and make secure payments all in one place
- **For Doctors**: Manage your practice online, set your availability, view patient information before appointments, and track your earnings
- **For Clinics**: Integrate your entire staff, manage multiple doctors, and streamline your booking process

## 🗺️ Roadmap

- [ ] 🎥 Integrated video conferencing for virtual appointments
- [ ] 📈 Advanced analytics dashboard for doctors
- [ ] 🌐 Multi-language support for international users
- [x] 💊 Prescription management system
- [ ] 🏆 Loyalty program for returning patients
- [ ] 🧠 AI-powered doctor recommendations (future)
- [x] ⚡ Performance optimization and caching system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for discussion.

## 📧 Contact

For questions, feedback, or support, please reach out to us at contact@doctoproche.com.

## ⚙️ Supabase Configuration

This project uses Supabase for authentication, database, and real-time functionality. Follow these steps to connect it to your Supabase project:

### 1. Configure Environment Variables

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `doctoproche` (Project ID: `cilrbqwwqaglszdnbshd`)
3. Navigate to `Project Settings > API`
4. Copy the `Project URL` and `anon` key
5. Update your `.env.local` file with these values:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Verify Connection

1. Start your development server:
   ```
   npm run dev
   ```
2. Navigate to the Supabase test page:
   ```
   http://localhost:3000/supabase-test
   ```
3. The page will show whether your connection is working correctly

### 3. Database Schema

The database schema is defined in the SQL migration file at `supabase/migrations/20250410_initial_schema.sql`.

You can apply this schema using the Supabase dashboard:

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to `SQL Editor`
4. Create a new query
5. Copy the contents from `supabase/migrations/20250410_initial_schema.sql`
6. Run the query
