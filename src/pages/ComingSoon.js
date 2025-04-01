// ComingSoon.js
import React, { useEffect, useState } from "react";

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    /**
     * For April 10, 2025 at 12:00 PM ET (which is UTC-4 in April),
     * we use Date.UTC with the corresponding UTC time (16:00).
     * Month index is zero-based, so April = 3.
     */
    const launchDate = new Date(Date.UTC(2025, 3, 10, 16, 0, 0)).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("We're live!");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="
        flex flex-col items-center justify-center
        min-h-screen
        bg-brand-primary
        text-brand-text
        p-4
      "
    >
      {/* Heading with logo inline */}
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        <img
          src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
          alt="Vaultopolis Logo"
          className="h-12 w-auto mr-2"
        />
        <span>coming soon!</span>
      </h1>

      {/* Subtext with launch time */}
      <p className="mb-2 text-lg text-center">
        Launching April 10, 2025 @ 12:00 PM ET
      </p>
      <p className="mb-8 text-sm text-brand-text/70">
        Stay tuned for an epic launch.
      </p>

      {/* Countdown Timer */}
      <div
        className="
          text-2xl
          font-mono
          p-4
          bg-brand-secondary
          rounded
          shadow-md
          shadow-black/30
          mb-8
        "
      >
        {timeLeft}
      </div>

      {/* "Follow on X" Link */}
      <a
        href="https://x.com/vaultopolis"
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex
          items-center
          text-brand-text/70
          hover:text-brand-text
          transition-colors
        "
      >
        <span className="mr-2">Follow on</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 300.251"
          fill="white"
          className="h-6 w-6"
        >
          <path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" />
        </svg>
      </a>
    </div>
  );
};

export default ComingSoon;
