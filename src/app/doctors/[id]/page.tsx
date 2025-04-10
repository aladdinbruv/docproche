import Link from "next/link";
import Image from "next/image";

// Sample doctor data, would come from database in real app
const doctorData = {
  id: 1,
  name: "Dr. Sarah Johnson",
  specialty: "Cardiologist",
  location: "New York, NY",
  address: "123 Medical Center Blvd, New York, NY 10001",
  phone: "(212) 555-1234",
  email: "dr.johnson@doctoproche.com",
  rating: 4.8,
  experience: 12,
  bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating various heart conditions. She specializes in preventive cardiology, heart failure management, and cardiac rehabilitation. Dr. Johnson completed her medical degree at Harvard Medical School and her residency at Massachusetts General Hospital.",
  education: [
    {
      degree: "MD",
      institution: "Harvard Medical School",
      year: "2005-2009"
    },
    {
      degree: "Residency in Internal Medicine",
      institution: "Massachusetts General Hospital",
      year: "2009-2012"
    },
    {
      degree: "Fellowship in Cardiology",
      institution: "Columbia University Medical Center",
      year: "2012-2015"
    }
  ],
  image: "/images/doctor-1.jpg",
  available_days: ["Monday", "Tuesday", "Thursday", "Friday"],
  available_times: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
  consultation_fee: 150,
  languages: ["English", "Spanish"],
  reviews: [
    {
      id: 1,
      patient: "John D.",
      rating: 5,
      date: "2023-07-15",
      comment: "Dr. Johnson was incredibly thorough and took the time to explain everything clearly. Highly recommend!"
    },
    {
      id: 2,
      patient: "Maria G.",
      rating: 4,
      date: "2023-06-20",
      comment: "Very professional and knowledgeable. The wait time was a bit longer than expected."
    },
    {
      id: 3,
      patient: "Robert T.",
      rating: 5,
      date: "2023-05-05",
      comment: "Dr. Johnson's expertise in cardiology is outstanding. She provided excellent care and follow-up."
    }
  ]
};

export default function DoctorProfile({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the doctor data based on the ID
  const doctor = doctorData;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/doctors" className="text-primary hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Doctors
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Profile */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-secondary flex-shrink-0 mx-auto md:mx-0">
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{doctor.name}</h1>
                <p className="text-muted-foreground mb-2">{doctor.specialty}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary mr-1"
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
                    {doctor.location}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? "fill-current" : "stroke-current fill-none"}`}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm">{doctor.rating} ({doctor.reviews.length} reviews)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-primary mr-1"
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
                    <span className="text-sm">{doctor.experience} years experience</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {doctor.languages.map((language) => (
                    <span key={language} className="bg-secondary px-3 py-1 rounded-full text-xs">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t app-border pt-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground mb-6">{doctor.bio}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium w-20">Address:</span>
                      <span className="text-muted-foreground">{doctor.address}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="font-medium w-20">Phone:</span>
                      <span className="text-muted-foreground">{doctor.phone}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="font-medium w-20">Email:</span>
                      <span className="text-muted-foreground">{doctor.email}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Availability</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium w-20">Days:</span>
                      <span className="text-muted-foreground">{doctor.available_days.join(", ")}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-20">Hours:</span>
                      <span className="text-muted-foreground">{doctor.available_times[0]} - {doctor.available_times[doctor.available_times.length - 1]}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="font-medium w-20">Fee:</span>
                      <span className="text-muted-foreground">${doctor.consultation_fee} per session</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Education & Training</h3>
                <ul className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <li key={index} className="flex flex-col md:flex-row md:items-center">
                      <span className="font-medium md:w-1/4">{edu.year}</span>
                      <div className="md:w-3/4">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Patient Reviews</h3>
                <div className="space-y-4">
                  {doctor.reviews.map((review) => (
                    <div key={review.id} className="border-b app-border pb-4 last:border-0">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{review.patient}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : "stroke-current fill-none"}`}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Appointment Booking */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Book an Appointment</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Select Date</h3>
                <div className="grid grid-cols-4 gap-2">
                  {["Mon", "Tue", "Wed", "Thu"].map((day, i) => (
                    <button
                      key={day}
                      className={`p-2 text-center rounded-md border ${i === 0 ? "border-primary bg-primary/10" : "app-border"}`}
                    >
                      <div className="text-xs">{day}</div>
                      <div className="font-medium">{15 + i}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Select Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {doctor.available_times.slice(0, 6).map((time, i) => (
                    <button
                      key={time}
                      className={`p-2 text-center rounded-md border text-sm ${i === 1 ? "border-primary bg-primary/10" : "app-border"}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Appointment Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 flex flex-col items-center justify-center rounded-md border border-primary bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-primary mb-1"
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
                    <span className="text-sm font-medium">In-Person</span>
                  </button>
                  
                  <button className="p-3 flex flex-col items-center justify-center rounded-md border app-border">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mb-1"
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
                    <span className="text-sm font-medium">Video Call</span>
                  </button>
                </div>
              </div>
              
              <div className="border-t app-border pt-4">
                <div className="flex justify-between mb-2">
                  <span>Consultation Fee</span>
                  <span className="font-semibold">${doctor.consultation_fee}</span>
                </div>
                
                <Link
                  href={`/booking?doctor=${doctor.id}`}
                  className="btn-primary w-full mt-4 text-center"
                >
                  Confirm Booking
                </Link>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By booking this appointment you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 