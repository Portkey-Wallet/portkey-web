import {
  ConfigProvider,
  SignUpAndLogin,
  SetPinAndAddManager,
  VerifierSelect,
  CodeVerify,
  GuardianApproval,
  PortkeyLoading,
  UserInput,
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <SignUpAndLogin
          style={{ height: 600 }}
          termsOfService={
            <>
              termsOfService: <a href="https://portkey.finance/terms-of-service"></a>
            </>
          }
          extraElement={
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
            </div>
          }
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
        <VerifierSelect
          operationType={RecaptchaType.register}
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
          guardianList={[
            {
              isLoginAccount: true,
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
        <UserInput
          style={{ height: 600, border: '1px solid red' }}
          termsOfService={'https://portkey.finance/terms-of-service'}
          extraElement={
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
              <button>button</button>
            </div>
          }
          onError={(error: any) => {
            console.log('onError', error);
          }}
          onSuccess={(value: any) => {
            console.log('onSuccess:', value);
          }}
        />
      </div>
    </div>
  );
}

export default Example;
