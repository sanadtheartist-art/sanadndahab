import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[100dvh] bg-background text-text flex flex-col justify-center items-center px-4 md:px-10 py-32 text-center selection:bg-accent/30 selection:text-white">
      <div className="relative max-w-2xl mx-auto flex flex-col items-center animate-fade-up">
        {/* Decorative Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[80px] z-0 pointer-events-none" />
        
        <h1 className="relative z-10 font-display font-normal text-8xl md:text-9xl tracking-tight mb-4 text-white">
          404
        </h1>
        <p className="relative z-10 text-xl md:text-2xl font-semibold tracking-widest uppercase text-accent mb-6">
          Page Not Found
        </p>
        <p className="relative z-10 text-dim text-lg mb-10 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          to="/"
          className="relative z-10 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-br from-accent to-accent-hover text-black font-semibold rounded-full shadow-[0_12px_30px_rgba(196,165,116,0.18)] hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(196,165,116,0.25)] transition-all duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
