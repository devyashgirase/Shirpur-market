// Custom cartoon SVGs for different user types

export const CustomerCartoon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="animate-bounce-slow">
    {/* Professional proportional customer */}
    <g>
      {/* Head */}
      <circle cx="60" cy="30" r="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5"/>
      
      {/* Hair */}
      <path d="M47 20 Q60 12 73 20 Q70 16 60 16 Q50 16 47 20" fill="#8B4513"/>
      
      {/* Eyes */}
      <circle cx="55" cy="28" r="1.5" fill="#000"/>
      <circle cx="65" cy="28" r="1.5" fill="#000"/>
      
      {/* Smile */}
      <path d="M53 34 Q60 38 67 34" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      
      {/* Body */}
      <rect x="50" y="43" width="20" height="30" rx="10" fill="#3B82F6"/>
      
      {/* Arms */}
      <circle cx="42" cy="50" r="4" fill="#FBBF24"/>
      <circle cx="78" cy="50" r="4" fill="#FBBF24"/>
      
      {/* Shopping bags */}
      <rect x="30" y="55" width="10" height="12" rx="2" fill="#EF4444"/>
      <rect x="80" y="55" width="10" height="12" rx="2" fill="#10B981"/>
      <path d="M32 55 Q35 52 38 55" stroke="#EF4444" strokeWidth="1.5" fill="none"/>
      <path d="M82 55 Q85 52 88 55" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      
      {/* Legs */}
      <rect x="54" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
      <rect x="61" y="73" width="5" height="18" rx="2.5" fill="#1F2937"/>
      
      {/* Shoes */}
      <ellipse cx="56.5" cy="93" rx="6" ry="3" fill="#000"/>
      <ellipse cx="63.5" cy="93" rx="6" ry="3" fill="#000"/>
    </g>
  </svg>
);

export const DeliveryAgentCartoon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="animate-bounce-slow">
    {/* Delivery agent with helmet and package */}
    <g>
      {/* Head */}
      <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
      {/* Helmet */}
      <path d="M42 25 Q60 10 78 25 Q78 30 60 28 Q42 30 42 25" fill="#EF4444"/>
      <rect x="55" y="15" width="10" height="8" rx="2" fill="#FFF"/>
      {/* Eyes */}
      <circle cx="54" cy="32" r="2" fill="#000"/>
      <circle cx="66" cy="32" r="2" fill="#000"/>
      {/* Smile */}
      <path d="M52 38 Q60 44 68 38" stroke="#000" strokeWidth="2" fill="none"/>
      
      {/* Body with uniform */}
      <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
      <rect x="52" y="54" width="16" height="8" fill="#FBBF24"/>
      
      {/* Arms */}
      <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
      <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
      
      {/* Package */}
      <rect x="82" y="58" width="15" height="12" rx="2" fill="#8B4513"/>
      <path d="M84 58 L94 58 M89 55 L89 70" stroke="#FFF" strokeWidth="2"/>
      
      {/* Delivery bag */}
      <rect x="25" y="62" width="18" height="12" rx="3" fill="#10B981"/>
      <circle cx="34" cy="68" r="2" fill="#FFF"/>
      
      {/* Legs */}
      <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
      <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
      
      {/* Feet */}
      <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
      <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
    </g>
  </svg>
);

export const AdminCartoon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" className="animate-bounce-slow">
    {/* Admin with clipboard and tie */}
    <g>
      {/* Head */}
      <circle cx="60" cy="35" r="18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>
      {/* Hair - professional */}
      <path d="M45 25 Q60 12 75 25 Q75 22 60 20 Q45 22 45 25" fill="#4B5563"/>
      {/* Glasses */}
      <circle cx="54" cy="32" r="6" fill="none" stroke="#000" strokeWidth="2"/>
      <circle cx="66" cy="32" r="6" fill="none" stroke="#000" strokeWidth="2"/>
      <path d="M60 32 L60 32" stroke="#000" strokeWidth="2"/>
      {/* Eyes */}
      <circle cx="54" cy="32" r="2" fill="#000"/>
      <circle cx="66" cy="32" r="2" fill="#000"/>
      {/* Smile */}
      <path d="M52 38 Q60 44 68 38" stroke="#000" strokeWidth="2" fill="none"/>
      
      {/* Body with suit */}
      <rect x="48" y="50" width="24" height="35" rx="12" fill="#1F2937"/>
      {/* Tie */}
      <polygon points="60,50 65,55 60,75 55,55" fill="#EF4444"/>
      {/* Shirt */}
      <rect x="52" y="50" width="16" height="25" fill="#FFF"/>
      
      {/* Arms */}
      <circle cx="40" cy="60" r="6" fill="#FBBF24"/>
      <circle cx="80" cy="60" r="6" fill="#FBBF24"/>
      
      {/* Clipboard */}
      <rect x="82" y="55" width="12" height="18" rx="2" fill="#8B4513"/>
      <rect x="84" y="57" width="8" height="14" fill="#FFF"/>
      <path d="M85 59 L91 59 M85 62 L91 62 M85 65 L89 65" stroke="#000" strokeWidth="1"/>
      
      {/* Coffee cup */}
      <rect x="28" y="65" width="8" height="10" rx="2" fill="#FFF"/>
      <rect x="29" y="66" width="6" height="8" fill="#8B4513"/>
      <path d="M36 68 Q38 68 38 70 Q38 72 36 72" stroke="#FFF" strokeWidth="1" fill="none"/>
      
      {/* Legs */}
      <rect x="52" y="85" width="6" height="20" fill="#1F2937"/>
      <rect x="62" y="85" width="6" height="20" fill="#1F2937"/>
      
      {/* Feet */}
      <ellipse cx="55" cy="108" rx="8" ry="4" fill="#000"/>
      <ellipse cx="65" cy="108" rx="8" ry="4" fill="#000"/>
    </g>
  </svg>
);