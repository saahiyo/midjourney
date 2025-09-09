import React from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDisplayName } from "../utils/admin";
import UserProfile from "./UserProfile"; // Import UserProfile component

export default function Header({ user, isAdmin, onNav }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (onNav) {
      onNav(path);
    } else {
      navigate(path);
    }
  };

  return (
    <header className="max-w-6xl border-b border-neutral-800 mb-8 mx-auto tracking-wide pb-2 px-2 sm:px-0">
      <div className="flex sm:flex-row sm:items-center justify-between sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <i className="ri-bard-fill text-2xl md:text-3xl text-emerald-500"></i>
          <div className="flex items-center gap-2">
            <a href="/">
              <h1 className="md:text-4xl text-2xl text-emerald-500 font-semibold tracking-wider">
                MidJourney
              </h1>
            </a>
            {isAdmin && (
              <span className="px-2 py-1 text-xs bg-purple-900 text-purple-300 rounded-full font-medium">
                {getAdminDisplayName()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button
                onClick={() => handleNavigate("/signup")}
                className="px-4 py-2 rounded-full bg-emerald-950 text-emerald-100 text-sm shadow-sm border cursor-pointer border-emerald-800 flex items-center"
              >
                <span className="block md:hidden">signup</span>
                <span className="hidden md:inline">Sign Up</span>
                <i className="ri-user-add-line ml-2"></i>
              </button>
              <button
                onClick={() => handleNavigate("/login")}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm shadow-sm border cursor-pointer border-emerald-700 flex items-center"
              >
                <span className="block md:hidden">login</span>
                <span className="hidden md:inline">Sign In</span>
                <i className="ri-login-box-line ml-2"></i>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate("/generations")}
                className="px-4 py-2 rounded-full bg-emerald-950 text-emerald-100 text-sm shadow-sm border cursor-pointer border-emerald-800 flex items-center"
              >
                <span className="block md:hidden">gallery</span>
                <span className="hidden md:inline">View Generations</span>
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
              <UserProfile />
            </>
          )}
        </div>
      </div>
      <p className="text-sm md:text-base text-neutral-400 mt-2 tracking-tighter">
        Generate stunning <span className="text-emerald-500/70 font-semibold">images</span> with a sleek and modern interface.
      </p>
    </header>
  );
}