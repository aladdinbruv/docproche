import Link from "next/link";

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-full flex justify-between">
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <div className="h-1 w-8 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <div className="h-1 w-8 bg-muted"></div>
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold">3</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Specialty</p>
                    <p className="font-medium">Cardiologist</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium">Mon, 15 July 2024 • 10:00 AM</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Appointment Type</p>
                    <p className="font-medium">In-Person</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">123 Medical Center Blvd, New York, NY 10001</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">30 minutes</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block mb-1 font-medium">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className="input w-full"
                        defaultValue="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block mb-1 font-medium">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className="input w-full"
                        defaultValue="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block mb-1 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="input w-full"
                      defaultValue="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block mb-1 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="input w-full"
                      defaultValue="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="reason" className="block mb-1 font-medium">
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      className="input w-full"
                      placeholder="Please provide a brief description of your symptoms or concerns"
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block mb-1 font-medium">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      className="input w-full"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block mb-1 font-medium">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="input w-full"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block mb-1 font-medium">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        className="input w-full"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block mb-1 font-medium">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="input w-full"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveCard"
                      className="mr-2"
                    />
                    <label htmlFor="saveCard" className="text-sm">
                      Save this card for future payments
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Appointment Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Consultation Fee</span>
                  <span>$150.00</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <span>$5.00</span>
                </div>
                
                <div className="border-t border-border pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$155.00</span>
                </div>
                
                <Link
                  href="/booking/confirmation"
                  className="btn-primary w-full text-center"
                >
                  Complete Payment
                </Link>
                
                <div className="text-xs text-muted-foreground text-center space-y-2">
                  <p>Your card will be charged $155.00</p>
                  <p>
                    By proceeding, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms
                    </Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 