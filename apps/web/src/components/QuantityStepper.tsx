import { MAX_QUANTITY } from '../api.ts'

type Props = {
  label: string
  quantity: number
  disabled: boolean
  onChange: (quantity: number) => void
}

export function QuantityStepper({ label, quantity, disabled, onChange }: Props) {
  return (
    <div className="stepper" role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        disabled={disabled}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </button>
      <output aria-live="polite">{quantity}</output>
      <button
        type="button"
        aria-label={`Add one ${label}`}
        disabled={disabled || quantity >= MAX_QUANTITY}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </button>
    </div>
  )
}
