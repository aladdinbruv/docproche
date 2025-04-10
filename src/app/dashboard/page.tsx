import Link from "next/link";

// Sample data for the dashboard
const upcomingAppointments = [
  {
    id: "apt-123",
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "Mon, 15 July 2024",
    time: "10:00 AM",
    type: "In-Person",
  },
  {
    id: "apt-124",
    doctor: "Dr. Michael Chen",
    specialty: "Dermatologist",
    date: "Thu, 25 July 2024",
    time: "2:30 PM",
    type: "Video Call",
  },
];

const recentPrescriptions = [
  {
    id: "prs-456",
    name: "Lisinopril 10mg",
    doctor: "Dr. Sarah Johnson",
    date: "10 July 2024",
    instructions: "Take once daily with food",
  },
  {
    id: "prs-457",
    name: "Metformin 500mg",
    doctor: "Dr. Robert Smith",
    date: "5 July 2024",
    instructions: "Take twice daily with meals",
  },
];

const unreadMessages = [
  {
    id: "msg-789",
    from: "Dr. Sarah Johnson",
    message: "Hi John, I wanted to follow up on your recent appointment...",
    date: "12 July 2024",
    time: "2:45 PM",
  },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, John Doe</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Upcoming Appointments</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{upcomingAppointments.length}</span>
            <span className="text-muted-foreground">scheduled</span>
          </div>
          <Link 
            href="/dashboard/appointments" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View all appointments →
          </Link>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Active Prescriptions</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{recentPrescriptions.length}</span>
            <span className="text-muted-foreground">active</span>
          </div>
          <Link 
            href="/dashboard/prescriptions" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            Manage prescriptions →
          </Link>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Unread Messages</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{unreadMessages.length}</span>
            <span className="text-muted-foreground">unread</span>
          </div>
          <Link 
            href="/dashboard/messages" 
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View messages →
          </Link>
        </div>
      </div>
      
      {/* Upcoming appointments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <Link 
            href="/dashboard/appointments" 
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="card p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.doctor}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-muted-foreground mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {appointment.date}
                  </div>
                  
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-muted-foreground mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {appointment.time}
                  </div>
                  
                  <div className="flex items-center">
                    {appointment.type === "Video Call" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                    {appointment.type}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {appointment.type === "Video Call" && (
                  <Link
                    href={`/dashboard/appointments/${appointment.id}/join`}
                    className="btn-primary py-2 px-4"
                  >
                    Join Call
                  </Link>
                )}
                <Link
                  href={`/dashboard/appointments/${appointment.id}`}
                  className="btn-secondary py-2 px-4"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
          
          {upcomingAppointments.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-muted-foreground">You have no upcoming appointments.</p>
              <Link 
                href="/doctors" 
                className="btn-primary inline-block mt-4"
              >
                Book an Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Secondary content section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent prescriptions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Prescriptions</h2>
            <Link 
              href="/dashboard/prescriptions" 
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => (
              <div key={prescription.id} className="card p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{prescription.name}</h3>
                  <span className="text-sm text-muted-foreground">{prescription.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Prescribed by {prescription.doctor}</p>
                <p className="text-sm italic">{prescription.instructions}</p>
                <div className="mt-3 flex justify-end">
                  <Link 
                    href={`/dashboard/prescriptions/${prescription.id}`} 
                    className="text-sm text-primary hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
            
            {recentPrescriptions.length === 0 && (
              <div className="card p-6 text-center">
                <p className="text-muted-foreground">You have no recent prescriptions.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent messages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Unread Messages</h2>
            <Link 
              href="/dashboard/messages" 
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {unreadMessages.map((message) => (
              <div key={message.id} className="card p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{message.from}</h3>
                  <span className="text-xs text-muted-foreground">{message.date}, {message.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
                <div className="mt-3 flex justify-end">
                  <Link 
                    href={`/dashboard/messages/${message.id}`} 
                    className="text-sm text-primary hover:underline"
                  >
                    View conversation
                  </Link>
                </div>
              </div>
            ))}
            
            {unreadMessages.length === 0 && (
              <div className="card p-6 text-center">
                <p className="text-muted-foreground">You have no unread messages.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 