import { useState } from 'react'
import { Plus, Trash2, X, Target } from 'lucide-react'

function fmt(n) { return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

function GoalForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')

  function save() {
    if (!name || !target) return
    onSave({ name, target: parseFloat(target), current: parseFloat(current) || 0, deadline })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-4 animate-slide-up shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-text">Nova Meta</h3>
        <button onClick={onCancel}><X className="w-4 h-4 text-text-muted" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome da Meta</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem, Reserva de emergência..."
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Valor Total (R$)</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="10000"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Já Guardado (R$)</label>
          <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0"
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Prazo</label>
          <input type="month" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-surface-alt transition-colors">Cancelar</button>
        <button onClick={save} className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">Criar Meta</button>
      </div>
    </div>
  )
}

export default function Metas({ fin }) {
  const [showForm, setShowForm] = useState(false)
  const [addingTo, setAddingTo] = useState(null)
  const [addValue, setAddValue] = useState('')
  const { goals, addGoal, updateGoal, deleteGoal } = fin

  function handleSave(goal) { addGoal(goal); setShowForm(false) }
  function handleAdd(goal) {
    const val = parseFloat(addValue)
    if (!val || val <= 0) return
    updateGoal(goal.id, { current: (goal.current || 0) + val })
    setAddingTo(null); setAddValue('')
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Nova Meta
          </button>
        )}
      </div>

      {showForm && <GoalForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {goals.length === 0 && !showForm
        ? <div className="text-center py-20 text-text-muted bg-surface rounded-2xl border border-border">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-text-secondary mb-1">Nenhuma meta criada</p>
            <p className="text-sm">Defina seus objetivos financeiros e acompanhe o progresso</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(g => {
              const pct = g.target > 0 ? Math.min((g.current || 0) / g.target * 100, 100) : 0
              const remaining = Math.max(g.target - (g.current || 0), 0)
              const isAdding = addingTo === g.id
              const done = pct >= 100
              return (
                <div key={g.id}
                  className={`bg-surface rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${done ? 'border-income/40 bg-income-light/20' : 'border-border border-l-4 border-l-primary-400'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-text flex items-center gap-2">
                      {done ? '✅' : '🎯'} {g.name}
                    </div>
                    <button onClick={() => { if(confirm('Remover meta?')) deleteGoal(g.id) }}
                      className="text-text-muted hover:text-expense p-1 rounded-lg hover:bg-expense-light transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-text-muted mb-3">
                    {fmt(g.current || 0)} de {fmt(g.target)}{g.deadline ? ` · Prazo: ${g.deadline.replace('-', '/')}` : ''}
                  </p>
                  <div className="h-2.5 bg-surface-alt rounded-full overflow-hidden border border-border mb-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className={`font-bold ${done ? 'text-income' : 'text-primary-600'}`}>{pct.toFixed(0)}%</span>
                    <span className="text-text-muted text-xs">{done ? 'Concluída! 🎉' : `Faltam ${fmt(remaining)}`}</span>
                  </div>

                  {!done && (isAdding
                    ? <div className="flex gap-2">
                        <input type="number" value={addValue} onChange={e => setAddValue(e.target.value)}
                          placeholder="Valor a guardar" autoFocus
                          className="flex-1 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400" />
                        <button onClick={() => handleAdd(g)} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors">✓</button>
                        <button onClick={() => setAddingTo(null)} className="border border-border px-2 rounded-xl hover:bg-surface-alt transition-colors"><X className="w-4 h-4 text-text-muted" /></button>
                      </div>
                    : <button onClick={() => { setAddingTo(g.id); setAddValue('') }}
                        className="w-full border border-border rounded-xl py-2 text-sm font-medium text-text-secondary hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Guardar dinheiro
                      </button>)}
                </div>
              )
            })}
          </div>}
    </div>
  )
}
