import CalculatorPage from './pages/CalculatorPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Dockalc',
    path: '/',
    element: <CalculatorPage />,
    public: true,
  }
];


