import HeliotropeCard from '@/components/explore/HeliotropeCard';
// ... altri import esistenti

export default function ShoppingSectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping & Locali</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Scheda esistente Al Cuore Adriatico */}
        {/* ... altre schede esistenti ... */}
        
        {/* Nuova scheda Heliottrope */}
        <HeliotropeCard />
        
        {/* ... altre schede ... */}
      </div>
    </div>
  );
}
