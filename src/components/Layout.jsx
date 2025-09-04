import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="bg-neutral-950 min-h-screen p-4 md:p-8 text-white">
      <header className="max-w-6xl border-b border-neutral-800 mb-8 mx-auto tracking-wide pb-2 px-2 sm:px-0">
        <div className="flex sm:flex-row sm:items-center justify-between sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <i className="ri-bard-fill text-2xl md:text-3xl text-emerald-500"></i>
            <a href="/">
              <h1 className="md:text-4xl text-2xl text-emerald-500 font-semibold tracking-wider">
                MidJourney
              </h1>
            </a>
          </div>
          <div className="">
            <button
              onClick={() => navigate("/generations")}
              className="px-4 py-2 rounded-full bg-emerald-950 text-emerald-100 text-sm shadow-sm border cursor-pointer border-emerald-800 flex items-center"
            >
              <span className="block md:hidden">gallery</span>
              <span className="hidden md:inline">View Generations</span>
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base text-neutral-400 mt-2 tracking-tight text-center sm:text-left">
          Generate stunning images with a sleek and modern interface.
        </p>
      </header>

      <Outlet />
    </div>
  );
}
