import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CalendarClock,
} from 'lucide-react'

const cards = [
  {
    key: 'balance',
    label: 'Saldo do Ciclo',
    icon: Wallet,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    key: 'totalIncome',
    label: 'Entradas',
    icon: TrendingUp,
    color: 'text-income',
    bg: 'bg-income-light',
    border: 'border-income/20',
    gradient: 'from-income to-emerald-600',
  },
  {
    key: 'totalExpense',
    label: 'Saídas',
    icon: TrendingDown,
    color: 'text-expense',
    bg: 'bg-expense-light',
    border: 'border-expense/20',
    gradient: 'from-expense to-rose-600',
  },
  {
    key: 'totalInvest',
    label: 'Investido',
    icon: PiggyBank,
    color: 'text-invest',
    bg: 'bg-invest-light',
    border: 'border-invest/20',
    gradient: 'from-invest to-violet-600',
  },
]

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function SummaryCards({ cycle }) {
  return (
    <div>
      {/* Cycle label */}
      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
        <div className="flex items-center gap-2 bg-primary-50 text-primary-600 px-3.5 py-1.5 rounded-xl border border-primary-100">
          <CalendarClock className="w-4 h-4" />
          <span className="text-sm font-semibold">{cycle.label}</span>
        </div>
        <span className="text-xs text-text-muted hidden sm:inline">
          Fatura atual sendo acumulada
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon
          const value = cycle[card.key]

          return (
            <div
              key={card.key}
              className={`
                animate-fade-in-up stagger-${i + 1}
                bg-surface rounded-2xl border ${card.border}
                p-4 sm:p-6
                hover:shadow-lg hover:-translate-y-0.5
                transition-all duration-300 ease-out
                group cursor-default
              `}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-text-secondary">
                  {card.label}
                </span>
                <div
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${card.bg}
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                </div>
              </div>

              <p className={`text-xl sm:text-3xl font-bold tracking-tight ${card.color}`}>
                {formatCurrency(value)}
              </p>

              <div
                className={`
                  mt-3 h-1 rounded-full bg-gradient-to-r ${card.gradient}
                  opacity-60 group-hover:opacity-100 transition-opacity duration-300
                `}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
