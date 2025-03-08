'use client'

import React from 'react';
import SyllabusForm from '@/app/components/SyllabusForm';
import FeedbackForm from './components/FeedbackForm';
import Image from 'next/image';

export default function EnhancedHome() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Blurred placeholder image in the background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/bg.jpeg" // Make sure the image is in the public directory
          alt="Blurred background"
          fill
          className="object-cover blur-[106px]"
          sizes="100vw"
          priority
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
