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
      className={`px-4 py-2 rounded-md transition-colors ${
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-secondary"
      }`}
    >
      {children}
    </Link>
  );
};

export function Navbar() {
  return (
    <header className="border-b border-[var(--border)] sticky top-0 z-50 bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <span className="text-primary">Doc</span>
          <span>ToProche</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/doctors">Find Doctors</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
        
        <div className="flex items-center gap-2">
          <Link 
            href="/auth/login" 
            className="btn-secondary"
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