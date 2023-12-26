import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider, SignIn, ISignIn, did, TDesign, UI_TYPE, Unlock } from '@portkey-v1/did-ui-react';
import { Store } from '../../utils';
import { ChainId } from '@portkey-v1/types';
import { sleep } from '@portkey-v1/utils';

const PIN = '111111';
let CHAIN_ID: ChainId = 'AELF';

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
        ref={ref}
        keyboard={true}
        design={design}
        uiType={uiType}
        extraElement={<div style={{ height: 300, background: 'red' }}></div>}
        getContainer="#wrapper"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://portkey.finance/terms-of-service'}
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

      <button
        onClick={async () => {
          setDesign('CryptoDesign');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        CryptoDesign
      </button>
      <button
        onClick={async () => {
          setDesign('SocialDesign');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        SocialDesign
      </button>
      <button
        onClick={async () => {
          setDesign('Web2Design');
          await sleep(50);
          ref.current?.setOpen(true);
        }}>
        Web2Design
      </button>
      <div>-----------</div>
      <button
        onClick={async () => {
          setUIType(v => (v === 'Full' ? 'Modal' : 'Full'));
        }}>
        setUIType
      </button>

      <button
        onClick={async () => {
          ref.current.setCurrentLifeCycle(JSON.parse(localStorage.getItem('portkeyLifeCycle')));
        }}>
        setCurrentLifeCycle
      </button>

      <div>-----------</div>

      <button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log('wallet:', wallet);
          // Mock chainId: 'AELF'
          const result = await did.logout({ chainId: CHAIN_ID }, { onMethod: 'transactionHash' });
          console.log(result, 'logout====');
        }}>
        logout
      </button>
      <div id="wrapper"></div>
      <div>-----------</div>

      <button
        onClick={async () => {
          // Mock pin: 111111
          const wallet = await did.load(PIN);
          console.log(wallet, 'wallet==load');
        }}>
        load
      </button>

      <div>-----------</div>
      <button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'AELF',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=AELF');
        }}>
        checkManagerIsExist: AELF
      </button>

      <div>-----------</div>
      <button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'tDVV',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=tDVV');
        }}>
        checkManagerIsExist: tDVV
      </button>

      <div>-----------</div>
      <button
        onClick={async () => {
          const isExist = await did.checkManagerIsExist({
            chainId: 'tDVW',
            caHash: did.didWallet.caInfo[CHAIN_ID].caHash,
            managementAddress: did.didWallet.managementAccount.address,
          });
          console.log(isExist, 'isExist=tDVW');
        }}>
        checkManagerIsExist: tDVW
      </button>
    </div>
  );
}
