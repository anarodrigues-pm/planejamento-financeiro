import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const LOCAL_KEY = 'finctrl_v3'
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Alimentação', emoji: '🍔', color: '#E67E22', budget: 800 },
  { id: 'cat-2', name: 'Moradia', emoji: '🏠', color: '#2980B9', budget: 1500 },
  { id: 'cat-3', name: 'Transporte', emoji: '🚗', color: '#8E44AD', budget: 400 },
  { id: 'cat-4', name: 'Saúde', emoji: '💊', color: '#E74C3C', budget: 300 },
  { id: 'cat-5', name: 'Lazer', emoji: '🎮', color: '#27AE60', budget: 300 },
  { id: 'cat-6', name: 'Educação', emoji: '📚', color: '#2ECC71', budget: 200 },
  { id: 'cat-7', name: 'Vestuário', emoji: '👗', color: '#F39C12', budget: 200 },
  { id: 'cat-8', name: 'Outros', emoji: '📦', color: '#95A5A6', budget: 200 },
]

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') } catch { return {} }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export function useFinancas() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`)
  const [transactions, setTransactions] = useState([])
  const [cards, setCards] = useState([])
  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [incomes, setIncomes] = useState([])
  const [isCloud, setIsCloud] = useState(false)
  const [loading, setLoading] = useState(true)
  const unsubRefs = useRef([])

  // Load local on start
  useEffect(() => {
    const local = loadLocal()
    if (local.transactions) setTransactions(local.transactions)
    if (local.cards) setCards(local.cards)
    if (local.goals) setGoals(local.goals)
    if (local.categories) setCategories(local.categories)
    if (local.incomes) setIncomes(local.incomes)
    setLoading(false)
  }, [])

  // Try Firestore
  useEffect(() => {
    let cancelled = false
    const cols = ['transactions','cards','goals','categories','incomes']
    const setters = { transactions: setTransactions, cards: setCards, goals: setGoals, categories: setCategories, incomes: setIncomes }

    try {
      cols.forEach(col => {
        const q = col === 'transactions'
          ? query(collection(db, col), orderBy('createdAt', 'desc'))
          : collection(db, col)

        const unsub = onSnapshot(q, snap => {
          if (cancelled) return
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          if (col === 'categories' && items.length === 0) return // keep defaults
          setters[col](items)
          setIsCloud(true)
          setLoading(false)
        }, err => {
          if (!cancelled) { setIsCloud(false); setLoading(false) }
        })
        unsubRefs.current.push(unsub)
      })
    } catch { setIsCloud(false); setLoading(false) }

    return () => { cancelled = true; unsubRefs.current.forEach(u => u()) }
  }, [])

  // Persist local
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({ transactions, cards, goals, categories, incomes }))
    }
  }, [transactions, cards, goals, categories, incomes, loading])

  // Month navigation
  const changeMonth = useCallback((dir) => {
    setCurrentMonth(prev => {
      const [y, m] = prev.split('-').map(Number)
      const d = new Date(y, m - 1 + dir, 1)
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    })
  }, [])

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split('-')
    return `${MONTHS[parseInt(m)-1]} ${y}`
  }, [currentMonth])

  // Filtered data
  const monthTransactions = useMemo(() =>
    transactions.filter(t => t.date && t.date.startsWith(currentMonth))
  , [transactions, currentMonth])

  const monthExpenses = useMemo(() =>
    monthTransactions.filter(t => t.type === 'expense')
  , [monthTransactions])

  const monthIncomes = useMemo(() => {
    const regular = incomes.filter(i => i.date && i.date.startsWith(currentMonth))
    const recurrent = incomes.filter(i => i.recurrent && i.date <= `${currentMonth}-31` && !i.date.startsWith(currentMonth))
    return [...regular, ...recurrent]
  }, [incomes, currentMonth])

  // Income-type transactions (added via main modal)
  const monthIncomeTransactions = useMemo(() =>
    monthTransactions.filter(t => t.type === 'income')
  , [monthTransactions])

  // Summary
  const summary = useMemo(() => {
    const incomesTotal = monthIncomes.reduce((s, i) => s + (i.amount || 0), 0)
    const incomeTransactionsTotal = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const totalIncome = incomesTotal + incomeTransactionsTotal
    const totalExpense = monthExpenses.reduce((s, t) => s + (t.amount || 0), 0)
    const cardExpense = monthExpenses.filter(t => t.payment === 'credito').reduce((s, t) => s + (t.amount || 0), 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, cardExpense }
  }, [monthIncomes, monthTransactions, monthExpenses])

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {}
    monthExpenses.forEach(t => {
      if (!map[t.category]) map[t.category] = 0
      map[t.category] += t.amount || 0
    })
    return map
  }, [monthExpenses])

  // Helpers
  const getCat = useCallback((id) =>
    categories.find(c => c.id === id) || { name: 'Outros', emoji: '📦', color: '#95A5A6', budget: 0 }
  , [categories])

  const getCard = useCallback((id) =>
    cards.find(c => c.id === id)
  , [cards])

  // ACTIONS
  async function addToFirestore(col, data) {
    if (isCloud) {
      try {
        const ref = await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() })
        return ref.id
      } catch (e) { console.warn('Firestore error', e) }
    }
    return uid()
  }

  async function removeFromFirestore(col, id) {
    if (isCloud) {
      try { await deleteDoc(doc(db, col, id)) } catch (e) { console.warn(e) }
    }
  }

  const addTransaction = useCallback(async (t) => {
    if (t.payment === 'credito' && t.installments > 1) {
      const groupId = uid()
      for (let i = 1; i <= t.installments; i++) {
        const d = new Date(t.date)
        d.setMonth(d.getMonth() + (i - 1))
        const installDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        const item = { ...t, amount: t.amount / t.installments, date: installDate, installment: i, groupId }
        const id = await addToFirestore('transactions', item)
        if (!isCloud) setTransactions(prev => [{ ...item, id }, ...prev])
      }
    } else {
      const item = { ...t, installments: 1, installment: 1 }
      const id = await addToFirestore('transactions', item)
      if (!isCloud) setTransactions(prev => [{ ...item, id }, ...prev])
    }
  }, [isCloud])

  const deleteTransaction = useCallback(async (id) => {
    await removeFromFirestore('transactions', id)
    if (!isCloud) setTransactions(prev => prev.filter(t => t.id !== id))
  }, [isCloud])

  const addCard = useCallback(async (card) => {
    const item = { ...card, id: uid() }
    await addToFirestore('cards', item)
    if (!isCloud) setCards(prev => [...prev, item])
  }, [isCloud])

  const deleteCard = useCallback(async (id) => {
    await removeFromFirestore('cards', id)
    if (!isCloud) setCards(prev => prev.filter(c => c.id !== id))
  }, [isCloud])

  const addGoal = useCallback(async (goal) => {
    const item = { ...goal, id: uid() }
    await addToFirestore('goals', item)
    if (!isCloud) setGoals(prev => [...prev, item])
  }, [isCloud])

  const updateGoal = useCallback(async (id, data) => {
    if (isCloud) {
      try { await setDoc(doc(db, 'goals', id), data, { merge: true }) } catch {}
    }
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g))
  }, [isCloud])

  const deleteGoal = useCallback(async (id) => {
    await removeFromFirestore('goals', id)
    if (!isCloud) setGoals(prev => prev.filter(g => g.id !== id))
  }, [isCloud])

  const addCategory = useCallback(async (cat) => {
    const item = { ...cat, id: uid() }
    await addToFirestore('categories', item)
    if (!isCloud) setCategories(prev => [...prev, item])
  }, [isCloud])

  const deleteCategory = useCallback(async (id) => {
    await removeFromFirestore('categories', id)
    if (!isCloud) setCategories(prev => prev.filter(c => c.id !== id))
  }, [isCloud])

  const addIncome = useCallback(async (income) => {
    const item = { ...income, id: uid() }
    await addToFirestore('incomes', item)
    if (!isCloud) setIncomes(prev => [...prev, item])
  }, [isCloud])

  const deleteIncome = useCallback(async (id) => {
    await removeFromFirestore('incomes', id)
    if (!isCloud) setIncomes(prev => prev.filter(i => i.id !== id))
  }, [isCloud])

  return {
    currentMonth, monthLabel, changeMonth,
    transactions, monthTransactions, monthExpenses, monthIncomes, monthIncomeTransactions,
    cards, goals, categories, incomes,
    summary, categoryBreakdown,
    getCat, getCard, isCloud, loading,
    addTransaction, deleteTransaction,
    addCard, deleteCard,
    addGoal, updateGoal, deleteGoal,
    addCategory, deleteCategory,
    addIncome, deleteIncome,
    MONTHS,
  }
}
