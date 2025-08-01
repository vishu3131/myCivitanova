import React, { useState } from 'react';
import SocialShareWidget from './SocialShareWidget';
import SocialButtonsWidget from './SocialButtonsWidget';
import Switch from './Switch';

const SocialWidgetsContainer = () => {
  const [showSocialButtons, setShowSocialButtons] = useState(false);

  const toggleSocialButtons = () => {
    setShowSocialButtons(!showSocialButtons);
  };

  return (
    <div className="space-y-4">
      {/* Widget Info Civitanova Marche */}
      <SocialShareWidget />
      
      {/* Container Switch + Pulsanti Social affiancati */}
      <div className="flex items-center justify-between gap-4 p-3 bg-dark-300/50 backdrop-blur-sm rounded-xl card-glow border border-white/10">
        {/* Switch Toggle */}
        <div className="flex items-center gap-3">
          <Switch isOn={showSocialButtons} onToggle={toggleSocialButtons} />
          <label className="text-white font-medium text-sm cursor-pointer" onClick={toggleSocialButtons}>
            Mostra social
          </label>
        </div>
        
        {/* Pulsanti Social - visibili solo se switch è ON */}
        <div className={`transition-all duration-300 ease-in-out flex items-center gap-2 ${
          showSocialButtons
            ? 'opacity-100 transform scale-100'
            : 'opacity-0 transform scale-95 pointer-events-none'
        }`}>
          <SocialButtonsWidget />
        </div>
      </div>
    </div>
  );
};

export default SocialWidgetsContainer;