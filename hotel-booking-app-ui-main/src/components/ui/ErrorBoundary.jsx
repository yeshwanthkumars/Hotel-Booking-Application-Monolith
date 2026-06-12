import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M6.938 4h10.124c1.54 0 2.502 1.667 1.732 3L13.732 18c-.77 1.333-2.694 1.333-3.464 0L5.206 7c-.77-1.333.192-3 1.732-3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected UI error occurred. Please reload the page to continue.
            </p>
            {this.state.error?.message && (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{this.state.error.message}</p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
