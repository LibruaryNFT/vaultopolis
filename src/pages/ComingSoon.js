import React from "react";

const ComingSoon = () => {
  return (
    <div
      className="
        w-full
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

      {/* Simple subtext */}
      <p className="mb-8 text-lg text-center">Stay tuned for an epic launch.</p>

      {/* Static "Coming Soon" Message */}
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
        Coming Soon
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
