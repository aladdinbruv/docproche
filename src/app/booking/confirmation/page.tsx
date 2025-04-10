import Link from "next/link";

export default function BookingConfirmationPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto text-center">
        <div className="card p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
          
          <p className="text-muted-foreground">
            Your appointment with Dr. Sarah Johnson has been successfully booked. 
            You will receive a confirmation email with all the details shortly.
          </p>
          
          <div className="py-4 border-y border-border">
            <div className="grid grid-cols-2 gap-y-4">
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Appointment ID</p>
                <p className="font-medium">APT-54321</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">Mon, 15 July 2024 • 10:00 AM</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">Dr. Sarah Johnson</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Appointment Type</p>
                <p className="font-medium">In-Person</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">123 Medical Center Blvd</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="font-medium">$155.00</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please arrive 15 minutes before your appointment time.
              Don't forget to bring your ID and insurance card.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center">
              <Link 
                href="/dashboard/appointments" 
                className="btn-primary"
              >
                View Appointments
              </Link>
              <Link 
                href="/" 
                className="btn-secondary"
              >
                Back to Home
              </Link>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Need to reschedule?{" "}
              <Link href="/dashboard/appointments" className="text-primary hover:underline">
                Manage your appointments
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 