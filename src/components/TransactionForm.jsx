import { useState } from 'react'
import { Plus, CalendarDays, DollarSign, Tag, FileText, ChevronDown } from 'lucide-react'

const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Rendimentos', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Outros'],
  invest: ['Renda Fixa', 'Ações', 'Criptomoedas', 'Reserva de Emergência'],
}

const TYPE_LABELS = {
  income: 'Entrada',
  expense: 'Saída',
  invest: 'Investimento',
}

const TYPE_COLORS = {
  income: 'bg-income text-white',
  expense: 'bg-expense text-white',
  invest: 'bg-invest text-white',
}

const initialForm = {
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'income',
  category: 'Salário',
}

export default function TransactionForm({ onAdd }) {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleTypeChange(type) {
    setForm(prev => ({
      ...prev,
      type,
      category: CATEGORIES[type][0],
    }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || !form.date) return

    setIsSubmitting(true)

    setTimeout(() => {
      onAdd({
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        date: form.date,
        type: form.type,
        category: form.category,
      })

      setForm({
        ...initialForm,
        type: form.type,
        category: CATEGORIES[form.type][0],
      })
      setIsSubmitting(false)
    }, 200)
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <Plus className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">Nova Transação</h2>
          <p className="text-xs text-text-muted">Registre suas movimentações</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-2 block">
            Tipo
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeChange(type)}
                className={`
                  py-2.5 px-3 rounded-xl text-sm font-medium
                  transition-all duration-200 border-2
                  ${
                    form.type === type
                      ? `${TYPE_COLORS[type]} border-transparent shadow-md scale-[1.02]`
                      : 'bg-surface-alt border-border text-text-secondary hover:border-primary-200'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            Descrição
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Salário mensal"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt
                text-sm text-text placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                transition-all duration-200"
            />
          </div>
        </div>

        {/* Amount + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Valor (R$)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt
                  text-sm text-text placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                  transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Data
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-alt
                  text-sm text-text
                  focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                  transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            Categoria
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-surface-alt
                text-sm text-text appearance-none
                focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
                transition-all duration-200"
            >
              {CATEGORIES[form.type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700
            text-white text-sm font-semibold
            hover:from-primary-600 hover:to-primary-800
            active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-200 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? 'Salvando...' : 'Adicionar Transação'}
        </button>
      </form>
    </div>
  )
}
