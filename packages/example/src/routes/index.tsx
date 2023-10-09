import App from '../App';
import { useRoutes } from 'react-router-dom';
import Assets from '../pages/assets';

export const PageRouter = () =>
  useRoutes([
    {
      path: '/',
      element: <App />,
    },
    {
      path: '/assets',
      element: <Assets />,
    },

    {
      path: '*',
      element: <App />,
    },
  ]);
