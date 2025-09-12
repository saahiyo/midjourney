import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import Header from "./Header";

export default function Layout() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 text-sm tracking-wide animate-pulse">
            Loading, please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-color min-h-screen p-4 md:p-8 text-white">
      <Header user={user} isAdmin={isAdmin} />
      <Outlet />
    </div>
  );
}
