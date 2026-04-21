export default function Header({ monthLabel, isCloud, onPrev, onNext, onAddTransaction }) {
  return (
    <header className="bg-text text-surface sticky top-0 z-50 h-16 flex items-center justify-between px-4">
      <div className="font-serif text-xl font-bold tracking-tight">
        fin<span className="text-income-light">ctrl</span>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onPrev} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-lg">‹</button>
        <span className="text-sm font-medium min-w-36 text-center">{monthLabel}</span>
        <button onClick={onNext} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-lg">›</button>
      </div>

      <div className="flex items-center gap-2">
        {isCloud && <span className="text-xs text-white/50 hidden sm:block">☁ sincronizado</span>}
        <button
          onClick={onAddTransaction}
          className="bg-income-light hover:bg-income text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Lançamento
        </button>
      </div>
    </header>
  )
}
