'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  /** Put lunchbuddy.mp4 in /public and pass "/lunchbuddy.mp4" */
  src: string;
  /** Optional poster to avoid black first-frame flash, e.g. "/lunchbuddy-poster.jpg" */
  poster?: string;
  /** Set true when your page/data is ready; loader will fade out */
  isReady: boolean;
  /** Keep the loader showing at least this long (ms) to avoid flicker */
  minDurationMs?: number;
  /** Hide blur (e.g., for accessibility) */
  disableBlur?: boolean;
};

export default function BlurCookLoader({
  src,
  poster,
  isReady,
  minDurationMs = 120000,
  disableBlur = false,
}: Props) {
  const [mountedAt] = React.useState(() => Date.now());
  const [show, setShow] = React.useState(true);

  React.useEffect(() => {
    if (!isReady) return;
    const elapsed = Date.now() - mountedAt;
    const leftover = Math.max(0, minDurationMs - elapsed);
    const t = setTimeout(() => setShow(false), leftover);
    return () => clearTimeout(t);
  }, [isReady, minDurationMs, mountedAt]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[70] bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 5, ease: 'easeInOut' }}
          aria-label="Loading LunchBuddy"
        >
          {/* Video layer */}
          <video
            className={[
              'absolute inset-0 h-full w-full object-cover',
              disableBlur ? '' : 'blur-md',
            ].join(' ')}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            poster={poster}
          />

          {/* Soft dark overlay for readability */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Center content */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center px-6 text-center">
            {/* Brand lockup (optional logo) */}
            {/* <img src="/lunchbuddy-logo.png" alt="LunchBuddy" className="h-12 w-12 mb-4 opacity-90" /> */}

            <div className="text-white/95 text-xl sm:text-2xl font-semibold tracking-tight">
              Wait… something tasty is cooking
            </div>
            <div className="mt-2 text-white/70 text-sm sm:text-base">
              Loading your LunchBuddy experience
              <AnimatedDots />
            </div>

            {/* Subtle progress bar */}
            <div className="mt-6 h-1 w-56 max-w-[70vw] overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-1/3 rounded-full bg-emerald-400"
                animate={{ x: ['-33%', '100%'] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedDots() {
  return (
    <span aria-hidden className="inline-flex w-8 overflow-hidden">
      <motion.span
        className="inline-block w-2 text-center"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.1 }}
      >
        .
      </motion.span>
      <motion.span
        className="inline-block w-2 text-center"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2, repeatDelay: 0.1 }}
      >
        .
      </motion.span>
      <motion.span
        className="inline-block w-2 text-center"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4, repeatDelay: 0.1 }}
      >
        .
      </motion.span>
    </span>
  );
}
