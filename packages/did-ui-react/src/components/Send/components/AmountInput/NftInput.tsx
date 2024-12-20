import { Input } from 'antd';
import { useCallback, useState } from 'react';
import { AssetTokenExpand } from '../../../types/assets';
import { divDecimalsStr } from '../../../../utils/converter';
import { handleDecimalInput, handleKeyDown, handleKeyDownInt } from '../../utils/handlerKey';
import { useThrottleFirstEffect } from '../../../../hooks/throttle';
import { getBalanceByContract } from '../../../../utils/sandboxUtil/getBalance';
import { usePortkey } from '../../../context';
import NFTImage from '../../../NFTImage';

export default function NftInput({
  fromAccount,
  token,
  value,
  errorMsg,
  onChange,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  token: AssetTokenExpand;
  value: string;
  errorMsg: string;
  onChange: (params: { amount: string; balance: string }) => void;
}) {
  const [{ chainType, sandboxId }] = usePortkey();

  const [amount, setAmount] = useState<string>(value);
  const [balance, setBalance] = useState<string>(token.balance || '');

  const handleAmountBlur = useCallback(() => {
    onChange({ amount, balance });
  }, [amount, balance, onChange]);

  const getTokenBalance = useCallback(async () => {
    const result = await getBalanceByContract({
      sandboxId,
      chainId: token.chainId,
      tokenContractAddress: token.address || '',
      chainType,
      paramsOption: {
        owner: fromAccount.address,
        symbol: token.symbol,
      },
    });
    const balance = result.balance;
    setBalance(balance);
    console.log(result, 'balances==getTokenBalance=');
  }, [chainType, fromAccount.address, sandboxId, token]);

  useThrottleFirstEffect(() => {
    getTokenBalance();
  }, [getTokenBalance]);
  return (
    <div className="amount-wrap">
      <div className="item asset nft">
        <NFTImage name={token.symbol} imageUrl={token.imageUrl} isSeed={token?.isSeed} seedType={token?.seedType} />
        <div className="info">
          <div className="index">
            <p className="alias">{token.alias}</p>
            <p className="token-id">#{token.tokenId}</p>
          </div>
          <p className="quantity">
            Balance: <span>{`${divDecimalsStr(balance, token.decimals)}`}</span>
          </p>
        </div>
      </div>
      <div className="item amount">
        <span className="label">Amount:</span>
        <div className="control">
          <div className="amount-input">
            <Input
              type="text"
              maxLength={18}
              placeholder={`0`}
              value={amount}
              onInput={(event: any) => handleDecimalInput(event, token.decimals)}
              onKeyDown={Number(token.decimals) > 0 ? handleKeyDown : handleKeyDownInt}
              onBlur={handleAmountBlur}
              onChange={(e) => {
                setAmount(e.target.value);
                onChange({ amount: e.target.value, balance });
              }}
            />
          </div>
        </div>
      </div>
      {errorMsg && <span className="error-msg">{errorMsg}</span>}
    </div>
  );
}
