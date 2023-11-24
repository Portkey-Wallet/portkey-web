import { AssetTokenExpand } from '../../../types/assets';
import NftInput from './NftInput';
import TokenInput from './TokenInput';

export default function AmountInput({
  fromAccount,
  type = 'token',
  toAccount,
  value,
  token,
  errorMsg,
  onChange,
  getTranslationInfo,
  setErrorMsg,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  type: 'token' | 'nft';
  toAccount: { address: string };
  value: string;
  token: AssetTokenExpand;
  errorMsg: string;
  onChange: (params: { amount: string; balance: string }) => void;
  getTranslationInfo: (v: string) => void;
  setErrorMsg: (v: string) => void;
}) {
  return type === 'token' ? (
    <TokenInput
      toAccount={toAccount}
      getTranslationInfo={getTranslationInfo}
      setErrorMsg={setErrorMsg}
      fromAccount={fromAccount}
      value={value}
      token={token}
      errorMsg={errorMsg}
      onChange={onChange}
    />
  ) : (
    <NftInput fromAccount={fromAccount} value={value} token={token} errorMsg={errorMsg} onChange={onChange} />
  );
}
