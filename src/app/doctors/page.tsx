import Link from "next/link";
import Image from "next/image";

// Sample doctor data, would come from database in real app
const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    location: "New York, NY",
    rating: 4.8,
    experience: 12,
    image: "/images/doctor-1.jpg",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatologist",
    location: "San Francisco, CA",
    rating: 4.9,
    experience: 15,
    image: "/images/doctor-2.jpg",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialty: "Pediatrician",
    location: "Chicago, IL",
    rating: 4.7,
    experience: 8,
    image: "/images/doctor-3.jpg",
  },
  {
    id: 4,
    name: "Dr. Robert Smith",
    specialty: "Orthopedic Surgeon",
    location: "Boston, MA",
    rating: 4.6,
    experience: 20,
    image: "/images/doctor-4.jpg",
  },
  {
    id: 5,
    name: "Dr. Lisa Rodriguez",
    specialty: "Neurologist",
    location: "Miami, FL",
    rating: 4.8,
    experience: 14,
    image: "/images/doctor-5.jpg",
  },
  {
    id: 6,
    name: "Dr. David Park",
    specialty: "Family Medicine",
    location: "Seattle, WA",
    rating: 4.7,
    experience: 10,
    image: "/images/doctor-6.jpg",
  },
];

export default function DoctorsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-xl mb-4">Filters</h2>
            
            <div className="space-y-6">
              {/* Specialty Filter */}
              <div>
                <h3 className="font-semibold mb-2">Specialty</h3>
                <div className="space-y-2">
                  {["Cardiologist", "Dermatologist", "Pediatrician", "Orthopedic", "Neurologist", "Family Medicine"].map((specialty) => (
                    <div key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`specialty-${specialty}`}
                        className="mr-2"
                      />
                      <label htmlFor={`specialty-${specialty}`} className="text-sm">
                        {specialty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location Filter */}
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <input
                  type="text"
                  placeholder="Enter city or zip code"
                  className="input w-full text-sm"
                />
              </div>
              
              {/* Availability Filter */}
              <div>
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="space-y-2">
                  {["Today", "Tomorrow", "This Week", "Next Week"].map((time) => (
                    <div key={time} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`availability-${time}`}
                        className="mr-2"
                      />
                      <label htmlFor={`availability-${time}`} className="text-sm">
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold mb-2">Minimum Rating</h3>
                <select className="input w-full text-sm">
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
              
              <button className="btn-primary w-full mt-4">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Find a Doctor</h1>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sort by:</span>
              <select className="input text-sm">
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>
          
          {/* Doctor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="card overflow-hidden">
                <div className="relative h-48 bg-muted">
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
                <div className="p-4">
                  <h3 className="font-bold text-lg">{doctor.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{doctor.specialty}</p>
                  
                  <div className="flex items-center text-sm mb-4">
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
                  
                  <div className="flex justify-between items-center mb-4">
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
                      <span className="ml-1 text-sm">{doctor.rating}</span>
                    </div>
                    
                    <span className="text-sm text-muted-foreground">
                      {doctor.experience} years exp.
                    </span>
                  </div>
                  
                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="btn-primary w-full text-center"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-center mt-10">
            <div className="flex gap-1">
              <button className="px-4 py-2 rounded-md border app-border">
                Previous
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-md ${page === 1 ? "bg-primary text-primary-foreground" : "border app-border"}`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 rounded-md border app-border">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 