import React from 'react';
import ProfileCard from '@/components/ProfileCard';
import './Ringraziamenti.css';

const Ringraziamenti: React.FC = () => {
  const collaborators = [
    {
      id: 'founder',
      name: 'Marco Rossi',
      role: 'Founder & Visionario',
      status: 'Ideatore del progetto',
      avatar: '/images/avatars/founder.svg',
      contactInfo: 'marco@mycivitanova.it',
      gradient: 'conic-gradient(from 124deg at 50% 50%, #ff6b35ff 0%, #f7931eff 40%, #f7931eff 60%, #ff6b35ff 100%)',
      behindGradient: 'conic-gradient(from 124deg at 50% 50%, #ff6b35ff 0%, #f7931eff 40%, #f7931eff 60%, #ff6b35ff 100%)'
    },
    {
      id: 'developer',
      name: 'Luca Bianchi',
      role: 'Tecnico Sviluppo',
      status: 'Full Stack Developer',
      avatar: '/images/avatars/developer.svg',
      contactInfo: 'luca@mycivitanova.it',
      gradient: 'conic-gradient(from 124deg at 50% 50%, #00c1ffff 0%, #073affff 40%, #073affff 60%, #00c1ffff 100%)',
      behindGradient: 'conic-gradient(from 124deg at 50% 50%, #00c1ffff 0%, #073affff 40%, #073affff 60%, #00c1ffff 100%)'
    },
    {
      id: 'marketing',
      name: 'Sofia Verdi',
      role: 'Marketing Specialist',
      status: 'Social Media & Growth',
      avatar: '/images/avatars/marketing.svg',
      contactInfo: 'sofia@mycivitanova.it',
      gradient: 'conic-gradient(from 124deg at 50% 50%, #c137ffff 0%, #ff37c1ff 40%, #ff37c1ff 60%, #c137ffff 100%)',
      behindGradient: 'conic-gradient(from 124deg at 50% 50%, #c137ffff 0%, #ff37c1ff 40%, #ff37c1ff 60%, #c137ffff 100%)'
    },
    {
      id: 'designer',
      name: 'Alessandro Neri',
      role: 'Graphic Designer',
      status: 'UI/UX & Brand Design',
      avatar: '/images/avatars/designer.svg',
      contactInfo: 'alessandro@mycivitanova.it',
      gradient: 'conic-gradient(from 124deg at 50% 50%, #00ff88ff 0%, #00ffaaff 40%, #00ffaaff 60%, #00ff88ff 100%)',
      behindGradient: 'conic-gradient(from 124deg at 50% 50%, #00ff88ff 0%, #00ffaaff 40%, #00ffaaff 60%, #00ff88ff 100%)'
    }
  ];

  return (
    <div className="ringraziamenti-page">
      <div className="ringraziamenti-header">
        <h1>Ringraziamenti</h1>
        <p>Un sentito ringraziamento a tutti i collaboratori che contribuiscono gratuitamente al miglioramento di MyCivitanova</p>
      </div>
      
      <div className="cards-container">
        {collaborators.map((collaborator, index) => (
          <div 
            key={collaborator.id} 
            className={`card-wrapper ${collaborator.id === 'founder' ? 'founder-card' : ''}`}
          >
            <ProfileCard
              key={collaborator.id}
              avatar={collaborator.avatar}
              name={collaborator.name}
              role={collaborator.role}
              contact="Contatta"
              behindGradient={collaborator.behindGradient}
              innerGradient={collaborator.gradient}
              onContactClick={() => window.open(`mailto:${collaborator.contactInfo}`, '_blank')}
            />
          </div>
        ))}
      </div>
      
      <div className="ringraziamenti-footer">
        <p>Vuoi contribuire anche tu? Contattaci per unirti al nostro team di volontari!</p>
        <button className="join-btn">Unisciti a noi</button>
      </div>
    </div>
  );
};

export default Ringraziamenti;