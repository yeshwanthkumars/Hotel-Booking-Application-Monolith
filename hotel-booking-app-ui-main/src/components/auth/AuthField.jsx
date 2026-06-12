export default function AuthField({
  id,
  label,
  error,
  as = 'input',
  className = '',
  children,
  ...props
}) {
  const baseClass = `w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${
    error
      ? 'border-red-400 bg-red-50/60 focus:border-red-400'
      : 'border-slate-200 bg-white/90 hover:border-indigo-300 focus:border-indigo-400'
  } ${className}`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>

      {as === 'select' ? (
        <select id={id} className={baseClass} {...props}>
          {children}
        </select>
      ) : (
        <input id={id} className={baseClass} {...props} />
      )}

      <p className="min-h-5 text-xs text-red-600">{error?.message || ''}</p>
    </div>
  );
}