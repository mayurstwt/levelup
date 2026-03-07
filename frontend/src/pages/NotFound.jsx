import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
      <div className="border-4 border-gray-900 rounded p-12 max-w-md w-full shadow-[8px_8px_0_0_#111]">
        <div className="text-8xl font-black text-blue-600 mb-2">404</div>
        <h1 className="text-3xl font-black text-gray-900 uppercase mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded text-sm uppercase tracking-wide transition-colors no-underline"
          >
            Go Home
          </Link>
          <Link
            to="/jobs"
            className="border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-black px-6 py-3 rounded text-sm uppercase tracking-wide transition-colors no-underline"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs">
        If you think this is a mistake, <Link to="/jobs" className="text-blue-600 hover:underline">head back to the marketplace</Link>.
      </p>
    </div>
  );
};

export default NotFound;
