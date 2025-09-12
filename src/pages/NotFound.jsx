import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-emerald-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
          <p className="text-gray-400">
            Oops! The page you're looking for doesn't exist or you've mistyped the URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Home
          </Link>
          <Link 
            to="/generations" 
            className="inline-block w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            View Generations
          </Link>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <p className="text-sm text-gray-500">
            Double-check the URL or try one of the links above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;