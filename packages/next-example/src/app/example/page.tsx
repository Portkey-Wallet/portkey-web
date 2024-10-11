'use client';
import './index.css';

import {
  ConfigProvider,
  SignIn,
  Web2Design,
  ISignIn,
  CommonModal,
  PortkeyNumberKeyboard,
  Unlock,
  ThrottleButton,
} from '@portkey/did-ui-react';
import { useRef, useState, useMemo, useCallback } from 'react';
import { Button } from 'antd';
import { OfficialWebsite } from '@portkey/did-ui-react/src/constants/guardian';
// ConfigProvider.setGlobalConfig({
//   graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
// });

function Example() {
  const [isLoading, setLoading] = useState<any>();
  const ref = useRef<ISignIn>();
  const [visible, setVisible] = useState<boolean>();
  const [val, setVal] = useState<string>('');
  const [unlock, setUnlock] = useState<boolean>();
  const [password, setPassword] = useState<string>('');

  const forgetPinAction = useCallback(() => {
    console.log('forgetPinAction====');
  }, []);
  const forgetPinElement = useMemo(() => {
    return (
      <span className="unlock_footer_text">
        Forget Pin Code? Click{' '}
        <span className="unlock_footer_highlight" onClick={forgetPinAction}>
          Here
        </span>{' '}
        To Log Back In
      </span>
    );
  }, [forgetPinAction]);

  return (
    <div>
      <div id="wrapper"></div>
      <div>----------</div>
      <Button
        onClick={() => {
          setVisible(v => !v);
        }}>
        PortkeyNumberKeyboard
      </Button>
      <div>----------</div>
      PortkeyNumberKeyboard input: &nbsp;{val}
      <PortkeyNumberKeyboard visible={visible} onInput={v => setVal(_v => _v + v)} onDelete={() => setVal('')} />
      <div>----------</div>
      <Button
        onClick={() => {
          setUnlock(v => !v);
        }}>
        Unlock
      </Button>
      <Unlock
        open={unlock}
        value={password}
        isWrongPassword
        keyboard
        onChange={v => {
          console.log(v, 'setPassword===');
          setPassword(v);
        }}
        onUnlock={_p => {
          console.log(password, _p, 'onUnlock==');
        }}
        onCancel={() => setUnlock(false)}
        footer={forgetPinElement}
      />
      <div>----------</div>
      <div>----------</div>
      <SignIn
        ref={ref}
        uiType="Modal"
        getContainer="#wrapper"
        isShowScan
        className="sign-in-wrapper"
        termsOfService={'https://portkey.finance/terms-of-service'}
        privacyPolicy={'https://portkey.finance/privacy-policy'}
        onFinish={async res => {
          console.log(res, 'onFinish====');
        }}
        onError={error => {
          console.log(error, 'onError====error');
        }}
        onCancel={() => {
          ref.current?.setOpen(false);
        }}
        onCreatePending={info => {
          console.log(info, 'onCreatePending====info');
        }}
      />
      <CommonModal
        type="modal"
        closable={false}
        open={isLoading}
        className="confirm-return-modal"
        title={<div className="security-notice">Security Notice</div>}
        width={320}
        getContainer={'#set-pin-wrapper'}>
        <p className="modal-content">
          You&rsquo;ll be directed to <span className="official-website">{OfficialWebsite}</span> for verification. If
          the site you land on doesn&rsquo;t match this link,please exercise caution and refrain from taking any
          actions.
        </p>
        <div className="btn-warning-wrapper">
          <ThrottleButton className="btn-cancel" onClick={() => setLoading(false)}>
            Cancel
          </ThrottleButton>
          <ThrottleButton className="btn-confirm" type="primary">
            Proceed
          </ThrottleButton>
        </div>
      </CommonModal>
      <Button
        onClick={() => {
          ref.current?.setOpen(true);
        }}>
        setOpen
      </Button>
      <Button
        onClick={async () => {
          setLoading(true);
        }}>
        ShowLoading
      </Button>
      {/* <PortkeyLoading
        loading={isLoading}
        loadingText={'Synchronizing on-chain account information...'}
        cancelable
        onCancel={() => setLoading(false)}
      /> */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridGap: 10 }}>
          {/* <CryptoDesign
            style={{ height: 600, border: '1px solid gray' }}
            termsOfService={'https://portkey.finance/terms-of-service'}
            privacyPolicy={'https://portkey.finance/privacy-policy'}
            onError={(error: any) => {
              console.log('onError', error);
            }}
            onSuccess={(value: any) => {
              console.log('onSuccess:', value);
            }}
          />
          <SocialDesign
            style={{ height: 600, border: '1px solid gray' }}
            termsOfService={'https://portkey.finance/terms-of-service'}
            privacyPolicy={'https://portkey.finance/privacy-policy'}
            onError={(error: any) => {
              console.log('onError', error);
            }}
            onSuccess={(value: any) => {
              console.log('onSuccess:', value);
            }}
          />
          <VerifierSelect
            guardianIdentifier={'105383420233267798964'}
            accountType={'Google'}
            onError={(error: any) => {
              console.log('VerifierSelect:Error', error);
            }}
            onConfirm={result => {
              console.log('VerifierSelect:onConfirm', result);
            }}
          />
          <SetPinAndAddManager
            guardianApprovedList={[]}
            type={'recovery'}
            guardianIdentifier={'105383420233267798964'}
            onError={(error: any) => {
              console.log('SetPinAndAddManager:onError', error);
            }}
            onFinish={result => {
              console.log('SetPinAndAddManager:onConfirm', result);
            }}
          /> */}

          {/* <GuardianApproval
            chainId="AELF"
            operationType={OperationTypeEnum.communityRecovery}
            wrapperStyle={{ height: 600 }}
            guardianList={[
              {
                isLoginGuardian: true,
                verifier: {
                  endPoints: ['http://192.168.66.240:16010'],
                  verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
                  id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
                  name: 'Portkey',
                  imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
                },
                identifier: 'identifier',
                guardianType: 'Phone',
                key: '',
              },
              {
                isLoginGuardian: true,
                verifier: {
                  endPoints: ['http://192.168.66.240:16010'],
                  verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
                  id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
                  name: 'Portkey',
                  imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
                },
                identifier: 'identifier',
                guardianType: 'Apple',
                key: '',
              },
              {
                isLoginGuardian: true,
                verifier: {
                  endPoints: ['http://192.168.66.240:16010'],
                  verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
                  id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
                  name: 'Portkey',
                  imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
                },
                identifier: 'identifier',
                guardianType: 'Google',
                key: '',
              },
            ]}
          /> */}
        </div>
        <div>
          <Web2Design
            size="L"
            phoneCountry={{
              iso: 'CN',
              countryList: [
                {
                  country: 'China',
                  code: '86',
                  iso: 'CN',
                },
                {
                  country: 'Denmark',
                  code: '45',
                  iso: 'DK',
                },
                {
                  country: 'France',
                  code: '33',
                  iso: 'FR',
                },
                {
                  country: 'Hong Kong',
                  code: '852',
                  iso: 'HK',
                },
                {
                  country: 'Mexico',
                  code: '52',
                  iso: 'MX',
                },
                {
                  country: 'Singapore',
                  code: '65',
                  iso: 'SG',
                },
                {
                  country: 'United Kingdom',
                  code: '44',
                  iso: 'GB',
                },
                {
                  country: 'United States',
                  code: '1',
                  iso: 'US',
                },
              ],
            }}
            termsOfService={'https://portkey.finance/terms-of-service'}
            privacyPolicy={'https://portkey.finance/privacy-policy'}
            onError={(error: any) => {
              console.log('onError', error);
            }}
            onSuccess={(value: any) => {
              console.log('onSuccess:', value);
            }}
            loginMethodsOrder={['Telegram', 'Google', 'Apple', 'Google', 'Apple']}
            recommendIndexes={[0, 1]}
          />
        </div>
      </div>
      {/* <PortkeyBaseNumberKeyboard /> */}
    </div>
  );
}

export default Example;
