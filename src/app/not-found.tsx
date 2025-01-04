import Navbar from "@/components/global/navbar";
import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-gray-200">
      <Navbar />
      <div className="text-9xl font-bold text-blue-500 mb-8">😢</div>
      <h1 className="text-4xl font-extrabold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, the page you're looking for doesn't exist.
      </p>
    
    </div>
  );
};

export default NotFound;
