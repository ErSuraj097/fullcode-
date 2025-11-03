import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const ScrollProgressBar: React.FC = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollPercentage(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const radius = 0;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercentage / 100) * circumference;

  return (
    <div className="fixed bottom-3 left-3 z-50   space-y-4">
   

      <svg width="25" height="25" className="transform -rotate-90">
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#e5e5e5"
          strokeWidth="2"
          fill="transparent"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="#000000"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>

      
      <div className="absolute inset-0 ">
        <span className="text-xs  font-bold">{Math.round(scrollPercentage)}%</span>
      </div>
        <ThemeToggle />
    </div>
    
  );
};

export default ScrollProgressBar;
