import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import TransactionTable from './components/TransactionTable'
import ExpenseChart from './components/ExpenseChart'
import MonthlyOverview from './components/MonthlyOverview'
import { useTransactions } from './hooks/useTransactions'
import { Loader2 } from 'lucide-react'

export default function App() {
  const {
    transactions,
    loading,
    isCloud,
    cloudError,
    currentCycle,
    expenseByCategory,
    availableYears,
    getYearData,
    addTransaction,
    deleteTransaction,
    CLOSING_DAY,
  } = useTransactions()

  return (
    <div className="min-h-screen bg-background">
      <Header isCloud={isCloud} cloudError={cloudError} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Summary cards — CICLO ATUAL */}
        <section className="mt-8">
          <SummaryCards cycle={currentCycle} />
        </section>

        {/* Main grid: Form + Chart */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <TransactionForm onAdd={addTransaction} />
          </div>
          <div className="lg:col-span-3">
            <ExpenseChart data={expenseByCategory} />
          </div>
        </section>

        {/* Annual overview */}
        <section className="mt-10">
          <MonthlyOverview
            availableYears={availableYears}
            getYearData={getYearData}
            closingDay={CLOSING_DAY}
          />
        </section>

        {/* Data loading indicator */}
        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando dados...
            </div>
          </div>
        )}

        {/* Transaction history */}
        <section className="mt-10">
          <TransactionTable
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </section>
      </main>
    </div>
  )
}
