import { NewsFeed } from '../../components/NewsFeed';
import { Header } from '../../components/Header';
import { BottomNavbar } from '../../components/BottomNavbar';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header title="News" />
      <main className="container mx-auto p-4">
        <NewsFeed />
      </main>
      <BottomNavbar />
    </div>
  );
}