import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#a78bfa',
  '#f43f5e', '#fb923c', '#fbbf24',
  '#34d399', '#22d3ee',
]

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const data = payload[0]
  return (
    <div className="bg-white/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-text">{data.name}</p>
      <p className="text-sm text-text-secondary mt-0.5">{formatCurrency(data.value)}</p>
    </div>
  )
}

function CustomLegend({ payload }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  )
}

export default function ExpenseChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm animate-fade-in-up h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-invest-light flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-invest" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">Saídas por Categoria</h2>
          <p className="text-xs text-text-muted">
            {data.length > 0
              ? `Total: ${formatCurrency(total)}`
              : 'Registre saídas para visualizar'}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[260px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-alt mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">
              Nenhuma saída registrada ainda.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    className="hover:opacity-80 transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
