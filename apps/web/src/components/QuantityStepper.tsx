import { MAX_QUANTITY } from '../api.ts'

type Props = {
  label: string
  quantity: number
  disabled: boolean
  onChange: (quantity: number) => void
  /** Sizing and placement; the buttons stretch to the height given here. */
  className?: string
}

const buttonClass =
  'h-full w-10 shrink-0 text-lg transition-colors enabled:hover:bg-black/10 disabled:opacity-40'

export function QuantityStepper({ label, quantity, disabled, onChange, className = '' }: Props) {
  return (
    <div
      className={`inline-flex items-center justify-between overflow-hidden rounded-full border border-ink bg-ink text-page ${className}`}
      role="group"
      aria-label={`Quantity of ${label}`}
    >
      <button
        type="button"
        className={buttonClass}
        aria-label={`Remove one ${label}`}
        disabled={disabled}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </button>
      <output className="min-w-8 text-center font-medium tabular-nums" aria-live="polite">
        {quantity}
      </output>
      <button
        type="button"
        className={buttonClass}
        aria-label={`Add one ${label}`}
        disabled={disabled || quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  )
}
