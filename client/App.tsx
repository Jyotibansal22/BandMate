import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Speaking from "./pages/Speaking";
import Writing from "./pages/Writing";
import Listening from "./pages/Listening";
import Reading from "./pages/Reading";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Metaverse from "./pages/Metaverse";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  // This check is for the demo. A real app would use context.
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* --- Protected Routes --- */}
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/speaking"
              element={isAuthenticated ? <Speaking /> : <Navigate to="/login" />}
            />
            <Route
              path="/writing"
              element={isAuthenticated ? <Writing /> : <Navigate to="/login" />}
            />
            <Route
              path="/reading"
              element={isAuthenticated ? <Reading /> : <Navigate to="/login" />}
            />
            <Route
              path="/listening"
              element={isAuthenticated ? <Listening /> : <Navigate to="/login" />}
            />
            <Route
              path="/metaverse"
              element={isAuthenticated ? <Metaverse /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
             <Route
              path="/features"
              element={isAuthenticated ? <Features /> : <Navigate to="/login" />}
            />

            {/* Catch-all Not Found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);