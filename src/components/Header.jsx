import { Wallet, Cloud, HardDrive, Wifi, WifiOff, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function Header({ monthLabel, isCloud, onPrev, onNext, onAddTransaction }) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-text tracking-tight">FinCtrl</h1>
              <p className="text-xs text-text-muted -mt-0.5">Controle Financeiro</p>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-2">
            <button onClick={onPrev} className="w-8 h-8 rounded-lg border border-border hover:bg-surface-alt flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="text-sm font-semibold text-text min-w-36 text-center">{monthLabel}</span>
            <button onClick={onNext} className="w-8 h-8 rounded-lg border border-border hover:bg-surface-alt flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {isCloud ? (
              <div className="flex items-center gap-1.5 text-sm bg-income-light text-income-dark px-3 py-1.5 rounded-xl border border-income/20 hidden sm:flex">
                <Cloud className="w-3.5 h-3.5" />
                <Wifi className="w-3 h-3" />
                <span className="text-xs font-medium">Sincronizado</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-surface-alt text-text-secondary px-3 py-1.5 rounded-xl border border-border hidden sm:flex">
                <HardDrive className="w-3.5 h-3.5" />
                <WifiOff className="w-3 h-3 opacity-50" />
                <span className="text-xs font-medium">Local</span>
              </div>
            )}
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Lançamento</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}
