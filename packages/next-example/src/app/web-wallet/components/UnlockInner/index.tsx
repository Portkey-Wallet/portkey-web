import { useWebWallet } from '@portkey/connect-web-wallet';
import { did, Unlock } from '@portkey/did-ui-react';
import React, { useCallback, useMemo, useState } from 'react';
import { getWebWalletStorageKey } from '../../utils/wallet';
import './index.css';

export interface IUnlockInnerProps {
  onUnlock: (password: string) => void;
  onForgetPin: () => void;
}

export default function UnlockInner({ onUnlock, onForgetPin }: IUnlockInnerProps) {
  const [password, setPassword] = useState<string>('');
  const [{ options }] = useWebWallet();

  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const onUnlockInternal = useCallback(
    async (pin: string) => {
      const wallet = await did.load(pin, getWebWalletStorageKey(options?.appId));
      if (wallet.didWallet.aaInfo.accountInfo?.caAddress) {
        setIsWrongPassword(false);
        setPassword('');
        onUnlock(pin);
      } else {
        setIsWrongPassword(true);
        setPassword('');
      }
    },
    [options?.appId, onUnlock],
  );

  const forgetPinElement = useMemo(() => {
    return (
      <div className="unlock-footer-text">
        Forget PIN?
        <span className="unlock-footer-text-href" onClick={onForgetPin}>
          Log back in
        </span>
      </div>
    );
  }, [onForgetPin]);

  return (
    <Unlock
      uiType="Full"
      value={password}
      className="web-wallet-unlock-wrapper"
      isWrongPassword={isWrongPassword}
      keyboard
      onChange={setPassword}
      onUnlock={onUnlockInternal}
      footer={forgetPinElement}
    />
  );
}
