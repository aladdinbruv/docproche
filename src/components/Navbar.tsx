"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-md transition-colors font-medium ${
        isActive 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-secondary text-foreground/80 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
};

export function Navbar() {
  return (
    <header className="border-b app-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-1.5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-6 w-6 text-primary"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
            <path d="m18 15-2-2" />
            <path d="m15 18-2-2" />
          </svg>
          <span>Doc<span className="text-primary">ToProche</span></span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/doctors">Find Doctors</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/auth/login" 
            className="btn-ghost text-foreground/90"
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            className="btn-primary"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}