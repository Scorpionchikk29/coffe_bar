import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
