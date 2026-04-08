export default function Header() {
  return (
    <header className="bg-surface border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-ocean flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <span className="text-lg font-extrabold tracking-tight text-ink">reachable</span>
      </div>
    </header>
  );
}
