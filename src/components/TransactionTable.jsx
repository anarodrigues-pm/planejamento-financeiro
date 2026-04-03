import { Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, History } from 'lucide-react'

const TYPE_CONFIG = {
  income: {
    label: 'Entrada',
    icon: ArrowUpRight,
    badge: 'bg-income-light text-income-dark',
    row: 'hover:bg-income-light/30',
  },
  expense: {
    label: 'Saída',
    icon: ArrowDownRight,
    badge: 'bg-expense-light text-expense-dark',
    row: 'hover:bg-expense-light/30',
  },
  invest: {
    label: 'Investimento',
    icon: TrendingUp,
    badge: 'bg-invest-light text-invest-dark',
    row: 'hover:bg-invest-light/30',
  },
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function TransactionTable({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-12 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-surface-alt mx-auto mb-4 flex items-center justify-center">
          <History className="w-8 h-8 text-text-muted" />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">
          Nenhuma transação registrada
        </h3>
        <p className="text-sm text-text-muted">
          Adicione sua primeira transação utilizando o formulário acima.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center">
            <History className="w-5 h-5 text-text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Histórico</h2>
            <p className="text-xs text-text-muted">
              {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-alt text-left">
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                Valor
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t, i) => {
              const config = TYPE_CONFIG[t.type]
              const Icon = config.icon
              return (
                <tr
                  key={t.id}
                  className={`${config.row} transition-colors duration-150 animate-slide-in`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-text">
                      {t.description}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{t.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{formatDate(t.date)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${
                      t.type === 'income'
                        ? 'text-income'
                        : t.type === 'expense'
                        ? 'text-expense'
                        : 'text-invest'
                    }`}>
                      {t.type === 'expense' ? '- ' : '+ '}
                      {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-expense hover:bg-expense-light
                        transition-all duration-200 hover:scale-110"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border">
        {transactions.map((t, i) => {
          const config = TYPE_CONFIG[t.type]
          const Icon = config.icon
          return (
            <div
              key={t.id}
              className={`px-4 py-4 ${config.row} transition-colors duration-150 animate-slide-in`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badge}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      {config.label}
                    </span>
                    <span className="text-xs text-text-muted">{t.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense-light
                    transition-all duration-200 ml-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{formatDate(t.date)}</span>
                <span className={`text-sm font-bold ${
                  t.type === 'income'
                    ? 'text-income'
                    : t.type === 'expense'
                    ? 'text-expense'
                    : 'text-invest'
                }`}>
                  {t.type === 'expense' ? '- ' : '+ '}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
