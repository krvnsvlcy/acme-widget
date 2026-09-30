import { MAX_QUANTITY } from '../api.ts'

type Props = {
  label: string
  quantity: number
  disabled: boolean
  onChange: (quantity: number) => void
  className?: string
}

const buttonClass = 'size-8 enabled:hover:bg-page disabled:opacity-50'

export function QuantityStepper({ label, quantity, disabled, onChange, className = '' }: Props) {
  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-lg border border-line ${className}`}
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
      <output className="min-w-8 text-center tabular-nums" aria-live="polite">
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
