import React from 'react';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-5">
        <Compass className="w-[800px] h-[800px] text-zen-orange animate-spin-slow" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-zen-orange/10 text-zen-orange text-xs font-bold uppercase tracking-widest mb-6">
            Dhamma Mindset Academy
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-zen-gray-dark mb-8 leading-tight">
            Cultivate a Mind <br />
            <span className="text-zen-orange italic">of Peace & Wisdom</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zen-gray leading-relaxed mb-12">
            Explore our curated library of Dhamma teachings, mindfulness practices, and spiritual wisdom to guide your journey toward inner clarity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a
              href="#library"
              className="w-full sm:w-auto px-10 py-4 bg-zen-gray-dark text-white rounded-full font-bold hover:bg-zen-orange transition-all shadow-xl"
            >
              Explore Library
            </a>
            <button className="w-full sm:w-auto px-10 py-4 border-2 border-zen-gray-light text-zen-gray-dark rounded-full font-bold hover:border-zen-orange hover:text-zen-orange transition-all">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
