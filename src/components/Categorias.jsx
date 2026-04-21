import { useState } from 'react'
import { Plus, Trash2, X, Tag } from 'lucide-react'

function fmt(n) { return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

function CatForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [budget, setBudget] = useState('')
  const [color, setColor] = useState('#3b82f6')

  function save() {
    if (!name) return
    onSave({ name, emoji, budget: parseFloat(budget) || 0, color })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-slide-up shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text">Nova Categoria</h3>
        <button onClick={onCancel}><X className="w-4 h-4 text-text-muted" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pets, Streaming..."
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Emoji</label>
          <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm text-center text-xl outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Orçamento/mês (R$)</label>
          <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="500"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Cor</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="h-10 w-full rounded-xl cursor-pointer border border-border" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-surface-alt transition-colors">Cancelar</button>
        <button onClick={save} className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Salvar</button>
      </div>
    </div>
  )
}

export default function Categorias({ fin }) {
  const [showForm, setShowForm] = useState(false)
  const { categories, addCategory, deleteCategory, monthExpenses } = fin

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Lista */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-text">Categorias</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-xs border border-border px-3 py-1.5 rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors text-text-secondary">
              <Plus className="w-3.5 h-3.5" /> Nova
            </button>
          )}
        </div>
        {showForm && <CatForm onSave={cat => { addCategory(cat); setShowForm(false) }} onCancel={() => setShowForm(false)} />}
        <div className="divide-y divide-border">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: c.color + '20' }}>
                  {c.emoji}
                </div>
                <div>
                  <p className="font-medium text-sm text-text">{c.name}</p>
                  <p className="text-xs text-text-muted">Orçamento: {fmt(c.budget)}/mês</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <button onClick={() => { if(confirm(`Remover "${c.name}"?`)) deleteCategory(c.id) }}
                  className="p-1 rounded-lg p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense-light transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orçamento vs Realizado */}
      <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-base font-semibold text-text mb-4">Orçamento × Realizado</h2>
        <div className="space-y-4">
          {categories.map(c => {
            const spent = monthExpenses.filter(t => t.category === c.id).reduce((s, t) => s + t.amount, 0)
            const pct = c.budget > 0 ? (spent / c.budget * 100) : 0
            const over = pct > 100
            return (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-secondary">{c.emoji} {c.name}</span>
                  <span className={`font-semibold ${over ? 'text-expense' : 'text-text'}`}>
                    {fmt(spent)} <span className="text-text-muted font-normal text-xs">/ {fmt(c.budget)}</span>
                  </span>
                </div>
                <div className="h-2 bg-surface-alt rounded-full overflow-hidden border border-border">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(pct, 100)}%`, background: over ? '#ef4444' : c.color }} />
                </div>
                {over && <p className="text-xs text-expense mt-1">⚠ Acima do orçamento em {fmt(spent - c.budget)}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
