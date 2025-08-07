import { BottomNavbar } from "../../components/BottomNavbar";
import { StatusBar } from "../../components/StatusBar";
import { NewsCarousel } from "../../components/NewsCarousel";
import { NewsFeed } from "../../components/NewsFeed"; // Supponendo che questo componente verrà creato o modificato
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Barra di stato in stile iOS */}
      <StatusBar />

      {/* Wrapper per l'area sicura */}
      <div className="content-with-navbar pt-16 px-4 space-y-6">
        {/* Riga dell'intestazione superiore */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-white text-xl font-bold">Notizie</h1>
          {/* Segnaposto per lo spazio */}
          <span className="w-10 h-10" />
        </div>

        {/* Carosello delle notizie */}
        <NewsCarousel />

        {/* Sezione Scopri Ora */}
        <div className="mt-8">
          <h2 className="text-white text-2xl font-bold mb-4">Scopri ora</h2>
          <div className="flex space-x-4 mb-6">
            <button className="text-white font-semibold border-b-2 border-white pb-1">POPULAR</button>
            <button className="text-gray-400 font-semibold">NUOVO</button>
          </div>

          {/* Segnaposto Widget Podcast */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h3 className="text-white text-lg font-bold">PODCAST Nearly.</h3>
            <p className="text-gray-400">Owen Jones ogni giorno</p>
            <p className="text-gray-500 text-sm">Riproduzioni: 3872</p>
          </div>

          {/* Segnaposto Widget Quiz */}
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-bold">QUIZ Uomo del giorno.</h3>
              <p className="text-gray-400">Settimana 15</p>
            </div>
            <button className="bg-white/10 text-white px-4 py-2 rounded-full">Partecipa →</button>
          </div>
        </div>

        {/* Sezione Feed */}
        <div className="mt-8">
          <h2 className="text-white text-2xl font-bold mb-4">Feed</h2>
          <div className="flex space-x-4 mb-6">
            <button className="text-white font-semibold border-b-2 border-white pb-1">Tutti</button>
            <button className="text-gray-400 font-semibold">Post</button>
            <button className="text-gray-400 font-semibold">Foto</button>
            <button className="text-gray-400 font-semibold">Quiz</button>
          </div>
          {/* Componente News Feed (o segnaposto) */}
          <NewsFeed /> {/* Potrebbe essere necessario creare questo componente */}
        </div>

      </div>

      {/* Navigazione inferiore */}
      <BottomNavbar />
    </div>
  );
}