import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
} from 'lucide-react'

const cards = [
  {
    key: 'balance',
    label: 'Saldo Atual',
    icon: Wallet,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    border: 'border-primary-100',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    key: 'totalIncome',
    label: 'Total de Entradas',
    icon: TrendingUp,
    color: 'text-income',
    bg: 'bg-income-light',
    border: 'border-income/20',
    gradient: 'from-income to-emerald-600',
  },
  {
    key: 'totalExpense',
    label: 'Total de Saídas',
    icon: TrendingDown,
    color: 'text-expense',
    bg: 'bg-expense-light',
    border: 'border-expense/20',
    gradient: 'from-expense to-rose-600',
  },
  {
    key: 'totalInvest',
    label: 'Total Investido',
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

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        const value = summary[card.key]

        return (
          <div
            key={card.key}
            className={`
              animate-fade-in-up stagger-${i + 1}
              bg-surface rounded-2xl border ${card.border}
              p-5 sm:p-6
              hover:shadow-lg hover:-translate-y-0.5
              transition-all duration-300 ease-out
              group cursor-default
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">
                {card.label}
              </span>
              <div
                className={`
                  w-10 h-10 rounded-xl ${card.bg}
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300
                `}
              >
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>

            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${card.color}`}>
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
  )
}
