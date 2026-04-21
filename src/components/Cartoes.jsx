import { useState } from 'react'
import { Plus, Trash2, X, CreditCard } from 'lucide-react'

function fmt(n) { return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtDate(d) { if (!d) return '—'; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }

const CARD_COLORS = [
  { label: 'Azul', value: '#2563eb,#1d4ed8' },
  { label: 'Verde', value: '#059669,#047857' },
  { label: 'Roxo', value: '#7c3aed,#6d28d9' },
  { label: 'Rosa', value: '#db2777,#be185d' },
  { label: 'Preto', value: '#1e293b,#0f172a' },
  { label: 'Âmbar', value: '#d97706,#b45309' },
]

function CardForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const [due, setDue] = useState('')
  const [color, setColor] = useState(CARD_COLORS[0].value)

  function save() {
    if (!name || !limit || !due) return
    onSave({ name, limit: parseFloat(limit), due: parseInt(due), color })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-slide-up shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text">Novo Cartão</h3>
        <button onClick={onCancel} className="text-text-muted hover:text-text"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome do Cartão</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank, Itaú Gold..."
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Limite (R$)</label>
          <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Dia Vencimento</label>
          <input type="number" value={due} onChange={e => setDue(e.target.value)} placeholder="10" min="1" max="31"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Cor</label>
          <div className="flex gap-2.5">
            {CARD_COLORS.map(c => {
              const [c1] = c.value.split(',')
              return (
                <button key={c.value} onClick={() => setColor(c.value)} title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-text scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ background: c1 }} />
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-surface-alt transition-colors">Cancelar</button>
        <button onClick={save} className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Salvar Cartão</button>
      </div>
    </div>
  )
}

export default function Cartoes({ fin }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const { cards, addCard, deleteCard, monthExpenses, getCat, deleteTransaction } = fin

  function handleSave(card) { addCard(card); setShowForm(false) }

  const cardExpenses = selectedCard ? monthExpenses.filter(t => t.payment === 'credito' && t.card === selectedCard) : []
  const selectedCardData = cards.find(c => c.id === selectedCard)

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Novo Cartão
          </button>
        )}
      </div>

      {showForm && <CardForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {cards.length === 0 && !showForm
        ? <div className="text-center py-20 text-text-muted bg-surface rounded-2xl border border-border">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-text-secondary mb-1">Nenhum cartão cadastrado</p>
            <p className="text-sm">Adicione seus cartões para controlar as faturas</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cards.map(card => {
              const exp = monthExpenses.filter(t => t.payment === 'credito' && t.card === card.id)
              const total = exp.reduce((s, t) => s + t.amount, 0)
              const pct = card.limit > 0 ? (total / card.limit * 100) : 0
              const colors = card.color.split(',')
              const isSelected = selectedCard === card.id
              return (
                <div key={card.id} onClick={() => setSelectedCard(isSelected ? null : card.id)}
                  className={`relative rounded-2xl p-5 text-white cursor-pointer transition-all duration-300 min-h-44 flex flex-col justify-between shadow-lg ${isSelected ? 'ring-4 ring-white/60 scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                  style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 right-6 w-20 h-20 rounded-full bg-white/[0.07]" />
                  <div className="relative">
                    <p className="text-xs opacity-70 mb-1 font-medium tracking-wide uppercase">{card.name}</p>
                    <p className="text-3xl font-bold tracking-tight">{fmt(total)}</p>
                    <p className="text-xs opacity-60 mt-0.5">de {fmt(card.limit)} de limite</p>
                  </div>
                  <div className="relative">
                    <div className="h-1 bg-white/20 rounded-full mb-2.5 overflow-hidden">
                      <div className="h-full bg-white/70 rounded-full" style={{ width: `${Math.min(pct,100)}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-70">Vence dia {card.due} · {exp.length} compras</span>
                      <button onClick={e => { e.stopPropagation(); if(confirm('Remover cartão?')) deleteCard(card.id) }}
                        className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>}

      {/* Card Detail */}
      {selectedCard && (
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden animate-slide-up">
          <div className="flex justify-between items-center px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-text">Lançamentos — {selectedCardData?.name}</h2>
            <button onClick={() => setSelectedCard(null)}
              className="text-text-muted hover:text-text border border-border px-3 py-1 rounded-xl text-sm flex items-center gap-1 hover:bg-surface-alt transition-colors">
              <X className="w-3.5 h-3.5" /> Fechar
            </button>
          </div>

          {cardExpenses.length === 0
            ? <div className="text-center py-12 text-text-muted"><p className="text-sm">Nenhum lançamento neste mês</p></div>
            : <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-muted text-xs uppercase tracking-wider bg-surface-alt">
                        <th className="text-left px-4 py-3">Data</th>
                        <th className="text-left px-4 py-3">Descrição</th>
                        <th className="text-left px-4 py-3">Categoria</th>
                        <th className="text-left px-4 py-3">Parcelas</th>
                        <th className="text-right px-4 py-3">Total Compra</th>
                        <th className="text-right px-4 py-3">Parcela/Mês</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cardExpenses.map(t => {
                        const cat = getCat(t.category)
                        const totalCompra = t.installments > 1 ? t.amount * t.installments : t.amount
                        return (
                          <tr key={t.id} className="hover:bg-surface-alt transition-colors group">
                            <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{fmtDate(t.date)}</td>
                            <td className="px-4 py-3 font-medium text-text">{t.description}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-medium"
                                style={{ background: cat.color + '20', color: cat.color }}>
                                {cat.emoji} {cat.name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {t.installments > 1
                                ? <span className="bg-gold-light text-amber-700 px-2 py-0.5 rounded-lg text-xs font-medium">📅 {t.installment}/{t.installments}</span>
                                : <span className="text-text-muted text-xs">à vista</span>}
                            </td>
                            <td className="px-4 py-3 text-right text-expense font-semibold">{fmt(totalCompra)}</td>
                            <td className="px-4 py-3 text-right font-bold text-text">{fmt(t.amount)}</td>
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
                    <tfoot>
                      <tr className="border-t-2 border-border bg-surface-alt">
                        <td colSpan={5} className="px-4 py-3 font-semibold text-text-secondary text-sm">Total da fatura</td>
                        <td className="px-4 py-3 text-right font-bold text-expense text-base">{fmt(cardExpenses.reduce((s,t) => s+t.amount, 0))}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>}
        </div>
      )}
    </div>
  )
}
