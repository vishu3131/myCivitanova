'use client';

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Skeleton loader per i componenti in caricamento
const ComponentSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${height} w-full`}>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

// Componenti lazy-loaded
export const LazyUserManagement = lazy(() => import('./UserManagement'));
export const LazyEventsManagement = lazy(() => import('./EventsManagement'));
export const LazyPoiManagement = lazy(() => import('./PoiManagement'));
export const LazyFundraisingManagement = lazy(() => import('./FundraisingManagement'));
export const LazyGamificationManagement = lazy(() => import('./GamificationManagement'));
export const LazyDonationsManagement = lazy(() => import('./DonationsManagement'));
export const LazyProblemReportSection = lazy(() => import('./ProblemReportSection'));
export const LazyAppStats = lazy(() => import('./AppStats'));

// Wrapper per gestire il lazy loading con animazioni
interface LazyWrapperProps {
  children: React.ReactNode;
  fallbackHeight?: string;
  delay?: number;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallbackHeight = 'h-64',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Suspense fallback={<ComponentSkeleton height={fallbackHeight} />}>
        {children}
      </Suspense>
    </motion.div>
  );
};

// Hook per il lazy loading condizionale
export const useLazyLoad = (shouldLoad: boolean) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (shouldLoad && !isLoaded) {
      // Ritardo per evitare il caricamento simultaneo di tutti i componenti
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldLoad, isLoaded]);

  return isLoaded;
};

// Componente per il caricamento progressivo delle sezioni admin
interface ProgressiveLoaderProps {
  sections: Array<{
    id: string;
    component: React.ComponentType<any>;
    props?: any;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({ sections }) => {
  const [loadedSections, setLoadedSections] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Carica prima le sezioni ad alta priorità
    const highPriority = sections.filter(s => s.priority === 'high');
    const mediumPriority = sections.filter(s => s.priority === 'medium');
    const lowPriority = sections.filter(s => s.priority === 'low');

    // Caricamento progressivo
    const loadSections = async () => {
      // Carica immediatamente le sezioni ad alta priorità
      highPriority.forEach(section => {
        setLoadedSections(prev => new Set([...prev, section.id]));
      });

      // Carica le sezioni a media priorità dopo 500ms
      setTimeout(() => {
        mediumPriority.forEach(section => {
          setLoadedSections(prev => new Set([...prev, section.id]));
        });
      }, 500);

      // Carica le sezioni a bassa priorità dopo 1000ms
      setTimeout(() => {
        lowPriority.forEach(section => {
          setLoadedSections(prev => new Set([...prev, section.id]));
        });
      }, 1000);
    };

    loadSections();
  }, [sections]);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const Component = section.component;
        const isLoaded = loadedSections.has(section.id);
        
        return (
          <div key={section.id}>
            {isLoaded ? (
              <LazyWrapper delay={index * 0.1}>
                <Component {...(section.props || {})} />
              </LazyWrapper>
            ) : (
              <ComponentSkeleton />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LazyWrapper;