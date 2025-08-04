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
    <div className={`relative py-8 px-4 ${className}`}>
      {/* Solo l'effetto neon, senza contenitori */}
      <div className="flex items-center justify-center">
        <PureNeonButton
          text={buttonText}
          onClick={onButtonClick}
          fontSize="clamp(1.2rem, 4vw, 2rem)" // Font size più grande per maggiore impatto
        />
      </div>
    </div>
  );
}