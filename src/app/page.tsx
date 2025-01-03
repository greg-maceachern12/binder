'use client'

import React from 'react';
import SyllabusForm from '@/app/components/SyllabusForm';

export default function EnhancedHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-rose-50 to-teal-50 animate-gradient-x">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 relative">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl rounded-3xl" />
        <div className="relative">
          <SyllabusForm />
        </div>
      </div>
    </main>
  );
}