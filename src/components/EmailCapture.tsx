import React from 'react';
export function EmailCapture() {
  return <div className="text-center max-w-xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-4">Start Your Music Journey</h2>
      <p className="opacity-70 mb-6">
        Join thousands of music enthusiasts. Get weekly recommendations and
        track your listening journey.
      </p>
      <form className="flex gap-2">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
        <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
          Join Now
        </button>
      </form>
    </div>;
}