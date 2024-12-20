import TokenAmountInput from '../../../TokenAmountInput';
import { AssetTokenExpand } from '../../../types/assets';
import TokenAmountShow from './TokenAmountShow';

export default function AmountInput({
  fromAccount,
  type = 'token',
  toAccount,
  value,
  usdValue,
  token,
  warningTip,
  onChange,
  getTranslationInfo,
  setErrorMsg,
  setValue,
  setUsdValue,
  onPressMax,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  type: 'token' | 'nft';
  toAccount: { address: string };
  value: string;
  usdValue: string;
  token: AssetTokenExpand;
  warningTip?: string;
  onChange: (params: { amount: string; balance: string }) => void;
  getTranslationInfo: (v: string) => void;
  setErrorMsg: (v: string) => void;
  setValue: (v: string) => void;
  setUsdValue: (v: string) => void;
  onPressMax: () => void;
}) {
  return (
    <>
      <TokenAmountShow
        type={type}
        fromAccount={{
          address: fromAccount.address,
          AESEncryptPrivateKey: fromAccount.AESEncryptPrivateKey,
        }}
        toAccount={{
          address: toAccount.address,
        }}
        token={token}
        value={value}
        errorMsg={warningTip}
        onChange={onChange}
        getTranslationInfo={getTranslationInfo}
        setErrorMsg={setErrorMsg}
        setValue={setValue}
        setUsdValue={setUsdValue}
        onPressMax={onPressMax}></TokenAmountShow>
      <TokenAmountInput
        type={type}
        symbol={token.symbol}
        showErrorInput
        label={token.label}
        warningTip={warningTip}
        value={value}
        usdValue={usdValue}
        decimals={token.decimals}
        setValue={setValue}
        setUsdValue={setUsdValue}
      />
    </>
  );
}
