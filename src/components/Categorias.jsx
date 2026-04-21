import { useState } from 'react'
import { fmt } from '../utils'

function CatForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [budget, setBudget] = useState('')
  const [color, setColor] = useState('#52B788')

  function save() {
    if (!name) return
    onSave({ name, emoji, budget: parseFloat(budget) || 0, color })
  }

  return (
    <div className="bg-surface-alt border border-border rounded-2xl p-5 mb-4 animate-slide-up">
      <h3 className="font-semibold mb-4">Nova Categoria</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pets, Streaming..."
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Emoji</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Orçamento Mensal (R$)</label>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="500"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Cor</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="h-10 w-full rounded-xl cursor-pointer border border-border" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2 text-sm font-medium hover:border-text transition-colors">Cancelar</button>
        <button onClick={save} className="flex-2 bg-income text-white rounded-xl py-2 px-6 text-sm font-semibold hover:bg-income-light transition-colors">Salvar</button>
      </div>
    </div>
  )
}

export default function Categorias({ fin }) {
  const [showForm, setShowForm] = useState(false)
  const { categories, addCategory, deleteCategory, monthExpenses } = fin

  function handleSave(cat) { addCategory(cat); setShowForm(false) }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Lista */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-lg font-semibold">Categorias</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-income hover:text-income transition-colors">
              + Nova
            </button>
          )}
        </div>
        {showForm && <CatForm onSave={handleSave} onCancel={() => setShowForm(false)} />}
        <div>
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-text-secondary">Orçamento: {fmt(c.budget)}/mês</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }} />
                <button onClick={() => { if(confirm(`Remover "${c.name}"?`)) deleteCategory(c.id) }}
                  className="text-text-secondary hover:text-expense transition-colors text-sm">🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orçamento vs Realizado */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold mb-4">Orçamento × Realizado</h2>
        {categories.map(c => {
          const spent = monthExpenses.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0)
          const pct = c.budget > 0 ? (spent / c.budget * 100) : 0
          const over = pct > 100
          return (
            <div key={c.id} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{c.emoji} {c.name}</span>
                <span className={`font-semibold ${over ? 'text-expense' : ''}`}>
                  {fmt(spent)} <span className="text-text-secondary font-normal text-xs">/ {fmt(c.budget)}</span>
                </span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#C0392B' : c.color }} />
              </div>
              {over && <div className="text-xs text-expense mt-0.5">⚠ Acima do orçamento em {fmt(spent - c.budget)}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
