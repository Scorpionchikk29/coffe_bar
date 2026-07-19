export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 text-xs py-6 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Коммерческий проект «Кофейня». Все права защищены.</p>
        <div className="flex gap-6">
          <span className="text-stone-500">Стек: React + TS + Tailwind v4 + PERN</span>
        </div>
      </div>
    </footer>
  );
}
