import TokenAmountInput from '../../../TokenAmountInput';
import { AssetTokenExpand } from '../../../types/assets';
import TokenAmountShow from './TokenAmountShow';

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
  return (
    <>
      <TokenAmountShow
        type={'nft'}
        fromAccount={{
          address: '',
          AESEncryptPrivateKey: '',
        }}
        toAccount={{
          address: '',
        }}
        token={token}
        value={''}
        errorMsg={''}
        onChange={function (params: { amount: string; balance: string }): void {
          throw new Error('Function not implemented.');
        }}
        getTranslationInfo={function (num: string) {
          throw new Error('Function not implemented.');
        }}
        setErrorMsg={function (v: string): void {
          throw new Error('Function not implemented.');
        }}></TokenAmountShow>
      <TokenAmountInput
        symbol={token.symbol}
        decimals={token.decimals}
        setValue={function (v: string): void {
          throw new Error('Function not implemented.');
        }}
        setUsdValue={function (v: string): void {
          throw new Error('Function not implemented.');
        }}
      />
    </>
  );
}
