import { BottomNavbar } from "../../components/BottomNavbar";
import { StatusBar } from "../../components/StatusBar";
import { NewsCarousel } from "../../components/NewsCarousel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* iOS-style status bar */}
      <StatusBar />

      {/* Safe area wrapper */}
      <div className="content-with-navbar pt-16 px-4 space-y-6">
        {/* Top header row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-white text-xl font-bold">News</h1>
          {/* Placeholder for spacing */}
          <span className="w-10 h-10" />
        </div>

        {/* News carousel */}
        <NewsCarousel />
      </div>

      {/* Bottom navigation */}
      <BottomNavbar />
    </div>
  );
}