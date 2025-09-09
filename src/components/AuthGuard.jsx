import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // If user is logged in, redirect them to the main page
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user is logged in, don't render the children (redirect will happen)
  if (user) {
    return null;
  }

  // If user is not logged in, render the children (login/signup form)
  return children;
}