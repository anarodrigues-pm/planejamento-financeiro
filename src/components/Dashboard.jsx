import { useState } from 'react'
import { fmt, formatDate } from '../utils'

function Empty({ icon, text }) {
  return (
    <div className="text-center py-10 text-text-secondary">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  )
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
    <button onClick={() => setOpen(true)} className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-income hover:text-income transition-colors">
      + Receita
    </button>
  )

  return (
    <div className="flex gap-1 items-center flex-wrap justify-end">
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-28" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} />
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-20" type="number" placeholder="Valor" value={amount} onChange={e => setAmount(e.target.value)} />
      <input className="border border-border rounded-lg px-2 py-1 text-xs w-28" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <label className="text-xs flex items-center gap-1 cursor-pointer">
        <input type="checkbox" checked={recurrent} onChange={e => setRecurrent(e.target.checked)} /> Recorrente
      </label>
      <button onClick={save} className="bg-income text-white text-xs px-2 py-1 rounded-lg">✓</button>
      <button onClick={() => setOpen(false)} className="text-text-secondary text-xs px-1">✕</button>
    </div>
  )
}

export default function Dashboard({ fin }) {
  const { monthExpenses, monthIncomes, categoryBreakdown, monthTransactions, getCat, cards, deleteIncome, addIncome } = fin
  const totalExp = monthExpenses.reduce((s, t) => s + t.amount, 0)

  const catEntries = Object.entries(categoryBreakdown)
    .map(([id, total]) => ({ cat: getCat(id), total }))
    .sort((a, b) => b.total - a.total)

  const recent = [...monthTransactions].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gastos por Categoria */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold mb-4">Gastos por Categoria</h2>
        {catEntries.length === 0
          ? <Empty icon="📊" text="Nenhum gasto registrado neste mês" />
          : catEntries.map(({ cat, total }) => {
              const pct = totalExp > 0 ? (total / totalExp * 100) : 0
              const over = cat.budget > 0 && total > cat.budget
              return (
                <div key={cat.id || cat.name} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat.emoji} {cat.name}</span>
                    <span className={`font-semibold ${over ? 'text-expense' : ''}`}>
                      {fmt(total)}
                      {cat.budget > 0 && <span className="text-text-secondary font-normal text-xs"> / {fmt(cat.budget)}</span>}
                    </span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#C0392B' : cat.color }} />
                  </div>
                </div>
              )
            })}
      </div>

      {/* Últimos Lançamentos */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold mb-4">Últimos Lançamentos</h2>
        {recent.length === 0
          ? <Empty icon="📋" text="Sem lançamentos este mês" />
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary text-xs uppercase tracking-wider">
                    <th className="text-left pb-2">Descrição</th>
                    <th className="text-left pb-2">Categoria</th>
                    <th className="text-right pb-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(t => {
                    const cat = getCat(t.category)
                    return (
                      <tr key={t.id} className="border-t border-border hover:bg-surface-alt">
                        <td className="py-2 font-medium">{t.description}</td>
                        <td className="py-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.color + '22', color: cat.color }}>
                            {cat.emoji} {cat.name}
                          </span>
                        </td>
                        <td className={`py-2 text-right font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>}
      </div>

      {/* Receitas */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
          <h2 className="font-serif text-lg font-semibold">Receitas do Mês</h2>
          <IncomeForm onAdd={addIncome} />
        </div>
        {monthIncomes.length === 0
          ? <Empty icon="💰" text="Nenhuma receita registrada" />
          : monthIncomes.map(i => (
              <div key={i.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div>
                  <div className="font-medium text-sm">{i.description}</div>
                  <div className="text-xs text-text-secondary">{formatDate(i.date)}{i.recurrent ? ' · Recorrente' : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-income font-semibold text-sm">{fmt(i.amount)}</span>
                  <button onClick={() => deleteIncome(i.id)} className="text-text-secondary hover:text-expense transition-colors text-xs">✕</button>
                </div>
              </div>
            ))}
      </div>

      {/* Faturas dos Cartões */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold mb-4">Faturas dos Cartões</h2>
        {cards.length === 0
          ? <Empty icon="💳" text="Nenhum cartão cadastrado. Vá em Cartões para adicionar." />
          : cards.map(card => {
              const exp = monthExpenses.filter(t => t.payment === 'credito' && t.card === card.id)
              const total = exp.reduce((s, t) => s + t.amount, 0)
              const pct = card.limit > 0 ? (total / card.limit * 100) : 0
              const colors = card.color.split(',')
              const over = pct > 80
              return (
                <div key={card.id} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">💳 {card.name}</span>
                    <span className={`font-semibold ${over ? 'text-expense' : ''}`}>
                      {fmt(total)} <span className="text-text-secondary font-normal text-xs">/ {fmt(card.limit)}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#C0392B' : colors[0] }} />
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">Vence dia {card.due} · {exp.length} compra{exp.length !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
