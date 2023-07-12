import ScreenLoading from '../ScreenLoading';
import ReCaptchaModal from '../ReCaptchaModal';
import PortkeyProvider from '../context';
import type { Theme } from '../types';
import { ReactNode } from 'react';
import clsx from 'clsx';

export default function BaseConfigProvider({ theme = 'light', children }: { theme?: Theme; children: ReactNode }) {
  return (
    <PortkeyProvider theme={theme}>
      <div className={clsx('portkey-ui-wrapper', theme === 'dark' && 'portkey-ui-dark-wrapper')}>
        {children}
        <ScreenLoading />
        <ReCaptchaModal />
      </div>
    </PortkeyProvider>
  );
}
