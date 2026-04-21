import { useState } from 'react'
import { fmt, formatDate } from '../utils'

export default function Lancamentos({ fin, onAdd }) {
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const { monthTransactions, monthExpenses, monthIncomes, getCat, getCard, deleteTransaction, categories } = fin

  let items = [...monthTransactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  if (filterType === 'expense') items = items.filter(t => t.type === 'expense')
  if (filterType === 'income') items = items.filter(t => t.type === 'income')
  if (filterCat) items = items.filter(t => t.category === filterCat)

  const payLabel = { pix: 'PIX', dinheiro: 'Dinheiro', debito: 'Débito', credito: 'Crédito' }

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <h2 className="font-serif text-lg font-semibold">Todos os Lançamentos</h2>
        <div className="flex flex-wrap gap-2">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-text bg-white">
            <option value="">Todos os tipos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm text-text bg-white">
            <option value="">Todas categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
          <button onClick={onAdd} className="bg-income-light hover:bg-income text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors">
            + Novo
          </button>
        </div>
      </div>

      {items.length === 0
        ? <div className="text-center py-16 text-text-secondary">
            <div className="text-4xl mb-2">📭</div>
            <p>Nenhum lançamento encontrado</p>
          </div>
        : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 pr-3">Data</th>
                  <th className="text-left py-2 pr-3">Descrição</th>
                  <th className="text-left py-2 pr-3">Categoria</th>
                  <th className="text-left py-2 pr-3">Pagamento</th>
                  <th className="text-left py-2 pr-3">Parcela</th>
                  <th className="text-right py-2 pr-3">Valor</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(t => {
                  const cat = getCat(t.category)
                  const card = t.card ? getCard(t.card) : null
                  const pgto = t.payment === 'credito' && card ? `💳 ${card.name}` : (payLabel[t.payment] || t.payment)
                  return (
                    <tr key={t.id} className="border-b border-border hover:bg-surface-alt group">
                      <td className="py-2.5 pr-3 text-text-secondary text-xs whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{t.description}</div>
                        {t.notes && <div className="text-xs text-text-secondary">{t.notes}</div>}
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: cat.color + '22', color: cat.color }}>
                          {cat.emoji} {cat.name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-text-secondary whitespace-nowrap">{pgto}</td>
                      <td className="py-2.5 pr-3 text-xs text-text-secondary">
                        {t.installments > 1 ? (
                          <span className="bg-gold-pale text-yellow-700 px-1.5 py-0.5 rounded text-xs">
                            {t.installment}/{t.installments}
                          </span>
                        ) : '—'}
                      </td>
                      <td className={`py-2.5 pr-3 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="py-2.5">
                        <button onClick={() => deleteTransaction(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-expense transition-all text-base">
                          🗑
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
