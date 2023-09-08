import { Input } from 'antd';
import { useCallback, useState } from 'react';
import { AssetTokenExpand } from '../../../types/assets';
import { divDecimals, formatAmountShow } from '../../../../utils/converter';
import { handleKeyDownInt } from '../../utils/handlerKey';
import { useThrottleEffect } from '../../../../hooks/throttle';
import { getBalanceByContract } from '../../../../utils/sandboxUtil/getBalance';
import { usePortkey } from '../../../context';

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
      tokenContractAddress: token.address,
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

  useThrottleEffect(() => {
    getTokenBalance();
  }, [getTokenBalance]);
  return (
    <div className="amount-wrap">
      <div className="item asset nft">
        <div className="avatar">{token.imageUrl ? <img src={token.imageUrl} /> : <p>{token.symbol[0]}</p>}</div>
        <div className="info">
          <div className="index">
            <p className="alias">{token.alias}</p>
            <p className="token-id">#{token.tokenId}</p>
          </div>
          <p className="quantity">
            Balance: <span>{`${formatAmountShow(divDecimals(balance, token.decimals))}`}</span>
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
              onKeyDown={handleKeyDownInt}
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
