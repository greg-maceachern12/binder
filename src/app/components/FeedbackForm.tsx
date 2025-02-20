'use client'

import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
          feedback
        }),
      });
      setFeedback('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mt-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={feedback}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeedback(e.target.value)}
          placeholder="Share your feedback..."
          className="flex-1 px-4 py-2 text-sm rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          required
        />
        <button
          type="submit"
          className={`px-4 py-2 ${showSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-xl transition-all duration-300 flex items-center gap-2`}
        >
          {showSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm">Sent</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send Feedback</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}