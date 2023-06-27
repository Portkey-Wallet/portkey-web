import React, { useRef } from 'react';
import { ConfigProvider, SignIn, ISignIn, did, PortkeyStyleProvider } from '@portkey/did-ui-react';
import { Store } from '../../utils';
import { Spin, Button, message } from 'antd';

const myStore = new Store();
ConfigProvider.setGlobalConfig({
  connectUrl: 'https://auth-portkey-test.portkey.finance',
  storageMethod: myStore,
  socialLogin: {
    Portkey: {
      websiteName: 'website demo',
      websiteIcon: '',
    },
  },
  requestDefaults: {
    timeout: 30000,
  },
  /** By default, reCaptcha's siteKey of portkey is used, if it is a self-built service, please use your own siteKey */
  // reCaptchaConfig: {
  //   siteKey: '',
  // },
  graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
  network: {
    defaultNetwork: 'TESTNET',
  },
});

export default function Sign() {
  const ref = useRef<ISignIn>();
  const ref1 = useRef<ISignIn>();
  return (
    <div>
      <Spin spinning />
      <Button
        onClick={() => {
          message.error('button', 10000000);
        }}>
        button
      </Button>
      <PortkeyStyleProvider>
        <Button
          onClick={() => {
            message.error('PortkeyStyleProvider button', 1000000);
          }}>
          button
        </Button>
      </PortkeyStyleProvider>
      <SignIn
        ref={ref}
        uiType="Modal"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://portkey.finance/terms-of-service'}
        onFinish={async res => {
          console.log(res, 'onFinish====');
          const CAHolderInfo = await did.getCAHolderInfo(res.chainId);
          console.log(CAHolderInfo, CAHolderInfo.nickName, 'result====onFinish');
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
      <div></div>
      <button
        onClick={() => {
          ref1?.current.setOpen(true);
        }}>
        setOpen connectFirst
      </button>

      <SignIn
        ref={ref1}
        uiType="Modal"
        design="SocialDesign"
        isShowScan
        className="sign-in-wrapper"
        // termsOfService={'https://portkey.finance/terms-of-service'}
        onFinish={async res => {
          console.log(res, 'onFinish====');
          const CAHolderInfo = await did.getCAHolderInfo(res.chainId);
          console.log(CAHolderInfo, CAHolderInfo.nickName, 'result====onFinish');
        }}
        onError={error => {
          console.log(error, 'onError====error');
        }}
        onCancel={() => {
          ref1?.current.setOpen(false);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
      />
    </div>
  );
}
