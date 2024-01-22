'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ConfigProvider,
  SignIn,
  ISignIn,
  did,
  TDesign,
  UI_TYPE,
  modalMethod,
  TSignUpContinueHandler,
  TModalMethodRef,
  SignUpValue,
} from '@portkey-v1/did-ui-react';
import { ChainId } from '@portkey-v1/types';
import { sleep } from '@portkey-v1/utils';
import { Button } from 'antd';
import { FetchRequest } from '@portkey-v1/request';

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
  loginConfig: {
    loginMethodsOrder: ['Email', 'Google', 'Phone', 'Apple', 'Scan'],
    recommendIndexes: [0, 1],
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
    typeof window !== 'undefined' && setLifeCycle(JSON.parse(localStorage.getItem('portkeyLifeCycle') ?? '{}'));
  }, []);

  const onSignUpHandler: TSignUpContinueHandler = useCallback(async identifierInfo => {
    //
    let isLoginGuardian = false;
    try {
      const customFetch = new FetchRequest({});
      const result: any = await customFetch.send({
        url: `${'https://aa-portkey-test.portkey.finance'}/api/app/account/registerInfo`,
        method: 'GET',
        params: {
          loginGuardianIdentifier: identifierInfo.identifier,
        },
      });
      isLoginGuardian = true;
      console.log(result, 'result==');
    } catch (error) {
      isLoginGuardian = false;
    }
    if (isLoginGuardian) {
      let modalRef: TModalMethodRef;
      const isOk = await modalMethod({
        wrapClassName: 'portkey-switch-version-modal-wrapper',
        type: 'confirm',
        okText: 'Switch to V2',
        // cancelText: '',
        content: (
          <div className="modal-content">
            <h2>
              Continue with this account? |||{' '}
              <span
                onClick={() => {
                  modalRef.current?.close();
                }}>
                close
              </span>
            </h2>
            <div className="inner">
              This account is not registered yet. If you wish to create a Portkey account, we recommend using the fully
              upgraded Portkey for an enhanced experience.
            </div>
          </div>
        ),
      });
      if (isOk) {
        return SignUpValue.cancelRegister;
      }
      return SignUpValue.cancelRegister;
    }
    return SignUpValue.cancelRegister;
  }, []);

  const upgradedPortkey = useCallback(async () => {
    console.log('upgradedPortkey');
    const isOk = await modalMethod({
      wrapClassName: 'portkey-switch-version-modal-wrapper',
      type: 'confirm',
      okText: 'Switch to V2',
      // cancelText: '',
      content: (
        <div className="modal-content">
          <h2>Continue with this account?</h2>
          <div className="inner">
            This account is not registered yet. If you wish to create a Portkey account, we recommend using the fully
            upgraded Portkey for an enhanced experience.
          </div>
        </div>
      ),
    });

    console.log(isOk, 'isOk==');
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
        defaultChainId={CHAIN_ID}
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
          ref.current?.setOpen(false);
          setLifeCycle(undefined);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
        onSignUp={onSignUpHandler}
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
        upgradedPortkey={upgradedPortkey}
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
