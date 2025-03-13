'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Sparkles, Zap, Bot, Clock } from 'lucide-react';

interface UpsellDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storeUrl: string;
}

export default function UpsellDialog({ isOpen, onClose, storeUrl }: UpsellDialogProps) {
  // Lock scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with background image and blue darkening overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("/bg-lnd2.png")' }}></div>
            <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
          </motion.div>
          
          {/* Dialog content */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300,
                duration: 0.5 
              }}
              className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl p-6 md:p-8 text-left shadow-xl transition-all w-full max-w-md border border-indigo-100"
            >
              
              {/* Close button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <Award className="w-9 h-9 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent pb-1">
                  Upgrade to Pro
                </h3>
                <p className="text-gray-600 text-center mt-2 max-w-xs mx-auto">
                  Take your learning experience to the next level
                </p>
              </div>
              
              {/* Features grid */}
              <motion.div 
                className="grid grid-cols-1 gap-4 mb-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <FeatureItem 
                  icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
                  title="Unlimited Course Generations"
                  description="Create as many courses as you need with no restrictions"
                />
                <FeatureItem 
                  icon={<Bot className="w-5 h-5 text-indigo-600" />}
                  title="Access to Voice Tutors"
                  description="Learn with AI-powered voice tutors for interactive learning"
                />
                <FeatureItem 
                  icon={<Zap className="w-5 h-5 text-indigo-600" />}
                  title="State-of-the-Art Models"
                  description="Powered by O1 and Claude 3.7 Sonnet for superior content"
                />
                <FeatureItem 
                  icon={<Clock className="w-5 h-5 text-indigo-600" />}
                  title="Priority Generation"
                  description="Skip the queue with faster course generation"
                />
              </motion.div>
              
              {/* CTA */}
              <motion.div 
                className="mt-8 flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center font-medium shadow-md transition-colors flex items-center justify-center"
                  onClick={() => {
                    // Track click event
                    if (typeof window !== 'undefined') {
                      // Properly type window with optional gtag property
                      interface WindowWithGtag extends Window {
                        gtag?: (command: string, action: string, params: Record<string, string>) => void;
                      }
                      const win = window as WindowWithGtag;
                      
                      if (win.gtag) {
                        win.gtag('event', 'click_premium_upgrade', {
                          event_category: 'engagement',
                          event_label: 'premium_upsell'
                        });
                      }
                    }
                  }}
                >
                  Get Premium Access
                </motion.a>
                <p className="text-xs text-center text-gray-500 mt-3">
                  Unlock Pro features starting at just $5.99/month
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Feature item component
function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
      className="flex items-start gap-3 p-3.5 rounded-lg bg-white/80 border border-indigo-50 hover:bg-white/95 transition-colors hover:border-indigo-200 hover:shadow-sm"
    >
      <div className="bg-indigo-50 p-2 rounded-full flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
} 