'use client';

import React from 'react';
import PureNeonButton from './PureNeonButton';

interface PureNeonMobileWidgetProps {
  title?: string;
  description?: string;
  className?: string;
  onButtonClick?: () => void;
  buttonText?: string;
}

export default function PureNeonMobileWidget({
  title = "Neon CSS",
  description = "Tocca per l'effetto",
  className = "",
  onButtonClick,
  buttonText = "MyCivitanova.it"
}: PureNeonMobileWidgetProps) {
  return (
    <div className={`relative py-1 px-1 w-full ${className}`}>
      {/* Solo l'effetto neon, senza contenitori */}
      <div className="flex items-center w-full">
        <PureNeonButton
          text={buttonText}
          onClick={onButtonClick}
          fontSize="clamp(0.8rem, 2.5vw, 1.2rem)" // Font size ulteriormente ridotto
        />
      </div>
    </div>
  );
}