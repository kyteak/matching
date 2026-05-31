'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastItem {
  id: string
  message: string
  type?: 'default' | 'success' | 'error'
}

interface ToastProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const typeClasses = {
    default: 'bg-[#1E3A5F] text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg max-w-sm transition-all duration-300',
        typeClasses[toast.type || 'default'],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <span className="text-sm flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)}>
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

let toastCallback: ((message: string, type?: ToastItem['type']) => void) | null = null

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = (message: string, type: ToastItem['type'] = 'default') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
