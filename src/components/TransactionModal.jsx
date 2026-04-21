import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function TransactionModal({ fin, initialType = 'expense', onClose }) {
  const [type, setType] = useState(initialType)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [category, setCategory] = useState('')
  const [payment, setPayment] = useState('pix')
  const [cardId, setCardId] = useState('')
  const [installments, setInstallments] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const { categories, cards, addTransaction } = fin

  useEffect(() => {
    if (categories.length > 0) setCategory(categories[0].id)
    if (cards.length > 0) setCardId(cards[0]?.id || '')
  }, [])

  async function save() {
    if (!desc.trim() || !amount || !date) { setError('Preencha descrição, valor e data'); return }
    await addTransaction({
      type,
      description: desc.trim(),
      amount: parseFloat(amount),
      date,
      category: type === 'expense' ? category : '',
      payment: type === 'expense' ? payment : 'pix',
      card: payment === 'credito' ? cardId : '',
      installments: payment === 'credito' ? parseInt(installments) : 1,
      notes: notes.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-text/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl animate-slide-up border border-border overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-text">Novo Lançamento</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1 rounded-lg hover:bg-surface-alt transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex bg-surface-alt rounded-xl p-1 gap-1">
            {[['expense', '💸 Despesa'], ['income', '💰 Receita']].map(([val, label]) => (
              <button key={val} onClick={() => { setType(val); setPayment('pix') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === val ? 'bg-surface shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}>
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Descrição</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Mercado, Salário..."
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 transition-colors" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Valor (R$)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" step="0.01" min="0"
                className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400" />
            </div>
          </div>

          {type === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Pagamento</label>
                  <select value={payment} onChange={e => setPayment(e.target.value)}
                    className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 bg-white">
                    <option value="pix">PIX / Transferência</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
              </div>

              {payment === 'credito' && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Detalhes do Crédito</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Cartão</label>
                      {cards.length > 0
                        ? <select value={cardId} onChange={e => setCardId(e.target.value)}
                            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white">
                            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        : <p className="text-xs text-text-muted p-2 bg-surface rounded-lg border border-border">Nenhum cartão cadastrado</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Parcelas</label>
                      <select value={installments} onChange={e => setInstallments(e.target.value)}
                        className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white">
                        {Array.from({length: 12}, (_, i) => i+1).map(n => (
                          <option key={n} value={n}>
                            {n === 1 ? '1x (à vista)' : `${n}x${amount ? ` de R$ ${(parseFloat(amount)/n).toFixed(2)}` : ''}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {amount && parseInt(installments) > 1 && (
                    <p className="text-xs text-amber-700 font-medium">
                      💳 {installments}x de R$ {(parseFloat(amount)/parseInt(installments)).toFixed(2)} · total R$ {parseFloat(amount).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1.5">Observação (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais..."
              className="w-full border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary-400 resize-none" />
          </div>

          {error && <p className="text-expense text-xs font-medium">{error}</p>}
        </div>

        <div className="flex gap-2 px-6 py-4 border-t border-border bg-surface-alt">
          <button onClick={onClose} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-surface transition-colors">Cancelar</button>
          <button onClick={save} className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors shadow-sm">
            Salvar Lançamento
          </button>
        </div>
      </div>
    </div>
  )
}
