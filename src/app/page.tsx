'use client'

import React from 'react';
import SyllabusForm from '@/app/components/SyllabusForm';
import FeedbackForm from './components/FeedbackForm';

export default function EnhancedHome() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Blurred placeholder image in the background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src="bg.jpeg" // Replace with your image path
          alt="Blurred background"
          className="w-full h-full object-cover blur-[106px]"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative">
        {/* Optional glassy overlay */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl rounded-3xl" />
        <div className="relative">
          <SyllabusForm />
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
