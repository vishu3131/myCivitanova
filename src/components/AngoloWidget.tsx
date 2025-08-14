import React from 'react';

interface AngoloWidgetProps {
  onButton1Click: () => void;
  onButton2Click: () => void;
}

const AngoloWidget: React.FC<AngoloWidgetProps> = ({ onButton1Click, onButton2Click }) => {
  return (
    <div className="bg-dark-300/50 backdrop-blur-sm rounded-xl p-3 card-glow border border-white/10">
      <div className="text-center">
        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <span className="text-xs text-yellow-400">💡</span>
        </div>
        <div className="text-white font-medium text-xs">Angolo</div>
        <div className="mt-2 space-y-1">
          <button
            className="w-full py-1 rounded-lg text-[10px] bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors"
            onClick={onButton1Click}
          >
            Tasto 1
          </button>
          <button
            className="w-full py-1 rounded-lg text-[10px] bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors"
            onClick={onButton2Click}
          >
            Tasto 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default AngoloWidget;
