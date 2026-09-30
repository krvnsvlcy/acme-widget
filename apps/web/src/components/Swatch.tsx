import type { CSSProperties } from 'react'
import { swatchColor } from '../format.ts'

export function Swatch({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const color = swatchColor(name)

  return (
    <span
      className={`swatch swatch--${size}`}
      style={color ? { '--swatch': color } as CSSProperties : undefined}
      aria-hidden="true"
    />
  )
}
