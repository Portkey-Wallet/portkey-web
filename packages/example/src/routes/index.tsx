import App from '../App';
import { useRoutes } from 'react-router-dom';
import Assets from '../pages/assets';
import Sign from '../pages/sign';

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
      path: '/sign',
      element: <Sign />,
    },
    {
      path: '*',
      element: <App />,
    },
  ]);
