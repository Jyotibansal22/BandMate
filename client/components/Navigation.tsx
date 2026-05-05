import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Mic, PenTool, Headphones, BookOpen, BarChart3, Brain, Users, User, LogOut } from "lucide-react";

const navItems = [
  { name: "Home", path: "/", icon: Brain },
  { name: "Speaking", path: "/speaking", icon: Mic },
  { name: "Writing", path: "/writing", icon: PenTool },
  { name: "Listening", path: "/listening", icon: Headphones },
  { name: "Reading", path: "/reading", icon: BookOpen },
  { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { name: "Metaverse", path: "/metaverse", icon: Users },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("user");

    if (authStatus && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      // Clear auth state if data is missing
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  // Note: handleLogout function is no longer called by any button

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-ielts-navy to-ielts-blue rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-ielts-navy to-ielts-blue bg-clip-text text-transparent">
                BandMate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-ielts-navy text-white"
                        : "text-ielts-dark-gray hover:text-foreground hover:bg-ielts-light-gray"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Profile/Auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-ielts-dark-gray hover:bg-ielts-light-gray transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>
                
                {/* --- SIGN OUT BUTTON REMOVED --- */}

              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-muted-foreground"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-border">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ielts-navy text-white"
                      : "text-ielts-dark-gray hover:text-foreground hover:bg-ielts-light-gray"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Section */}
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2 border-t border-border mt-2 pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Account</p>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-ielts-dark-gray hover:bg-ielts-light-gray"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </Link>
                  
                  {/* --- SIGN OUT BUTTON REMOVED --- */}

                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full mt-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}