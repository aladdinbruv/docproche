import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">DocToProche</h3>
            <p className="text-muted-foreground">
              Simplifying online doctor appointment scheduling with secure, 
              convenient access to healthcare services.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For Doctors</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register?role=doctor" className="text-muted-foreground hover:text-foreground transition-colors">
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="text-muted-foreground hover:text-foreground transition-colors">
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms for Providers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[var(--border)] mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DocToProche. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 