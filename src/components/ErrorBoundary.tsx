import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
  message: string;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-bg p-8 text-center">
          <div className="max-w-md space-y-3">
            <h1 className="text-lg font-bold text-red-500">Something went wrong</h1>
            <p className="text-sm text-fg-muted">{this.state.message}</p>
            <button
              type="button"
              onClick={(): void => this.setState({ hasError: false, message: '' })}
              className="rounded bg-accent px-3 py-1 text-xs text-white"
            >
              Reset
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
