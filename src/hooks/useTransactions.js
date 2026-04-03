import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'transactions'
const LOCAL_KEY = 'finplan-transactions'
const CLOSING_DAY = 11 // dia de fechamento da fatura (Nubank)

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MONTH_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

// --- localStorage helpers ---
function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
}

/**
 * Calcula o mês de competência baseado no dia de fechamento da fatura.
 * Ex: fechamento dia 25
 *   - 03/04 → competência Abril (dia 3 <= 25)
 *   - 26/04 → competência Maio  (dia 26 > 25)
 * A fatura de Abril fecha dia 25/04 e é paga em Maio.
 */
function getCompetenceMonth(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const month = m - 1 // 0-indexed
  const day = d

  if (day > CLOSING_DAY) {
    // Pertence ao próximo mês
    if (month === 11) {
      return { month: 0, year: y + 1 }
    }
    return { month: month + 1, year: y }
  }
  return { month, year: y }
}

function getCompetenceKey(dateStr) {
  const { month, year } = getCompetenceMonth(dateStr)
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * O ciclo atual é determinado pela data de hoje.
 * O "nome" do ciclo é o mês de PAGAMENTO (competência + 1).
 * Ex: hoje 03/04 → competência Abril → pagamento Maio → "Ciclo Maio 2026"
 */
function getCurrentCycleInfo() {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const comp = getCompetenceMonth(todayStr)
  const key = `${comp.year}-${String(comp.month).padStart(2, '0')}`

  // Mês de pagamento = fechamento + 1
  let payMonth = comp.month + 1
  let payYear = comp.year
  if (payMonth > 11) {
    payMonth = 0
    payYear += 1
  }

  return {
    key,
    closingMonth: comp.month,
    closingYear: comp.year,
    payMonth,
    payYear,
    label: `Ciclo ${MONTH_NAMES[payMonth]} ${payYear}`,
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState(loadLocal)
  const [loading, setLoading] = useState(true)
  const [isCloud, setIsCloud] = useState(false)
  const [cloudError, setCloudError] = useState(null)
  const unsubRef = useRef(null)

  // Try to connect Firestore, fallback to localStorage
  useEffect(() => {
    let cancelled = false

    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      )

      unsubRef.current = onSnapshot(
        q,
        (snapshot) => {
          if (cancelled) return
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          setTransactions(items)
          setIsCloud(true)
          setCloudError(null)
          setLoading(false)
        },
        (error) => {
          if (cancelled) return
          console.warn('Firestore indisponível, usando dados locais:', error.message)
          setIsCloud(false)
          setCloudError(error.message)
          setTransactions(loadLocal())
          setLoading(false)
        }
      )
    } catch (error) {
      if (!cancelled) {
        console.warn('Erro ao conectar com Firebase:', error.message)
        setIsCloud(false)
        setCloudError(error.message)
        setTransactions(loadLocal())
        setLoading(false)
      }
    }

    return () => {
      cancelled = true
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  // Backup to localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      saveLocal(transactions)
    }
  }, [transactions])

  // ---- CICLO ATUAL (cards no topo) ----
  // Filtra transações apenas do ciclo de fatura atual
  const currentCycle = useMemo(() => {
    const cycle = getCurrentCycleInfo()
    const cycleTransactions = transactions.filter(
      (t) => t.date && getCompetenceKey(t.date) === cycle.key
    )

    const totalIncome = cycleTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = cycleTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalInvest = cycleTransactions
      .filter((t) => t.type === 'invest')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      label: cycle.label, // "Ciclo Maio 2026"
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      totalInvest,
    }
  }, [transactions])

  // ---- GRÁFICO DE PIZZA POR CATEGORIA (ciclo atual) ----
  const expenseByCategory = useMemo(() => {
    const cycle = getCurrentCycleInfo()
    const map = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date && getCompetenceKey(t.date) === cycle.key)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  // ---- VISÃO MENSAL / ANUAL (por competência de fatura) ----
  const monthlyData = useMemo(() => {
    // Agrupar transações por mês de competência
    const byMonth = {}

    transactions.forEach((t) => {
      if (!t.date) return
      const key = getCompetenceKey(t.date)
      if (!byMonth[key]) {
        const comp = getCompetenceMonth(t.date)
        byMonth[key] = {
          key,
          month: comp.month,
          year: comp.year,
          label: MONTH_SHORT[comp.month],
          labelFull: `${MONTH_NAMES[comp.month]} ${comp.year}`,
          income: 0,
          expense: 0,
          invest: 0,
        }
      }

      if (t.type === 'income') byMonth[key].income += t.amount
      else if (t.type === 'expense') byMonth[key].expense += t.amount
      else if (t.type === 'invest') byMonth[key].invest += t.amount
    })

    // Ordenar cronologicamente
    return Object.values(byMonth).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  }, [transactions])

  // Agrupar por ano para o seletor
  const availableYears = useMemo(() => {
    const years = new Set(monthlyData.map((m) => m.year))
    if (years.size === 0) years.add(new Date().getFullYear())
    return [...years].sort()
  }, [monthlyData])

  // Gerar dados completos de um ano (todos os 12 meses, mesmo sem dados)
  function getYearData(year) {
    const result = []
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`
      const existing = monthlyData.find((d) => d.key === key)
      result.push(
        existing || {
          key,
          month: m,
          year,
          label: MONTH_SHORT[m],
          labelFull: `${MONTH_NAMES[m]} ${year}`,
          income: 0,
          expense: 0,
          invest: 0,
        }
      )
    }
    return result
  }

  // ---- AÇÕES ----
  const addTransaction = useCallback(
    async (transaction) => {
      if (isCloud) {
        try {
          await addDoc(collection(db, COLLECTION), {
            ...transaction,
            createdAt: serverTimestamp(),
          })
        } catch (error) {
          console.error('Erro Firestore, salvando localmente:', error)
          const newItem = {
            ...transaction,
            id: crypto.randomUUID(),
            createdAt: { seconds: Date.now() / 1000 },
          }
          setTransactions((prev) => {
            const updated = [newItem, ...prev]
            saveLocal(updated)
            return updated
          })
        }
      } else {
        const newItem = {
          ...transaction,
          id: crypto.randomUUID(),
          createdAt: { seconds: Date.now() / 1000 },
        }
        setTransactions((prev) => {
          const updated = [newItem, ...prev]
          saveLocal(updated)
          return updated
        })
      }
    },
    [isCloud]
  )

  const deleteTransaction = useCallback(
    async (id) => {
      if (isCloud) {
        try {
          await deleteDoc(doc(db, COLLECTION, id))
        } catch (error) {
          console.error('Erro ao excluir no Firestore:', error)
          setTransactions((prev) => {
            const updated = prev.filter((t) => t.id !== id)
            saveLocal(updated)
            return updated
          })
        }
      } else {
        setTransactions((prev) => {
          const updated = prev.filter((t) => t.id !== id)
          saveLocal(updated)
          return updated
        })
      }
    },
    [isCloud]
  )

  return {
    transactions,
    loading,
    isCloud,
    cloudError,
    currentCycle,
    expenseByCategory,
    monthlyData,
    availableYears,
    getYearData,
    addTransaction,
    deleteTransaction,
    CLOSING_DAY,
    MONTH_NAMES,
  }
}
