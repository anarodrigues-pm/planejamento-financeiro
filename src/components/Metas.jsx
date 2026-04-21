import { useState } from 'react'
import { fmt } from '../utils'

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
    <div className="bg-surface-alt border border-border rounded-2xl p-5 mb-4 animate-slide-up">
      <h3 className="font-semibold mb-4">Nova Meta</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Nome da Meta</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem, Reserva de emergência..."
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Valor Total (R$)</label>
          <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="10000"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Já Guardado (R$)</label>
          <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">Prazo</label>
          <input type="month" value={deadline} onChange={e => setDeadline(e.target.value)}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-income-light" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="flex-1 border border-border rounded-xl py-2 text-sm font-medium hover:border-text transition-colors">Cancelar</button>
        <button onClick={save} className="flex-2 bg-income text-white rounded-xl py-2 px-6 text-sm font-semibold hover:bg-income-light transition-colors">Criar Meta</button>
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
          <button onClick={() => setShowForm(true)} className="bg-income-light hover:bg-income text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Nova Meta
          </button>
        )}
      </div>

      {showForm && <GoalForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {goals.length === 0 && !showForm
        ? <div className="text-center py-20 text-text-secondary">
            <div className="text-5xl mb-3">🎯</div>
            <p className="font-medium mb-1">Nenhuma meta criada</p>
            <p className="text-sm">Defina seus objetivos financeiros e acompanhe o progresso</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map(g => {
              const pct = g.target > 0 ? Math.min((g.current || 0) / g.target * 100, 100) : 0
              const remaining = Math.max(g.target - (g.current || 0), 0)
              const isAdding = addingTo === g.id
              return (
                <div key={g.id} className="bg-surface rounded-2xl p-5 shadow-sm border-l-4 border-income-light hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold">🎯 {g.name}</div>
                    <button onClick={() => { if(confirm('Remover meta?')) deleteGoal(g.id) }}
                      className="text-text-secondary hover:text-expense transition-colors text-sm">🗑</button>
                  </div>
                  <div className="text-xs text-text-secondary mb-3">
                    {fmt(g.current || 0)} de {fmt(g.target)}{g.deadline ? ` · Prazo: ${g.deadline.replace('-', '/')}` : ''}
                  </div>
                  <div className="h-2.5 bg-border rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-income-light transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-income font-bold">{pct.toFixed(0)}%</span>
                    <span className="text-text-secondary text-xs">Faltam {fmt(remaining)}</span>
                  </div>

                  {isAdding
                    ? <div className="flex gap-2">
                        <input type="number" value={addValue} onChange={e => setAddValue(e.target.value)}
                          placeholder="Valor a guardar" autoFocus
                          className="flex-1 border border-border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-income-light" />
                        <button onClick={() => handleAdd(g)} className="bg-income text-white px-3 py-1.5 rounded-lg text-sm font-semibold">✓</button>
                        <button onClick={() => setAddingTo(null)} className="text-text-secondary px-2 text-sm">✕</button>
                      </div>
                    : <button onClick={() => { setAddingTo(g.id); setAddValue('') }}
                        className="w-full border border-border rounded-lg py-1.5 text-sm font-medium text-text-secondary hover:border-income hover:text-income transition-colors">
                        + Guardar dinheiro
                      </button>}
                </div>
              )
            })}
          </div>}
    </div>
  )
}
