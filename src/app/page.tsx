"use client";

import { MobileHomeScreen } from '@/components/MobileHomeScreen';
// Rimuovo l'import statico del MusicPlayer e uso un dynamic import + LazyRender
import dynamic from 'next/dynamic';
import LazyRender from '@/components/LazyRender';
import '@/styles/desktop-message.css';

const DynamicMusicPlayer = dynamic(() => import('@/components/MusicPlayer'), { ssr: false, loading: () => null });

export default function Home() {
  return (
    <>
      <MobileHomeScreen />
      <LazyRender fallback={null}>
        <DynamicMusicPlayer />
      </LazyRender>
    </>
  );
}
