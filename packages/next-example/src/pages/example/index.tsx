import {
  ConfigProvider,
  SignUpAndLogin,
  SetPinAndAddManager,
  VerifierSelect,
  CodeVerify,
  GuardianApproval,
  PortkeyLoading,
  UserInput,
  SignIn,
} from '@portkey/did-ui-react';
import { useState } from 'react';
import { Store } from '../../utils';
import { RecaptchaType } from '@portkey/services';

const myStore = new Store();
ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
  network: {
    defaultNetwork: 'TESTNET',
    networkList: [
      {
        name: 'aelf Testnet',
        walletType: 'aelf',
        networkType: 'TESTNET',
        isActive: true,
        apiUrl: '',
        graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
        connectUrl: '',
      },
    ],
  },
});

function Example() {
  const [isLoading, setLoading] = useState<any>();

  return (
    <div>
      <button
        onClick={async () => {
          setLoading(true);
        }}>
        ShowLoading
      </button>
      <PortkeyLoading
        loading={isLoading}
        loadingText={'Synchronizing on-chain account information...'}
        cancelable
        onCancel={() => setLoading(false)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridGap: 10 }}>
        <SignUpAndLogin
          style={{ height: 600, border: '1px solid gray' }}
          termsOfService={'https://portkey.finance/terms-of-service'}
          socialLogin={{
            Portkey: {
              websiteName: 'website demo name',
              websiteIcon: '',
            },
          }}
          onError={(error: any) => {
            console.log('onError', error);
          }}
          onSuccess={(value: any) => {
            console.log('onSuccess:', value);
          }}
        />
        <UserInput
          style={{ height: 600, border: '1px solid gray' }}
          termsOfService={'https://portkey.finance/terms-of-service'}
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
        />
        <CodeVerify
          chainId="AELF"
          isErrorTip
          accountType="Phone"
          verifier={{
            endPoints: ['http://192.168.66.240:16010'],
            verifierAddresses: ['2mBnRTqXMb5Afz4CWM2QakLRVDfaq2doJNRNQT1MXoi2uc6Zy3'],
            id: 'd0e2442158b870190362c8daea87a6687a59fef94937a88bd7dcb464e8e21025',
            name: 'Portkey',
            imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/Portkey.png',
          }}
          verifierSessionId={'080bbdcd-73f5-45a6-b65b-0d067474756f'}
          guardianIdentifier={'+852 12233333'}
          verifierCodeOperation={1}
          onError={(error: any) => {
            console.log('SetPinAndAddManager:onError', error);
          }}
          onSuccess={result => {
            console.log('SetPinAndAddManager:onConfirm', result);
          }}
        />
        <GuardianApproval
          chainId="AELF"
          operationType={RecaptchaType.communityRecovery}
          wrapperStyle={{ height: 600 }}
          verifierCodeOperation={2}
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
          ]}
        />
        <div style={{ height: 600 }}>
          <SignIn
            uiType="Full"
            design="SocialDesign"
            isShowScan
            className="sign-in-wrapper"
            // termsOfService={'https://portkey.finance/terms-of-service'}
            onFinish={async res => {
              console.log(res, 'onFinish====');
            }}
            onError={error => {
              console.log(error, 'onError====error');
            }}
            onCancel={() => {
              // ref1?.current.setOpen(false);
            }}
            onCreatePending={info => {
              console.log(info, 'onCreatePending====info');
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Example;
