import { ISignIn, SignIn, SignInProps } from '@portkey/did-ui-react';
import React, { useRef } from 'react';
import { useWebWallet } from '../../context/WalletProvider';

export default function SignInInner({
  onSignInFinish,
  beforeCreatePending,
  onCreatePending,
  defaultLifeCycle,
}: {
  onSignInFinish: SignInProps['onFinish'];
  beforeCreatePending?: SignInProps['beforeCreatePending'];
  onCreatePending?: SignInProps['onCreatePending'];
  defaultLifeCycle?: SignInProps['defaultLifeCycle'];
}) {
  const ref = useRef<ISignIn>();
  const [{ options }] = useWebWallet();

  return (
    <div>
      <SignIn
        ref={ref}
        keyboard={true}
        design={'CryptoDesign'}
        uiType={'Full'}
        defaultChainId={options?.networkType === 'MAINNET' ? 'tDVV' : 'tDVW'}
        defaultLifeCycle={defaultLifeCycle}
        onFinish={onSignInFinish}
        beforeCreatePending={beforeCreatePending}
        onCreatePending={onCreatePending}
        onError={error => {
          console.log(error, 'onError====error');
        }}
      />
    </div>
  );
}
