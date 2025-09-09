import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import Header from "./Header";

export default function Layout() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center ">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 min-h-screen p-4 md:p-8 text-white">
      <Header user={user} isAdmin={isAdmin} />
      <Outlet />
    </div>
  );
}
