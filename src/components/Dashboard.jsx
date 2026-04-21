import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'

function fmt(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function IncomeForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [recurrent, setRecurrent] = useState(false)

  function save() {
    if (!desc || !amount) return
    onAdd({ description: desc, amount: parseFloat(amount), date, recurrent })
    setOpen(false); setDesc(''); setAmount('')
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-1 text-xs border border-border px-3 py-1.5 rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors text-text-secondary">
      <Plus className="w-3.5 h-3.5" /> Receita
    </button>
  )

  return (
    <div className="flex gap-1.5 items-center flex-wrap bg-primary-50 border border-primary-100 rounded-xl p-2">
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-28 outline-none focus:border-primary-400" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} />
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-24" type="number" placeholder="Valor" value={amount} onChange={e => setAmount(e.target.value)} />
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-28" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <label className="text-xs flex items-center gap-1 cursor-pointer text-text-secondary">
        <input type="checkbox" checked={recurrent} onChange={e => setRecurrent(e.target.checked)} className="rounded" /> Recorrente
      </label>
      <button onClick={save} className="bg-primary-600 text-white text-xs px-2.5 py-1 rounded-lg font-medium">✓</button>
      <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text text-xs"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

export default function Dashboard({ fin }) {
  const { monthExpenses, monthIncomes, categoryBreakdown, monthTransactions, getCat, cards, deleteIncome, addIncome, deleteTransaction } = fin
  const totalExp = monthExpenses.reduce((s, t) => s + t.amount, 0)

  const catEntries = Object.entries(categoryBreakdown)
    .map(([id, total]) => ({ cat: getCat(id), total }))
    .sort((a, b) => b.total - a.total)

  const recent = [...monthTransactions].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

      {/* Category Breakdown */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold text-text mb-4">Gastos por Categoria</h2>
        {catEntries.length === 0
          ? <Empty icon="📊" text="Nenhum gasto registrado neste mês" />
          : catEntries.map(({ cat, total }) => {
              const pct = totalExp > 0 ? (total / totalExp * 100) : 0
              const over = cat.budget > 0 && total > cat.budget
              return (
                <div key={cat.id || cat.name} className="mb-3.5">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{cat.emoji} {cat.name}</span>
                    <span className={`font-semibold ${over ? 'text-expense' : 'text-text'}`}>
                      {fmt(total)}
                      {cat.budget > 0 && <span className="text-text-muted font-normal text-xs"> / {fmt(cat.budget)}</span>}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden border border-border">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#ef4444' : cat.color }} />
                  </div>
                  {over && <p className="text-xs text-expense mt-0.5">⚠ Acima do orçamento em {fmt(total - cat.budget)}</p>}
                </div>
              )
            })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold text-text mb-4">Últimos Lançamentos</h2>
        {recent.length === 0
          ? <Empty icon="📋" text="Sem lançamentos este mês" />
          : <div className="space-y-1">
              {recent.map(t => {
                const cat = getCat(t.category)
                return (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0 group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{cat.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{t.description}</p>
                        <p className="text-xs text-text-muted">{fmtDate(t.date)} · {cat.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </span>
                      <button onClick={() => deleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-expense transition-all p-1 rounded-lg hover:bg-expense-light">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>}
      </div>

      {/* Incomes */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <h2 className="text-base font-semibold text-text">Receitas do Mês</h2>
          <IncomeForm onAdd={addIncome} />
        </div>
        {monthIncomes.length === 0
          ? <Empty icon="💰" text="Nenhuma receita registrada" />
          : <div className="space-y-0.5">
              {monthIncomes.map(i => (
                <div key={i.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0 group">
                  <div>
                    <p className="text-sm font-medium text-text">{i.description}</p>
                    <p className="text-xs text-text-muted">{fmtDate(i.date)}{i.recurrent ? ' · Recorrente' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-income font-semibold text-sm">{fmt(i.amount)}</span>
                    <button onClick={() => deleteIncome(i.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-expense transition-all p-1 rounded-lg hover:bg-expense-light">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>}
      </div>

      {/* Cards Summary */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-base font-semibold text-text mb-4">Faturas dos Cartões</h2>
        {cards.length === 0
          ? <Empty icon="💳" text="Nenhum cartão cadastrado. Vá em Cartões para adicionar." />
          : cards.map(card => {
              const exp = monthExpenses.filter(t => t.payment === 'credito' && t.card === card.id)
              const total = exp.reduce((s, t) => s + t.amount, 0)
              const pct = card.limit > 0 ? (total / card.limit * 100) : 0
              const colors = card.color.split(',')
              const over = pct > 80
              return (
                <div key={card.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-text">💳 {card.name}</span>
                    <span className={`font-semibold ${over ? 'text-expense' : 'text-text'}`}>
                      {fmt(total)} <span className="text-text-muted font-normal text-xs">/ {fmt(card.limit)}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-surface-alt rounded-full overflow-hidden border border-border">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#ef4444' : colors[0] }} />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">Vence dia {card.due} · {exp.length} compra{exp.length !== 1 ? 's' : ''}</p>
                </div>
              )
            })}
      </div>
    </div>
  )
}

function Empty({ icon, text }) {
  return (
    <div className="text-center py-10 text-text-muted">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  )
}
