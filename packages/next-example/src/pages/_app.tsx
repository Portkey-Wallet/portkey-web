import '@portkey/did-ui-react/dist/assets/index.css';
import { ConfigProvider, SignIn, SignInInterface, PortkeyConfigProvider } from '@portkey/did-ui-react';

export default function APP({ Component, pageProps }: any) {
  return (
    <PortkeyConfigProvider>
      <Component {...pageProps} />
    </PortkeyConfigProvider>
  );
}
