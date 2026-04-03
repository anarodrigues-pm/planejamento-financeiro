import { Wallet, Cloud, HardDrive, Wifi, WifiOff } from 'lucide-react'

export default function Header({ isCloud, cloudError }) {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-md bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text tracking-tight">
                FinPlan
              </h1>
              <p className="text-xs text-text-muted -mt-0.5">
                Planejamento Financeiro
              </p>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2">
            {isCloud ? (
              <div className="flex items-center gap-2 text-sm bg-income-light text-income-dark px-3 py-1.5 rounded-xl border border-income/20">
                <Cloud className="w-3.5 h-3.5" />
                <Wifi className="w-3 h-3" />
                <span className="text-xs font-medium hidden sm:inline">
                  Sincronizado na nuvem
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 text-sm bg-surface-alt text-text-secondary px-3 py-1.5 rounded-xl border border-border cursor-help"
                title={cloudError || 'Usando armazenamento local'}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <WifiOff className="w-3 h-3 opacity-50" />
                <span className="text-xs font-medium hidden sm:inline">
                  Dados salvos localmente
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
