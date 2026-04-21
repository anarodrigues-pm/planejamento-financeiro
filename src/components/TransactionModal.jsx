import { useState, useEffect } from 'react'

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
    if (categories.length > 0 && !category) setCategory(categories[0].id)
    if (cards.length > 0 && !cardId) setCardId(cards[0]?.id || '')
  }, [categories, cards])

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
    <div className="fixed inset-0 bg-text/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slide-up">
        <h2 className="font-serif text-2xl font-semibold mb-5">Novo Lançamento</h2>

        {/* Type toggle */}
        <div className="flex bg-surface-alt rounded-xl p-1 gap-1 mb-5">
          {[['expense', '💸 Despesa'], ['income', '💰 Receita']].map(([val, label]) => (
            <button key={val} onClick={() => { setType(val); setPayment('pix') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === val ? 'bg-surface shadow text-text' : 'text-text-secondary'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Descrição</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Mercado, Salário..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Valor (R$)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" step="0.01" min="0"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light" />
            </div>
          </div>

          {type === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Categoria</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light bg-white">
                    {fin.categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Pagamento</label>
                  <select value={payment} onChange={e => setPayment(e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light bg-white">
                    <option value="pix">PIX / Transferência</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
              </div>

              {payment === 'credito' && (
                <div className="grid grid-cols-2 gap-3 bg-gold-pale rounded-xl p-3">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Cartão</label>
                    {cards.length > 0
                      ? <select value={cardId} onChange={e => setCardId(e.target.value)}
                          className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light bg-white">
                          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      : <p className="text-xs text-text-secondary mt-1">Nenhum cartão cadastrado</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Parcelas</label>
                    <select value={installments} onChange={e => setInstallments(e.target.value)}
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light bg-white">
                      {Array.from({length: 12}, (_, i) => i+1).map(n => (
                        <option key={n} value={n}>{n === 1 ? '1x (à vista)' : `${n}x de ${amount ? 'R$ ' + (parseFloat(amount)/n).toFixed(2) : '—'}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Observação (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais..."
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-income-light resize-none" />
          </div>
        </div>

        {error && <p className="text-expense text-xs mt-2">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:border-text transition-colors">Cancelar</button>
          <button onClick={save} className="flex-[2] bg-income hover:bg-income-light text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Salvar Lançamento</button>
        </div>
      </div>
    </div>
  )
}
