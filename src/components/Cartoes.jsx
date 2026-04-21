import { useState } from 'react'
import { fmt, formatDate } from '../utils'

const CARD_COLORS = [
  { label: 'Verde', value: '#2D6A4F,#52B788' },
  { label: 'Preto', value: '#1A1A2E,#16213E' },
  { label: 'Roxo', value: '#6C1FCF,#9B59B6' },
  { label: 'Vermelho', value: '#C0392B,#E74C3C' },
  { label: 'Azul', value: '#1A5276,#2E86C1' },
  { label: 'Dourado', value: '#784212,#CA6F1E' },
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
    <div className="bg-surface-alt rounded-2xl p-5 border border-border mb-4 animate-slide-up">
      <h3 className="font-semibold mb-4">Novo Cartão</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome do Cartão</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank, Itaú..."
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Limite (R$)</label>
          <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Dia Vencimento</label>
          <input type="number" value={due} onChange={e => setDue(e.target.value)} placeholder="10" min="1" max="31"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Cor</label>
          <div className="flex gap-2">
            {CARD_COLORS.map(c => {
              const [c1] = c.value.split(',')
              return (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-text scale-110' : 'border-transparent'}`}
                  style={{ background: c1 }} title={c.label} />
              )
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2 text-sm font-medium hover:border-text transition-colors">Cancelar</button>
        <button onClick={save} className="flex-2 bg-income text-white rounded-xl py-2 px-6 text-sm font-semibold hover:bg-income-light transition-colors">Salvar</button>
      </div>
    </div>
  )
}

export default function Cartoes({ fin }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const { cards, addCard, deleteCard, monthExpenses, getCat } = fin

  function handleSave(card) {
    addCard(card)
    setShowForm(false)
  }

  const cardExpenses = selectedCard
    ? monthExpenses.filter(t => t.payment === 'credito' && t.card === selectedCard)
    : []

  const selectedCardData = cards.find(c => c.id === selectedCard)

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-income-light hover:bg-income text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Novo Cartão
          </button>
        )}
      </div>

      {showForm && <CardForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {cards.length === 0 && !showForm
        ? <div className="text-center py-20 text-text-secondary">
            <div className="text-5xl mb-3">💳</div>
            <p className="font-medium mb-1">Nenhum cartão cadastrado</p>
            <p className="text-sm">Adicione seus cartões de crédito para controlar as faturas</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {cards.map(card => {
              const exp = monthExpenses.filter(t => t.payment === 'credito' && t.card === card.id)
              const total = exp.reduce((s, t) => s + t.amount, 0)
              const pct = card.limit > 0 ? (total / card.limit * 100) : 0
              const colors = card.color.split(',')
              const isSelected = selectedCard === card.id
              return (
                <div key={card.id}
                  onClick={() => setSelectedCard(isSelected ? null : card.id)}
                  className={`relative rounded-2xl p-5 text-white cursor-pointer transition-all min-h-44 flex flex-col justify-between ${isSelected ? 'ring-4 ring-white/50 scale-[1.02]' : 'hover:-translate-y-1'}`}
                  style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
                  {/* decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 right-8 w-20 h-20 rounded-full bg-white/07" />
                  <div className="relative">
                    <div className="text-sm opacity-80 mb-1">{card.name}</div>
                    <div className="text-3xl font-bold font-serif">{fmt(total)}</div>
                    <div className="text-xs opacity-70">de {fmt(card.limit)} de limite</div>
                  </div>
                  <div className="relative">
                    <div className="h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-white/70 rounded-full" style={{ width: `${Math.min(pct,100)}%` }} />
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs opacity-80">Vence dia {card.due} · {exp.length} compras</span>
                      <button onClick={e => { e.stopPropagation(); if(confirm('Remover cartão?')) deleteCard(card.id) }}
                        className="text-white/60 hover:text-white text-xs transition-colors">🗑</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>}

      {/* Card transactions detail */}
      {selectedCard && (
        <div className="bg-surface rounded-2xl p-5 shadow-sm animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-lg font-semibold">Lançamentos — {selectedCardData?.name}</h2>
            <button onClick={() => setSelectedCard(null)} className="text-text-secondary hover:text-text text-sm border border-border px-3 py-1 rounded-lg">✕ Fechar</button>
          </div>

          {cardExpenses.length === 0
            ? <div className="text-center py-10 text-text-secondary"><div className="text-3xl mb-2">📭</div><p className="text-sm">Nenhum lançamento neste mês</p></div>
            : <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-border">
                      <th className="text-left py-2 pr-3">Data</th>
                      <th className="text-left py-2 pr-3">Descrição</th>
                      <th className="text-left py-2 pr-3">Categoria</th>
                      <th className="text-left py-2 pr-3">Parcelas</th>
                      <th className="text-right py-2 pr-3">Valor Total</th>
                      <th className="text-right py-2 pr-3">Parcela/Mês</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardExpenses.map(t => {
                      const cat = getCat(t.category)
                      const totalCompra = t.installments > 1 ? t.amount * t.installments : t.amount
                      return (
                        <tr key={t.id} className="border-b border-border hover:bg-surface-alt group">
                          <td className="py-2.5 pr-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(t.date)}</td>
                          <td className="py-2.5 pr-3 font-medium">{t.description}</td>
                          <td className="py-2.5 pr-3">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.color + '22', color: cat.color }}>
                              {cat.emoji} {cat.name}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3">
                            {t.installments > 1
                              ? <span className="bg-gold-pale text-yellow-700 px-2 py-0.5 rounded text-xs">📅 {t.installment}/{t.installments}</span>
                              : <span className="text-xs text-text-secondary">à vista</span>}
                          </td>
                          <td className="py-2.5 pr-3 text-right text-expense font-semibold">{fmt(totalCompra)}</td>
                          <td className="py-2.5 pr-3 text-right font-semibold">{fmt(t.amount)}</td>
                          <td className="py-2.5">
                            <button onClick={() => fin.deleteTransaction(t.id)}
                              className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-expense transition-all">🗑</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td colSpan={5} className="pt-3 font-semibold text-sm">Total da Fatura</td>
                      <td className="pt-3 text-right font-bold text-expense">{fmt(cardExpenses.reduce((s,t) => s+t.amount, 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>}
        </div>
      )}
    </div>
  )
}
