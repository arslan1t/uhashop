"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scaleX(1) scaleY(1);
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          }
          30% {
            transform: translateY(-60px) scaleX(0.95) scaleY(1.05);
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          }
          60% {
            transform: translateY(-20px) scaleX(0.98) scaleY(1.02);
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
          }
          80% {
            transform: translateY(-8px) scaleX(1) scaleY(1);
          }
        }

        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.35; }
          30% { transform: scaleX(0.5); opacity: 0.15; }
          60% { transform: scaleX(0.75); opacity: 0.25; }
          80% { transform: scaleX(0.9); opacity: 0.3; }
        }

        .nf-bounce {
          animation: bounce 1.4s ease-in-out infinite;
          display: inline-block;
          transform-origin: center bottom;
        }

        .nf-shadow {
          animation: shadow-pulse 1.4s ease-in-out infinite;
          transform-origin: center;
        }

        .nf-root {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: rgb(var(--background));
          color: rgb(var(--foreground));
          overflow: hidden;
          padding: 1.5rem;
        }

        /* Basketball court SVG background */
        .nf-court-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
        }

        .nf-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        }

        .nf-404 {
          font-family: var(--font-inter), "Unbounded", system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(7rem, 22vw, 18rem);
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: rgb(var(--accent));
          user-select: none;
        }

        .nf-basketball-wrap {
          margin: 1rem 0 0.5rem;
          line-height: 1;
        }

        .nf-ball {
          font-size: clamp(3rem, 8vw, 5rem);
          line-height: 1;
        }

        .nf-ball-shadow {
          width: clamp(2rem, 6vw, 3.5rem);
          height: 8px;
          background: rgb(var(--foreground));
          border-radius: 50%;
          margin: 4px auto 0;
          filter: blur(4px);
        }

        .nf-heading {
          font-family: var(--font-inter), "Unbounded", system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 5vw, 3.5rem);
          letter-spacing: -0.03em;
          margin-top: 1.25rem;
          color: rgb(var(--foreground));
        }

        .nf-subtitle {
          font-size: clamp(0.9rem, 2vw, 1.125rem);
          color: rgb(var(--muted));
          margin-top: 0.75rem;
          max-width: 38ch;
          line-height: 1.55;
          letter-spacing: -0.01em;
        }

        .nf-divider {
          width: 48px;
          height: 2px;
          background: rgb(var(--accent));
          border-radius: 2px;
          margin: 1.5rem 0;
          opacity: 0.7;
        }

        .nf-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.7rem 1.6rem;
          background: rgb(var(--accent));
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.18s ease, transform 0.18s ease;
          border: none;
          cursor: pointer;
        }

        .nf-btn-primary:hover {
          background: rgb(var(--accent-hover));
          transform: translateY(-2px);
        }

        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.7rem 1.6rem;
          background: transparent;
          color: rgb(var(--foreground));
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: -0.01em;
          border-radius: 8px;
          text-decoration: none;
          border: 1.5px solid rgb(var(--border));
          transition: border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
          cursor: pointer;
        }

        .nf-btn-secondary:hover {
          border-color: rgb(var(--accent));
          color: rgb(var(--accent));
          transform: translateY(-2px);
        }
      `}</style>

      <div className="nf-root">
        {/* Basketball court lines background */}
        <svg
          className="nf-court-bg"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Court outline */}
          <rect
            x="80" y="60" width="1280" height="780"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="3"
          />
          {/* Half-court line */}
          <line
            x1="720" y1="60" x2="720" y2="840"
            stroke="rgb(var(--border))"
            strokeWidth="2.5"
          />
          {/* Center circle */}
          <circle
            cx="720" cy="450" r="90"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2.5"
          />
          <circle
            cx="720" cy="450" r="8"
            fill="rgb(var(--border))"
          />
          {/* Left key (paint) */}
          <rect
            x="80" y="295" width="200" height="310"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Left free-throw semicircle */}
          <path
            d="M 280 295 A 155 155 0 0 1 280 605"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Left restricted area */}
          <path
            d="M 80 390 A 125 125 0 0 1 80 510"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Left three-point arc */}
          <path
            d="M 80 185 A 370 370 0 0 1 80 715"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Left corner three lines */}
          <line x1="80" y1="185" x2="190" y2="185" stroke="rgb(var(--border))" strokeWidth="2" />
          <line x1="80" y1="715" x2="190" y2="715" stroke="rgb(var(--border))" strokeWidth="2" />

          {/* Right key (paint) */}
          <rect
            x="1160" y="295" width="200" height="310"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Right free-throw semicircle */}
          <path
            d="M 1160 295 A 155 155 0 0 0 1160 605"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Right restricted area */}
          <path
            d="M 1360 390 A 125 125 0 0 0 1360 510"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Right three-point arc */}
          <path
            d="M 1360 185 A 370 370 0 0 0 1360 715"
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
          />
          {/* Right corner three lines */}
          <line x1="1360" y1="185" x2="1250" y2="185" stroke="rgb(var(--border))" strokeWidth="2" />
          <line x1="1360" y1="715" x2="1250" y2="715" stroke="rgb(var(--border))" strokeWidth="2" />
        </svg>

        {/* Main content */}
        <motion.div
          className="nf-content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* 404 */}
          <motion.div
            className="nf-404 font-display"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            404
          </motion.div>

          {/* Bouncing basketball */}
          <motion.div
            className="nf-basketball-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="nf-bounce nf-ball" aria-hidden="true">🏀</div>
            <div className="nf-shadow nf-ball-shadow" aria-hidden="true" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="nf-heading font-display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Вне площадки
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="nf-subtitle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Эта страница вышла за пределы. Но игра продолжается.
          </motion.p>

          {/* Divider */}
          <motion.div
            className="nf-divider"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.7 }}
            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          />

          {/* Buttons */}
          <motion.div
            className="nf-buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/ru" className="nf-btn-primary">
              На главную
            </Link>
            <Link href="/ru/marketplace" className="nf-btn-secondary">
              В каталог
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
