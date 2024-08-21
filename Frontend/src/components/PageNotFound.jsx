import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-4xl font-semibold text-gray-600">Page Not Found</p>
        <p className="mt-4">
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Go back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
