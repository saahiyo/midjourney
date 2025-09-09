import React from 'react';
import SignupForm from '../components/SignupForm';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <SignupForm onSignupSuccess={handleSignupSuccess} />
    </div>
  );
}