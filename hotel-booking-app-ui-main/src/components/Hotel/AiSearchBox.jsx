import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const MAX_QUERY_LENGTH = 500;
const EXAMPLE_QUERIES = [
  '5 star hotels in Paris',
  'Budget hotels under $100',
  'Hotels in Dubai available next week',
];

export default function AiSearchBox({ activeQuery, isLoading, onSearch, onClear }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const canClear = Boolean(activeQuery);

  const remainingChars = useMemo(() => MAX_QUERY_LENGTH - query.length, [query.length]);

  const validateQuery = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Please enter a search query.';
    }

    if (trimmed.length > MAX_QUERY_LENGTH) {
      return `Query must be ${MAX_QUERY_LENGTH} characters or less.`;
    }

    return '';
  };

  const submitSearch = async (value) => {
    const validationError = validateQuery(value);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    await onSearch(value.trim());
  };

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitSearch(query);
              }
            }}
            maxLength={MAX_QUERY_LENGTH + 20}
            placeholder="Try: 5 star hotels in New York from June 10 to June 15"
            className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
          />

          {canClear && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setError('');
                onClear();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Clear AI search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => submitSearch(query)}
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[190px]"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">✨ AI Search</span>
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-gray-500">Describe dates, location, price range, or star rating in plain English.</p>
        )}
        <p className={`text-xs ${remainingChars < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {query.length}/{MAX_QUERY_LENGTH}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setQuery(suggestion);
              submitSearch(suggestion);
            }}
            className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

AiSearchBox.propTypes = {
  activeQuery: PropTypes.string,
  isLoading: PropTypes.bool,
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

AiSearchBox.defaultProps = {
  activeQuery: '',
  isLoading: false,
};
