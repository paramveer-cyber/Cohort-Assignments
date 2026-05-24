import s from './Controls.module.css'

export default function Controls({ buttons }) {
  return (
    <div className={s.controls}>
      {buttons.map(({ label, onClick, primary, disabled }) => (
        <button
          key={label}
          className={primary ? s.primary : s.btn}
          onClick={onClick}
          disabled={disabled}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
