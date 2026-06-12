export function EmptyState({ title, description, actionLabel, onAction, icon = '📦' }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4" role="alert">
      <p className="font-semibold text-red-900">{title}</p>
      {description ? <p className="mt-1 text-sm text-red-700">{description}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
