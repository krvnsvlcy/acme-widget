import type { CSSProperties } from 'react'
import { swatchColor } from '../format.ts'

const sizes = {
  sm: 'size-6',
  md: 'size-10 sm:size-14',
}

type Props = {
  name: string
  size?: keyof typeof sizes
  className?: string
}

export function Swatch({ name, size = 'md', className = '' }: Props) {
  const color = swatchColor(name)

  return (
    <span
      className={`swatch block shrink-0 ${sizes[size]} ${className}`}
      style={color ? ({ '--swatch': color } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  )
}
