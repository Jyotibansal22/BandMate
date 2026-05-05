import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  BookOpen,
  Loader2, // <-- Added Loader2
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Frontend validation (basic)
    if (!email || !password || (isSignUp && !name)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 2. Determine endpoint and request body
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only send name if signing up
        body: JSON.stringify({ name, email, password }), 
      });

      const result = await response.json();
      
      // 3. Handle API failure
      if (!result.success) {
        throw new Error(result.error || (isSignUp ? "Registration failed" : "Login failed"));
      }

      // 4. Handle API success: Store real authentication data
      const { user, token } = result.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", token); // Store the JWT token for future requests (not yet implemented in useApi, but good practice)
      

      toast({
        title: "Success",
        description: isSignUp ? "Account created successfully!" : "Logged in successfully!",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ielts-blue via-ielts-teal/5 to-ielts-green/10 flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ielts-blue/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-ielts-teal/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-ielts-blue via-ielts-teal to-ielts-green rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-ielts-orange to-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ielts-blue via-ielts-teal to-ielts-green bg-clip-text text-transparent mb-2">
            IELTS Mastery
          </h1>
          <p className="text-muted-foreground">
            Master English with AI-powered IELTS preparation
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Sign up to start your IELTS journey"
                : "Sign in to your IELTS account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-1"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-ielts-blue hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-ielts-blue to-ielts-teal hover:from-ielts-blue/90 hover:to-ielts-teal/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="inline-block h-4 w-4 animate-spin text-white mr-2"></Loader2>
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-6"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              {isSignUp ? "Sign In Instead" : "Create New Account"}
            </Button>
          </CardContent>
        </Card>

        {/* --- DIV REMOVED --- */}
        
      </div>
    </div>
  );
}