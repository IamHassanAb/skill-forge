import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center bg-[var(--bg)]">
          <div className="bg-[var(--s1)] border border-[var(--border)] rounded-2xl p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center">
            <div className="w-10 h-10 rounded-full bg-terracotta/10 border border-terracotta/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--t1)] font-semibold text-base mb-1">Something went wrong</p>
              <p className="text-[var(--t3)] text-sm">An unexpected error occurred in this section.</p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-terracotta text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
