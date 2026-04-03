import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Info,
} from 'lucide-react'

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatCompact(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toFixed(0)
}

// Tooltip customizado para o gráfico
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-md border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-text mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-semibold text-text">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
      {payload.length >= 2 && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary">Resultado:</span>
            <span
              className={`font-bold ${
                (payload[0]?.value || 0) - (payload[1]?.value || 0) >= 0
                  ? 'text-income'
                  : 'text-expense'
              }`}
            >
              {formatCurrency(
                (payload[0]?.value || 0) - (payload[1]?.value || 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MonthlyOverview({
  availableYears,
  getYearData,
  closingDay,
}) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const yearData = useMemo(
    () => getYearData(selectedYear),
    [selectedYear, getYearData]
  )

  // Totais do ano
  const yearTotals = useMemo(() => {
    const income = yearData.reduce((s, m) => s + m.income, 0)
    const expense = yearData.reduce((s, m) => s + m.expense, 0)
    const invest = yearData.reduce((s, m) => s + m.invest, 0)
    return { income, expense, invest, net: income - expense }
  }, [yearData])

  // Dados para o gráfico
  const chartData = useMemo(
    () =>
      yearData.map((m) => ({
        name: m.label,
        Entradas: m.income,
        Saídas: m.expense,
        Investimentos: m.invest,
        resultado: m.income - m.expense,
      })),
    [yearData]
  )

  function prevYear() {
    setSelectedYear((y) => y - 1)
  }

  function nextYear() {
    setSelectedYear((y) => y + 1)
  }

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text">
                Visão Anual
              </h2>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <Info className="w-3 h-3" />
                Fechamento de fatura: dia {closingDay}
              </p>
            </div>
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevYear}
              className="p-2 rounded-xl hover:bg-surface-alt text-text-secondary hover:text-text transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-bold text-text min-w-[60px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={nextYear}
              className="p-2 rounded-xl hover:bg-surface-alt text-text-secondary hover:text-text transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Year summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-income-light/50 rounded-xl px-3 py-2.5 border border-income/10">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="w-3 h-3 text-income" />
              <span className="text-[10px] font-medium text-income-dark uppercase tracking-wider">
                Entradas
              </span>
            </div>
            <p className="text-sm font-bold text-income">
              {formatCurrency(yearTotals.income)}
            </p>
          </div>
          <div className="bg-expense-light/50 rounded-xl px-3 py-2.5 border border-expense/10">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownRight className="w-3 h-3 text-expense" />
              <span className="text-[10px] font-medium text-expense-dark uppercase tracking-wider">
                Saídas
              </span>
            </div>
            <p className="text-sm font-bold text-expense">
              {formatCurrency(yearTotals.expense)}
            </p>
          </div>
          <div className="bg-invest-light/50 rounded-xl px-3 py-2.5 border border-invest/10">
            <div className="flex items-center gap-1.5 mb-1">
              <PiggyBank className="w-3 h-3 text-invest" />
              <span className="text-[10px] font-medium text-invest-dark uppercase tracking-wider">
                Investido
              </span>
            </div>
            <p className="text-sm font-bold text-invest">
              {formatCurrency(yearTotals.invest)}
            </p>
          </div>
          <div
            className={`rounded-xl px-3 py-2.5 border ${
              yearTotals.net >= 0
                ? 'bg-income-light/30 border-income/10'
                : 'bg-expense-light/30 border-expense/10'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              {yearTotals.net >= 0 ? (
                <TrendingUp className="w-3 h-3 text-income" />
              ) : (
                <TrendingDown className="w-3 h-3 text-expense" />
              )}
              <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
                Resultado
              </span>
            </div>
            <p
              className={`text-sm font-bold ${
                yearTotals.net >= 0 ? 'text-income' : 'text-expense'
              }`}
            >
              {formatCurrency(yearTotals.net)}
            </p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="px-6 pt-6 pb-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
              barGap={2}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompact}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="Entradas"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Saídas"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Investimentos"
                fill="var(--color-invest)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly detail table */}
      <div className="px-6 pb-6 pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Mês
                </th>
                <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Entradas
                </th>
                <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Saídas
                </th>
                <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Investido
                </th>
                <th className="pb-3 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {yearData.map((m) => {
                const net = m.income - m.expense
                const hasData = m.income > 0 || m.expense > 0 || m.invest > 0
                const isCurrent =
                  m.year === currentYear && m.month === currentMonth

                return (
                  <tr
                    key={m.key}
                    className={`
                      transition-colors duration-150
                      ${isCurrent ? 'bg-primary-50/50' : 'hover:bg-surface-alt'}
                      ${!hasData ? 'opacity-40' : ''}
                    `}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        )}
                        <span
                          className={`font-medium ${
                            isCurrent ? 'text-primary-600' : 'text-text'
                          }`}
                        >
                          {m.labelFull}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-income font-medium">
                        {hasData ? formatCurrency(m.income) : '—'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-expense font-medium">
                        {hasData ? formatCurrency(m.expense) : '—'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-invest font-medium">
                        {hasData ? formatCurrency(m.invest) : '—'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {hasData ? (
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            net >= 0 ? 'text-income' : 'text-expense'
                          }`}
                        >
                          {net >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {formatCurrency(net)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Footer com totais */}
            <tfoot>
              <tr className="border-t-2 border-primary-200">
                <td className="py-3 pr-4 font-bold text-text">
                  Total {selectedYear}
                </td>
                <td className="py-3 text-right font-bold text-income">
                  {formatCurrency(yearTotals.income)}
                </td>
                <td className="py-3 text-right font-bold text-expense">
                  {formatCurrency(yearTotals.expense)}
                </td>
                <td className="py-3 text-right font-bold text-invest">
                  {formatCurrency(yearTotals.invest)}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      yearTotals.net >= 0 ? 'text-income' : 'text-expense'
                    }`}
                  >
                    {yearTotals.net >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {formatCurrency(yearTotals.net)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
