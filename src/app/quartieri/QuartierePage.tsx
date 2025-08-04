import React, { useState } from 'react';
import { Quartiere } from '../../data/quartieriData';
import { QuartieriScroller } from '../../components/QuartieriScroller';

interface QuartierePageProps {
  quartiereData: Quartiere[];
}

const QuartierePage: React.FC<QuartierePageProps> = ({ quartiereData }) => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere | null>(quartiereData[0]);

  const handleQuartiereSelect = (quartiere: Quartiere) => {
    setSelectedQuartiere(quartiere);
  };

  return (
    <div>
      <QuartieriScroller 
        onQuartiereSelect={handleQuartiereSelect} 
        selectedQuartiereId={selectedQuartiere?.id || null}
      />
      {selectedQuartiere && (
        <div>
          <h2>{selectedQuartiere.name}</h2>
          <p>{selectedQuartiere.description}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </div>
  );
};

export default QuartierePage;