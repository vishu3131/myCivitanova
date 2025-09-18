import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Mappa centralizzata dei componenti caricati in modo dinamico
export const DynamicComponents = {
  MarketplaceWidget: dynamic(() => import('@/components/MarketplaceWidget')),
  SocialWidgetsContainer: dynamic(() => import('@/components/SocialWidgetsContainer')),
  TourARWidget: dynamic(() => import('@/components/TourARWidget')),
  SimpleBadgeSystem: dynamic(() => import('@/components/SimpleBadgeSystem')),
  LeaderboardWidget: dynamic(() => import('@/components/LeaderboardWidget')),
  SearchModal: dynamic(() => import('@/components/SearchModal')),
  CommunityReportModal: dynamic(() => import('@/components/CommunityReportModal')),
  CityReportModal: dynamic(() => import('@/components/CityReportModal')),
} as const;

// Precarica (in background) alcuni componenti critici per migliorare la UX
export async function preloadCriticalComponents(): Promise<void> {
  await Promise.all([
    import('@/components/MarketplaceWidget'),
    import('@/components/SocialWidgetsContainer'),
    import('@/components/LeaderboardWidget'),
  ]);
}

export type DynamicComponentKeys = keyof typeof DynamicComponents;
export type DynamicComponent = (typeof DynamicComponents)[DynamicComponentKeys] extends ComponentType<any>
  ? ComponentType<any>
  : ComponentType<any>;