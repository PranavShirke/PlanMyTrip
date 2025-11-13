import { Link } from 'react-router-dom';
import { MapPin, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, SignInButton, SignOutButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-sky-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-coral-500 bg-clip-text text-transparent">
                PlanMyTrip
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-sky-500 transition-colors">
              Home
            </Link>
          
            <Link to="/about" className="text-slate-600 hover:text-sky-500 transition-colors">
              About
            </Link>
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-600">
                  {user?.firstName || user?.username}
                </span>
                <SignOutButton>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-sky-500 text-sky-500 hover:bg-sky-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-sky-500 text-sky-500 hover:bg-sky-50"
                >
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </SignInButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-sky-500 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-slate-600 hover:text-sky-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/planner"
              className="block px-3 py-2 text-slate-600 hover:text-sky-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Trip Planner
            </Link>
            <Link
              to="/destinations"
              className="block px-3 py-2 text-slate-600 hover:text-sky-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Destinations
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-slate-600 hover:text-sky-500 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {isSignedIn ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-slate-600">
                  {user?.firstName || user?.username}
                </div>
                <SignOutButton>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 border-sky-500 text-sky-500 hover:bg-sky-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 border-sky-500 text-sky-500 hover:bg-sky-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 