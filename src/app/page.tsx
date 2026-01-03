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

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="relative animate-fade-in-up">
          <SyllabusForm />
          <FeedbackForm />
        </div>
      </div>
    </main>
  );
}
