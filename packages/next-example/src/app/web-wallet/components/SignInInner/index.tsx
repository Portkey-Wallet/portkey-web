import { ISignIn, SignIn, SignInProps } from '@portkey/did-ui-react';
import React, { useRef } from 'react';
import { useWebWallet } from '../../context/WalletProvider';

export default function SignInInner({ onSignInFinish }: { onSignInFinish: SignInProps['onFinish'] }) {
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
        onFinish={onSignInFinish}
        onError={error => {
          console.log(error, 'onError====error');
        }}
      />
    </div>
  );
}
