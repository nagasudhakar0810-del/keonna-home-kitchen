import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 400 400" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle Background */}
      <circle cx="200" cy="200" r="190" fill="#fdf6e3" stroke="#5c3d2e" strokeWidth="4"/>
      <circle cx="200" cy="200" r="175" fill="white" stroke="#e6d5b8" strokeWidth="2"/>
      
      {/* Circular Text Paths */}
      <defs>
        <path id="topPath" d="M 50,200 A 150,150 0 0,1 350,200" />
        <path id="bottomPath" d="M 50,200 A 150,150 0 0,0 350,200" />
      </defs>

      {/* Text Elements */}
      <text fill="#5c3d2e" fontSize="32" fontWeight="900" fontFamily="serif" letterSpacing="2">
        <textPath href="#topPath" startOffset="50%" textAnchor="middle">
          KEONNA HOME KITCHEN
        </textPath>
      </text>
      
      <text fill="#b35a38" fontSize="20" fontWeight="bold" fontFamily="sans-serif" letterSpacing="4">
        <textPath href="#bottomPath" startOffset="50%" textAnchor="middle">
          TASTE OF TRADITION
        </textPath>
      </text>

      {/* Central Illustration Group */}
      <g transform="translate(100, 110) scale(0.5)">
        {/* Traditional Indian Cooking Pot (Handi) */}
        <path d="M 120,240 C 80,240 60,180 80,140 C 100,100 140,100 160,100 L 240,100 C 260,100 300,100 320,140 C 340,180 320,240 280,240 Z" fill="#b35a38" stroke="#5c3d2e" strokeWidth="8"/>
        
        {/* Pot Rim */}
        <path d="M 140,100 L 260,100 C 280,100 290,90 290,80 C 290,70 280,60 260,60 L 140,60 C 120,60 110,70 110,80 C 110,90 120,100 140,100 Z" fill="#8b5e3c" stroke="#5c3d2e" strokeWidth="8"/>
        
        {/* Pot Details/Decorations */}
        <path d="M 100,160 Q 200,180 300,160" fill="none" stroke="#fdf6e3" strokeWidth="4" strokeDasharray="10,10"/>
        <path d="M 110,190 Q 200,210 290,190" fill="none" stroke="#fdf6e3" strokeWidth="4" strokeDasharray="10,10"/>

        {/* Steam/Aroma */}
        <path d="M 160,40 Q 140,0 180,-40 T 160,-100" fill="none" stroke="#e6d5b8" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 200,50 Q 180,10 220,-30 T 200,-90" fill="none" stroke="#e6d5b8" strokeWidth="8" strokeLinecap="round"/>
        <path d="M 240,40 Q 220,0 260,-40 T 240,-100" fill="none" stroke="#e6d5b8" strokeWidth="8" strokeLinecap="round"/>

        {/* Spices/Leaves around the pot */}
        <path d="M 40,200 Q 60,180 80,220 Q 60,240 40,200" fill="#5A5A40" stroke="#5c3d2e" strokeWidth="4"/>
        <path d="M 360,200 Q 340,180 320,220 Q 340,240 360,200" fill="#5A5A40" stroke="#5c3d2e" strokeWidth="4"/>
      </g>
    </svg>
  );
};
