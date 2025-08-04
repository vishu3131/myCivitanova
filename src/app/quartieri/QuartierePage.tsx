import React, { useState } from 'react';
import { Quartiere } from '../../data/quartieriData';
import QuartieriScroller from '../../components/QuartieriScroller';

interface QuartierePageProps {
  quartiereData: Quartiere[];
}

const QuartierePage: React.FC<QuartierePageProps> = ({ quartiereData }) => {
  const [selectedQuartiere, setSelectedQuartiere] = useState<Quartiere | null>(null);

  const handleQuartiereSelect = (quartiere: Quartiere) => {
    setSelectedQuartiere(quartiere);
  };

  return (
    <div>
      <QuartieriScroller quartieri={quartiereData} onSelect={handleQuartiereSelect} />
      {selectedQuartiere && (
        <div>
          <h2>{selectedQuartiere.nome}</h2>
          <p>{selectedQuartiere.descrizione}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </div>
  );
};

export default QuartierePage;