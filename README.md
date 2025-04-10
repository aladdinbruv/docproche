# DocToProche - Online Doctor Appointment Scheduling

DocToProche is a secure, performant, and scalable Next.js full-stack application that simplifies online doctor appointment scheduling, offering a comprehensive solution for both doctors and patients.

## 🔑 Key Features

- **Role-based Registration & Login**: Separate authentication flows for doctors and patients.
- **Searchable Doctor Listings**: Find doctors by specialty, location, availability, and ratings.
- **Flexible Appointments**: Schedule in-person or video appointments.
- **Secure Payment Processing**: Integrated with Stripe for hassle-free payments.
- **Prescription Management**: Secure access to prescriptions for patients.
- **Doctor Dashboard**: Complete management of appointments, communications, and revenue tracking.

## 🔧 Tech Stack

### 🖼️ Frontend
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS, custom UI components
- **Animations**: Framer Motion
- **Form Handling**: Formik + Yup

### 🔐 Authentication & Backend
- **Supabase Auth**: Email/password authentication with row-level security
- **Supabase Database**: PostgreSQL database for data storage
- **API Routes**: Custom endpoints for business logic

### 💸 Payment Integration
- **Stripe**: Secure payment processing with webhook integration

## 📚 Database Schema

The application uses the following core data models:

- **users**: Core user information
- **doctor_profiles**: Extended information for doctors
- **appointments**: Appointment details and status
- **prescriptions**: Secure prescription management
- **messages**: Doctor-patient communications
- **payments**: Payment transaction records

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

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
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Roadmap

- [ ] Integration with real-time video conferencing
- [ ] Mobile app using React Native
- [ ] Enhanced analytics for doctors
- [ ] Health record integration
- [ ] Multi-language support

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please reach out to us at contact@doctoproche.com.
