// ComingSoon.js
import React, { useEffect, useState } from "react";

const ComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Set your launch date here
    const launchDate = new Date("Apr 7, 2025 12:00:00").getTime();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        Vaultopolis is launching soon!
      </h1>
      <p className="mb-8">Stay tuned for an epic launch.</p>
      <div className="text-2xl font-mono">{timeLeft}</div>
    </div>
  );
};

export default ComingSoon;
