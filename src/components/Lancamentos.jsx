import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

function fmt(n) { return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(d) { if (!d) return '—'; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }

export default function Lancamentos({ fin, onAdd }) {
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const { monthTransactions, getCat, getCard, deleteTransaction, categories } = fin

  let items = [...monthTransactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  if (filterType) items = items.filter(t => t.type === filterType)
  if (filterCat) items = items.filter(t => t.category === filterCat)

  const payLabel = { pix: 'PIX', dinheiro: 'Dinheiro', debito: 'Débito', credito: 'Crédito' }

  const totalExpense = items.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const totalIncome = items.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center p-5 border-b border-border">
        <h2 className="text-base font-semibold text-text">Todos os Lançamentos</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-border rounded-xl px-3 py-1.5 text-sm text-text bg-white outline-none focus:border-primary-400">
            <option value="">Todos os tipos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="border border-border rounded-xl px-3 py-1.5 text-sm text-text bg-white outline-none focus:border-primary-400">
            <option value="">Todas categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <button onClick={onAdd}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
      </div>

      {/* Totals */}
      {items.length > 0 && (
        <div className="flex gap-6 px-5 py-3 bg-surface-alt border-b border-border text-sm">
          <span className="text-text-secondary">{items.length} registro{items.length !== 1 ? 's' : ''}</span>
          {totalIncome > 0 && <span className="text-income font-semibold">Entradas: {fmt(totalIncome)}</span>}
          {totalExpense > 0 && <span className="text-expense font-semibold">Saídas: {fmt(totalExpense)}</span>}
        </div>
      )}

      {/* Table */}
      {items.length === 0
        ? <div className="text-center py-16 text-text-muted">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">Nenhum lançamento encontrado</p>
          </div>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted text-xs uppercase tracking-wider bg-surface-alt">
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Pagamento</th>
                  <th className="text-left px-4 py-3">Parcela</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(t => {
                  const cat = getCat(t.category)
                  const card = t.card ? getCard(t.card) : null
                  const pgto = t.payment === 'credito' && card ? `💳 ${card.name}` : (payLabel[t.payment] || t.payment)
                  return (
                    <tr key={t.id} className="hover:bg-surface-alt transition-colors group">
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">{fmtDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{t.description}</p>
                        {t.notes && <p className="text-xs text-text-muted mt-0.5">{t.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {t.category ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-medium"
                            style={{ background: cat.color + '20', color: cat.color }}>
                            {cat.emoji} {cat.name}
                          </span>
                        ) : <span className="text-text-muted text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{pgto || '—'}</td>
                      <td className="px-4 py-3">
                        {t.installments > 1
                          ? <span className="bg-gold-light text-amber-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                              {t.installment}/{t.installments}
                            </span>
                          : <span className="text-text-muted text-xs">—</span>}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteTransaction(t.id)}
                          className="p-1 rounded-lg p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense-light transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>}
    </div>
  )
}
