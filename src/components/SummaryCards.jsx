import { Wallet, TrendingUp, TrendingDown, CreditCard, CalendarClock } from 'lucide-react'

function fmt(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const CARDS = [
  { key: 'balance',      label: 'Saldo do Mês',    Icon: Wallet,      color: 'text-primary-600', bg: 'bg-primary-50',    border: 'border-primary-100',  gradient: 'from-primary-500 to-primary-700' },
  { key: 'totalIncome',  label: 'Entradas',         Icon: TrendingUp,  color: 'text-income',      bg: 'bg-income-light',  border: 'border-income/20',    gradient: 'from-income to-emerald-600' },
  { key: 'totalExpense', label: 'Saídas',           Icon: TrendingDown,color: 'text-expense',     bg: 'bg-expense-light', border: 'border-expense/20',   gradient: 'from-expense to-rose-600' },
  { key: 'cardExpense',  label: 'Faturas Cartão',   Icon: CreditCard,  color: 'text-gold',        bg: 'bg-gold-light',    border: 'border-gold/20',      gradient: 'from-gold to-amber-600' },
]

export default function SummaryCards({ fin }) {
  const { summary, monthLabel } = fin
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
        <div className="flex items-center gap-2 bg-primary-50 text-primary-600 px-3.5 py-1.5 rounded-xl border border-primary-100">
          <CalendarClock className="w-4 h-4" />
          <span className="text-sm font-semibold">{monthLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {CARDS.map(({ key, label, Icon, color, bg, border, gradient }, i) => {
          const value = summary[key] || 0
          return (
            <div key={key}
              className={`animate-fade-in-up stagger-${i+1} bg-surface rounded-2xl border ${border} p-4 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group cursor-default`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm font-medium text-text-secondary">{label}</span>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
              </div>
              <p className={`text-xl sm:text-3xl font-bold tracking-tight ${color}`}>{fmt(value)}</p>
              <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
