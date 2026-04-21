import { fmt } from '../utils'

export default function SummaryCards({ fin }) {
  const { summary } = fin
  const cards = [
    { label: 'Receitas', value: summary.totalIncome, color: 'border-t-income text-income', icon: '↑' },
    { label: 'Despesas', value: summary.totalExpense, color: 'border-t-expense text-expense', icon: '↓' },
    { label: 'Saldo', value: summary.balance, color: summary.balance >= 0 ? 'border-t-income text-income' : 'border-t-expense text-expense', icon: '≈' },
    { label: 'Faturas Cartão', value: summary.cardExpense, color: 'border-t-gold text-gold', icon: '💳' },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`bg-surface rounded-2xl p-4 border-t-4 shadow-sm ${c.color.split(' ')[0]}`}>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{c.label}</div>
          <div className={`text-2xl font-bold font-serif ${c.color.split(' ')[1]}`}>{fmt(c.value)}</div>
        </div>
      ))}
    </div>
  )
}
