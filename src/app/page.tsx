"use client";

import { MobileHomeScreen } from '@/components/MobileHomeScreen';
import MusicPlayer from '@/components/MusicPlayer';
import '@/styles/desktop-message.css';

export default function Home() {
  return (
    <>
      <MobileHomeScreen />
      <MusicPlayer />
    </>
  );
}
