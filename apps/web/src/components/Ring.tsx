type Props = {
  /** Filled when the product is in the basket, outlined otherwise. */
  filled?: boolean
  /** Fill colour when filled. Defaults to the off-white `fill` colour. */
  color?: string
  className?: string
}

/** A thin ring, the product glyph. */
export function Ring({ filled = false, color, className = 'size-12' }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={`shrink-0 ${className}`} aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="23"
        className={`stroke-ink transition-[fill] duration-300 ${filled ? 'fill-fill' : 'fill-transparent'}`}
        style={filled && color ? { fill: color } : undefined}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
