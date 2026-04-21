import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Lancamentos from './components/Lancamentos'
import Cartoes from './components/Cartoes'
import Metas from './components/Metas'
import Categorias from './components/Categorias'
import SummaryCards from './components/SummaryCards'
import TransactionModal from './components/TransactionModal'
import { useFinancas } from './hooks/useFinancas'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'cartoes', label: 'Cartões' },
  { id: 'metas', label: 'Metas' },
  { id: 'categorias', label: 'Categorias' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const fin = useFinancas()

  return (
    <div className="min-h-screen bg-background">
      <Header
        monthLabel={fin.monthLabel}
        isCloud={fin.isCloud}
        onPrev={() => fin.changeMonth(-1)}
        onNext={() => fin.changeMonth(1)}
        onAddTransaction={() => setShowModal(true)}
      />

      <div className="bg-surface border-b border-border sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-income text-income'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-16">
        <SummaryCards fin={fin} />
        {activeTab === 'dashboard' && <Dashboard fin={fin} onAddTransaction={() => setShowModal(true)} />}
        {activeTab === 'lancamentos' && <Lancamentos fin={fin} onAdd={() => setShowModal(true)} />}
        {activeTab === 'cartoes' && <Cartoes fin={fin} />}
        {activeTab === 'metas' && <Metas fin={fin} />}
        {activeTab === 'categorias' && <Categorias fin={fin} />}
      </main>

      {showModal && (
        <TransactionModal
          fin={fin}
          initialType={showModal === 'income' ? 'income' : 'expense'}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
