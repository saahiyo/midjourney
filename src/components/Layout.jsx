import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="bg-neutral-950 min-h-screen p-8 text-white">
      <header className="max-w-6xl border-b border-neutral-800 mb-8 mx-auto tracking-wide pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="ri-bard-fill text-2xl md:text-3xl text-emerald-500"></i>
            <h1 className="md:text-4xl text-3xl text-emerald-500 font-semibold tracking-wider">MidJourney</h1>
          </div>
          <div>
            <button
              onClick={() => navigate('/generations')}
              className="px-4 py-2 rounded-full bg-emerald-950 text-emerald-100 text-sm shadow-sm border border-emerald-600"
            >
              View Generations
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>
        </div>
        <p className="text-sm md:text-base text-neutral-400 mt-2 tracking-tight">
          Generate stunning images with a sleek and modern interface.
        </p>
      </header>

      <Outlet />
    </div>
  )
}
