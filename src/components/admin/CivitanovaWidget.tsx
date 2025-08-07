import { MapPin, Users, Calendar, TrendingUp } from "lucide-react";

export default function CivitanovaWidget() {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-4 py-5 text-center border border-blue-100 dark:border-gray-700">
      <div className="mb-3 flex justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">MC</span>
        </div>
      </div>
      
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        MyCivitanova
      </h3>
      
      <p className="mb-4 text-gray-600 text-sm dark:text-gray-300">
        Sistema di gestione per la Smart City di Civitanova Marche
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Users className="w-3 h-3" />
            <span>Utenti</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">1,247</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Eventi</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">23</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Attività</span>
          </div>
          <span className="font-medium text-green-600 dark:text-green-400">+12%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <MapPin className="w-3 h-3" />
        <span>Civitanova Marche, IT</span>
      </div>
    </div>
  );
}