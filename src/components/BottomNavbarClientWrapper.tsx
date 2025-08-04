"use client";
import dynamic from "next/dynamic";

const BottomNavbar = dynamic(() => import("./BottomNavbar").then(mod => mod.BottomNavbar), { ssr: false });

export default function BottomNavbarClientWrapper() {
  return <BottomNavbar />;
}