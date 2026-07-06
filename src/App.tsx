import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastHost } from '@/components/dialogs/Toast';

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Layout />
      <ToastHost />
    </BrowserRouter>
  );
}
