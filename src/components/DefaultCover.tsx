import React from 'react';

interface DefaultCoverProps {
  title: string;
  author: string;
  className?: string;
}

const DefaultCover: React.FC<DefaultCoverProps> = ({ title, author, className = "" }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#4a0404] via-[#5d0606] to-[#8b6b1d] ${className}`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="lotus-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 2 C12 5 15 5 15 10 C15 15 12 15 10 18 C8 15 5 15 5 10 C5 5 8 5 10 2 Z" fill="currentColor" className="text-gold-500" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#lotus-pattern)" />
        </svg>
      </div>

      {/* Center Icon (Lotus-like) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 100 100" className="text-yellow-500">
          <path d="M50 10 C60 30 90 30 90 50 C90 70 60 70 50 90 C40 70 10 70 10 50 C10 30 40 30 50 10 Z" fill="currentColor" />
          <circle cx="50" cy="50" r="5" fill="white" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 w-full">
        <div className="w-16 h-1 bg-yellow-500/50 rounded-full mb-2" />
        
        <h2 className="text-white font-serif font-bold text-2xl md:text-3xl leading-tight drop-shadow-lg break-words w-full px-2">
          {title}
        </h2>
        
        <div className="w-8 h-px bg-white/30" />
        
        <p className="text-yellow-200/90 font-medium text-sm md:text-base italic tracking-wide drop-shadow">
          {author}
        </p>

        <div className="w-16 h-1 bg-yellow-500/50 rounded-full mt-2" />
      </div>

      {/* Border accent */}
      <div className="absolute inset-4 border border-white/10 rounded-lg pointer-events-none" />
    </div>
  );
};

export default DefaultCover;
