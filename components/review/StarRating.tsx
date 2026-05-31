'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value = 0, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'cursor-pointer')}
        >
          <Star
            className={cn(
              sizeClass[size],
              (hovered || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
