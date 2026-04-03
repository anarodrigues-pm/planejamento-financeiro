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

export function useTransactions() {
  const [transactions, setTransactions] = useState(loadLocal)
  const [loading, setLoading] = useState(true)
  const [isCloud, setIsCloud] = useState(false)
  const [cloudError, setCloudError] = useState(null)
  const unsubRef = useRef(null)

  // Try to connect to Firestore, fall back to localStorage
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

  // Save to localStorage as backup whenever transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      saveLocal(transactions)
    }
  }, [transactions])

  // Derived data
  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalInvest = transactions
      .filter((t) => t.type === 'invest')
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
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  // Add transaction — cloud or local
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
          // Fallback to local
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

  // Delete transaction — cloud or local
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
    summary,
    expenseByCategory,
    addTransaction,
    deleteTransaction,
  }
}
