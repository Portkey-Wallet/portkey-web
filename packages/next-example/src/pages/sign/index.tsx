import React, { useRef } from 'react';
import { ConfigProvider, SignIn, SignInInterface } from '@portkey/did-ui-react';
import { Store } from '../../utils';

const myStore = new Store();
ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  socialLogin: {
    Portkey: {
      websiteName: 'website demo',
      websiteIcon: '',
    },
  },
  // requestDefaults: {
  //   baseURL: '/portkey',
  // },
  /** By default, reCaptcha's siteKey of portkey is used, if it is a self-built service, please use your own siteKey */
  // reCaptchaConfig: {
  //   siteKey: '',
  // },
  graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
  network: {
    defaultNetwork: 'TESTNET',
  },
});

export default function Sign() {
  const ref = useRef<SignInInterface>();

  return (
    <div>
      <SignIn
        ref={ref}
        uiType="Modal"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://portkey.finance/terms-of-service'}
        onFinish={res => {
          console.log(res, 'onFinish====');
        }}
        onError={error => {
          console.log(error, 'onError====error');
        }}
        onCancel={() => {
          ref?.current.setOpen(false);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
      />
      <button
        onClick={() => {
          ref?.current.setOpen(true);
        }}>
        setOpen
      </button>
    </div>
  );
}
