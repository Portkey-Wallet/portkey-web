import ScreenLoading from '../ScreenLoading';
import ReCaptchaModal from '../ReCaptchaModal';
import PortkeyProvider from '../context';
import type { Theme } from '../types';
import { ReactNode } from 'react';

export default function BaseConfigProvider({ theme = 'light', children }: { theme?: Theme; children: ReactNode }) {
  return (
    <PortkeyProvider theme={theme}>
      {children}
      <ScreenLoading />
      <ReCaptchaModal />
    </PortkeyProvider>
  );
}
