'use client'

import { Message } from '@/types/database'
import { getTimeAgo } from '@/lib/utils'

interface ChatBubbleProps {
  message: Message
  isMine: boolean
}

export function ChatBubble({ message, isMine }: ChatBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-2 flex-shrink-0">
          {message.profiles?.nickname?.[0] ?? '?'}
        </div>
      )}
      <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isMine && (
          <span className="text-xs text-gray-500">{message.profiles?.nickname}</span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm ${
            isMine
              ? 'bg-[#1E3A5F] text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-400">{getTimeAgo(message.created_at)}</span>
      </div>
    </div>
  )
}
