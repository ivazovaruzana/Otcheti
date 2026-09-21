const PERIODS = ['H1', 'H2']

export default function PeriodSwitch({ value, onChange }) {
  return (
    <div className="period-switch" role="group" aria-label="Период">
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          className={period === value ? 'period-button is-active' : 'period-button'}
          aria-pressed={period === value}
          onClick={() => onChange(period)}
        >
          {period} 2026
        </button>
      ))}
    </div>
  )
}
