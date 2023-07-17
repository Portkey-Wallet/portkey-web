import ScreenLoading from '../ScreenLoading';
import ReCaptchaModal from '../ReCaptchaModal';
import PortkeyProvider from '../context';
import type { Theme } from '../types';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { ChainType } from '@portkey/types';

export default function BaseConfigProvider({
  sandboxId,
  networkType,
  chainType = 'aelf',
  theme = 'light',
  children,
}: {
  // Required when running on chrome extension
  sandboxId?: string;
  // Currently theme is used to control content such as pictures under the black/light theme
  theme?: Theme;
  networkType: string;
  chainType?: ChainType;
  children: ReactNode;
}) {
  return (
    <PortkeyProvider sandboxId={sandboxId} chainType={chainType} networkType={networkType} theme={theme}>
      <div id="portkey-ui-root" className={clsx('portkey-ui-wrapper', theme === 'dark' && 'portkey-ui-dark-wrapper')}>
        {children}
        <ScreenLoading />
        <ReCaptchaModal />
      </div>
    </PortkeyProvider>
  );
}
