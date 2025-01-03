'use client'

import React from 'react';
import SyllabusForm from '@/app/components/SyllabusForm';

export default function EnhancedHome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <SyllabusForm />
      </div>
    </main>
  );
}