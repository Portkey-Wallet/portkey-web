'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider, SignIn, ISignIn, did, TDesign, UI_TYPE, Unlock } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';
import { sleep } from '@portkey/utils';
import { Button } from 'antd';

const PIN = '111111';
let CHAIN_ID: ChainId = 'AELF';

ConfigProvider.setGlobalConfig({
  connectUrl: 'https://auth-portkey-test.portkey.finance',
  socialLogin: {
    Portkey: {
      websiteName: 'website demo',
      websiteIcon: '',
    },
  },
  requestDefaults: {
    timeout: 30000,
  },
  serviceUrl: 'https://localtest-applesign2.portkey.finance',
  /** By default, reCaptcha's siteKey of portkey is used, if it is a self-built service, please use your own siteKey */
  // reCaptchaConfig: {
  //   siteKey: '',
  // },
  graphQLUrl: '/graphql',
});

export default function Sign() {
  const ref = useRef<ISignIn>();
  const [defaultLifeCycle, setLifeCycle] = useState<any>();
  const [design, setDesign] = useState<TDesign>('Web2Design');
  const [uiType, setUIType] = useState<UI_TYPE>('Modal');

  const [lockOpen, setLockOpen] = useState<boolean>();
  const [password, setPassword] = useState<string>();

  useEffect(() => {
    typeof window !== 'undefined' && setLifeCycle(JSON.parse(localStorage.getItem('portkeyLifeCycle')));
  }, []);

  return (
    <div>
      <div>-----------</div>
      <SignIn
        // pin={'23aa'}
        loginMethodsOrder={['Email', 'Google', 'Phone', 'Apple', 'Scan']}
        recommendIndexes={[0, 1]}
        ref={ref}
        keyboard={true}
        design={design}
        uiType={uiType}
        defaultChainId="tDVV"
        extraElement={<div style={{ height: 300, background: 'red' }}></div>}
        getContainer="#wrapper"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://portkey.finance/terms-of-service'}
        privacyPolicy={'https://portkey.finance/privacy-policy'}
        onFinish={async res => {
          console.log(res, 'onFinish====');
          CHAIN_ID = res.chainId;
          did.save(PIN);
        }}
        onError={error => {
          console.log(error, 'onError====error');
        }}
        onCancel={() => {
          ref?.current.setOpen(false);
          setLifeCycle(undefined);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
        // defaultLifeCycle={{ LoginByScan: null }}
        onLifeCycleChange={(lifeCycle, nextLifeCycleProps) => {
          console.log(
            'onLifeCycleChange:',
            lifeCycle,
            nextLifeCycleProps,
            { [lifeCycle]: nextLifeCycleProps },
            JSON.stringify({ [lifeCycle]: nextLifeCycleProps }),
          );
          localStorage.setItem('portkeyLifeCycle', JSON.stringify({ [lifeCycle]: nextLifeCycleProps }));
        }}
      />

      <Button
        onClick={async () => {
          setDesign('CryptoDesign');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        CryptoDesign
      </Button>
      <Button
        onClick={async () => {
          setDesign('SocialDesign');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        SocialDesign
      </Button>
      <Button
        onClick={async () => {
          setDesign('Web2Design');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        Web2Design
      </Button>
      <div>-----------</div>
      <Button
        onClick={async () => {
          setUIType(v => (v === 'Full' ? 'Modal' : 'Full'));
        }}>
        setUIType
      </Button>

      <Button
        onClick={async () => {
          ref.current.setCurrentLifeCycle(JSON.parse(localStorage.getItem('portkeyLifeCycle')));
        }}>
        setCurrentLifeCycle
      </Button>

      <div>-----------</div>

      <Button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log('wallet:', wallet);
          // Mock chainId: 'AELF'
          const result = await did.logout({ chainId: CHAIN_ID }, { onMethod: 'transactionHash' });
          console.log(result, 'logout====');
        }}>
        logout
      </Button>
      <div id="wrapper"></div>
      <div>-----------</div>

      <Button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log(wallet, 'wallet==load');
        }}>
        load
      </Button>

      <div>-----------</div>
      <Button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'AELF',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=AELF');
        }}>
        checkManagerIsExist: AELF
      </Button>

      <div>-----------</div>
      <Button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'tDVV',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=tDVV');
        }}>
        checkManagerIsExist: tDVV
      </Button>

      <div>-----------</div>
      <Button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'tDVW',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=tDVW');
        }}>
        checkManagerIsExist: tDVW
      </Button>
    </div>
  );
}
