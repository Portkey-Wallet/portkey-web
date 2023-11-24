import App from '../App';
import { useRoutes } from 'react-router-dom';

export const PageRouter = () =>
  useRoutes([
    {
      path: '/',
      element: <App />,
    },

    {
      path: '*',
      element: <App />,
    },
  ]);
