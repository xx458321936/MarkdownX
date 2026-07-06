import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastHost } from '@/components/dialogs/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout />
        <ToastHost />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
