import { Wallet } from 'lucide-react'

export default function Header() {
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

          <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
            <div className="w-2 h-2 rounded-full bg-income animate-pulse" />
            Dados salvos localmente
          </div>
        </div>
      </div>
    </header>
  )
}
