import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <p className="text-3xl font-semibold text-base-content mt-4">Page Not Found</p>
      <p className="text-lg text-base-content mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary mt-8">Go to Home</Link>
    </div>
  );
};

export default NotFound;