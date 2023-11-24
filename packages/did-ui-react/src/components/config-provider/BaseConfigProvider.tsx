import ScreenLoading from '../ScreenLoading';
import ReCaptchaModal from '../ReCaptchaModal';
import PortkeyProvider from '../context';
import type { Theme } from '../types';
import { ReactNode } from 'react';
import clsx from 'clsx';
import { ChainType } from '@portkey/types';
import { NetworkType } from '../../types';
import { PORTKEY_ROOT_ID } from '../../constants';

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
  networkType: NetworkType;
  chainType?: ChainType;
  children: ReactNode;
}) {
  return (
    <PortkeyProvider sandboxId={sandboxId} chainType={chainType} networkType={networkType} theme={theme}>
      <div id={PORTKEY_ROOT_ID} className={clsx('portkey-ui-wrapper', theme === 'dark' && 'portkey-ui-dark-wrapper')}>
        {children}
        <ScreenLoading />
        <ReCaptchaModal />
      </div>
    </PortkeyProvider>
  );
}
