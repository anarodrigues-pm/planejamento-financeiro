import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import SummaryCards from './components/SummaryCards'
import TransactionForm from './components/TransactionForm'
import TransactionTable from './components/TransactionTable'
import ExpenseChart from './components/ExpenseChart'

const STORAGE_KEY = 'finplan-transactions'

function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export default function App() {
  const [transactions, setTransactions] = useState(loadTransactions)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalInvest = transactions
      .filter(t => t.type === 'invest')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      balance: totalIncome - totalExpense - totalInvest,
      totalIncome,
      totalExpense,
      totalInvest,
    }
  }, [transactions])

  const expenseByCategory = useMemo(() => {
    const map = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  function addTransaction(transaction) {
    setTransactions(prev => [
      { ...transaction, id: crypto.randomUUID(), createdAt: Date.now() },
      ...prev,
    ])
  }

  function deleteTransaction(id) {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Summary cards */}
        <section className="mt-8">
          <SummaryCards summary={summary} />
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
