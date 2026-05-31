'use client'

import { useEffect, useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/types/database'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChevronLeft, Send } from 'lucide-react'

export default function MatchChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)
      const res = await fetch(`/api/messages/${roomId}`)
      if (!res.ok) { router.push('/messages'); return }
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [roomId])

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!text.trim() || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    try {
      await fetch(`/api/messages/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b px-4 py-3 flex items-center gap-3 pt-safe">
        <button onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-[#1E3A5F]">매치 채팅</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 mt-14 mb-16 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full" />
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMine={msg.sender_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-2">
        <input
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
          placeholder="메시지를 입력하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
