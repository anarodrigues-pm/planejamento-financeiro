import { Wallet, LogIn } from 'lucide-react'

export default function LoginScreen({ onLogin, loading }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Card principal */}
        <div className="bg-surface rounded-3xl border border-border shadow-xl p-8 sm:p-10 text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg mx-auto mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-text tracking-tight mb-2">
            FinPlan
          </h1>
          <p className="text-text-secondary text-sm mb-1">
            Planejamento Financeiro Compartilhado
          </p>
          <p className="text-text-muted text-xs mb-8">
            Gerencie suas finanças junto com quem você ama 💙
          </p>

          {/* Divider decorativo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted font-medium">
              Entre para continuar
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Botão Google */}
          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl
              bg-surface-alt border-2 border-border
              hover:border-primary-300 hover:shadow-lg hover:scale-[1.01]
              active:scale-[0.99]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-out
              flex items-center justify-center gap-3
              group"
          >
            {/* Google icon SVG */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-semibold text-text group-hover:text-primary-600 transition-colors duration-200">
              {loading ? 'Conectando...' : 'Entrar com Google'}
            </span>
          </button>

          {/* Info de segurança */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-income animate-pulse" />
            <span className="text-xs text-text-muted">
              Dados sincronizados em tempo real
            </span>
          </div>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs text-text-muted mt-6">
          Feito com ❤️ para finanças a dois
        </p>
      </div>
    </div>
  )
}
