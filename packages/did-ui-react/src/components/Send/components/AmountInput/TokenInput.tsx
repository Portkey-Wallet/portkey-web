import { Button, Input } from 'antd';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { AssetTokenExpand } from '../../../types/assets';
import { handleKeyDown } from '../../utils/handlerKey';
import { divDecimals, formatAmountShow } from '../../../../utils/converter';
import { ZERO } from '../../../../constants/misc';
import { usePortkey } from '../../../context';
import { MAINNET } from '../../../../constants/network';
import { getBalanceByContract } from '../../../../utils/sandboxUtil/getBalance';
import { useDefaultToken } from '../../../../hooks/assets';
import { useTokenPrice } from '../../../context/PortkeyAssetProvider/hooks';
import { amountInUsdShow } from '../../../../utils/assets';
import { useCheckManagerSyncState } from '../../../../hooks/wallet';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { useFeeByChainId } from '../../../context/PortkeyAssetProvider/hooks/txFee';
import { useThrottleFirstEffect } from '../../../../hooks/throttle';
import TokenImageDisplay from '../../../TokenImageDisplay';

export default function TokenInput({
  fromAccount,
  token,
  value,
  errorMsg,
  onChange,
  getTranslationInfo,
  setErrorMsg,
}: {
  fromAccount: { address: string; AESEncryptPrivateKey: string };
  toAccount: { address: string };
  token: AssetTokenExpand;
  value: string;
  errorMsg: string;
  onChange: (params: { amount: string; balance: string }) => void;
  getTranslationInfo: (num: string) => any;
  setErrorMsg: (v: string) => void;
}) {
  const [{ chainType, networkType, sandboxId }] = usePortkey();
  const [{ caHash, managementAccount }] = usePortkeyAsset();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [amount, setAmount] = useState<string>(value ? `${value} ${token.symbol}` : '');
  const [balance, setBalance] = useState<string>(token.balance || '');
  const [maxAmount, setMaxAmount] = useState('');
  const price = useTokenPrice(token.symbol);
  const checkManagerSyncState = useCheckManagerSyncState();
  const [isManagerSynced, setIsManagerSynced] = useState(true);
  const { max: maxFee } = useFeeByChainId(token.chainId);
  const defaultToken = useDefaultToken(token.chainId);

  console.log(value || amount, price, balance, 'price===');

  const amountInUsd = useMemo(
    () =>
      amountInUsdShow({
        balance: value || amount,
        decimal: 0,
        price,
      }),
    [amount, price, value],
  );

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
  }, [chainType, fromAccount.address, sandboxId, token.address, token.chainId, token.symbol]);

  const getMaxAmount = useCallback(async () => {
    if (!balance) {
      setMaxAmount('0');
      return;
    }
    if (token.symbol === defaultToken.symbol) {
      if (ZERO.plus(divDecimals(balance, token.decimals)).isLessThanOrEqualTo(maxFee)) {
        setMaxAmount(divDecimals(balance, token.decimals).toString());
        return;
      }
      if (!caHash || !managementAccount?.address) {
        setMaxAmount('0');

        return;
      }
      const _isManagerSynced = await checkManagerSyncState(token.chainId, caHash, managementAccount.address);
      setIsManagerSynced(_isManagerSynced);
      if (!_isManagerSynced) return;
      const fee = await getTranslationInfo(divDecimals(balance, token.decimals).toString());
      if (fee) {
        setMaxAmount(divDecimals(balance, token.decimals).toString());
      } else {
        setMaxAmount(ZERO.plus(divDecimals(balance, token.decimals)).minus(maxFee).toString());
      }
    } else {
      setMaxAmount(divDecimals(balance, token.decimals).toString());
    }
  }, [
    balance,
    caHash,
    checkManagerSyncState,
    defaultToken.symbol,
    getTranslationInfo,
    managementAccount,
    maxFee,
    token.chainId,
    token.decimals,
    token.symbol,
  ]);

  useThrottleFirstEffect(() => {
    getTokenBalance();
    getMaxAmount();
  }, [getMaxAmount, getTokenBalance]);

  const handleAmountBlur = useCallback(() => {
    onChange({ amount, balance });
  }, [amount, balance, onChange]);

  const handleMax = useCallback(async () => {
    if (!caHash || !managementAccount?.address) {
      return setErrorMsg('Please login');
    }
    const _isManagerSynced = await checkManagerSyncState(token.chainId, caHash, managementAccount.address);
    setIsManagerSynced(_isManagerSynced);
    if (_isManagerSynced) {
      setAmount(maxAmount);
      onChange({ amount: maxAmount, balance });
      setErrorMsg('');
    } else {
      setErrorMsg('Synchronizing on-chain account information...');
    }
  }, [balance, caHash, checkManagerSyncState, managementAccount, maxAmount, onChange, setErrorMsg, token.chainId]);

  return (
    <div className="amount-wrap">
      <div className="item asset">
        <span className="label">Asset:</span>
        <div className="control">
          <div className="asset-selector">
            <div className="icon">
              <TokenImageDisplay src={token.imageUrl} width={24} symbol={token.symbol} />
            </div>
            <div className="center">
              <p className="symbol">{token?.symbol}</p>
              <p className="amount">{`Balance: ${formatAmountShow(divDecimals(balance, token.decimals))} ${
                token?.symbol
              }`}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="item amount">
        <div className="label">
          <div>Amount:</div>
          <Button onClick={handleMax}>Max</Button>
        </div>
        <div className="control">
          <div className="amount-input">
            <Input
              type="text"
              placeholder={`0`}
              className={clsx(isMainnet && 'need-convert')}
              value={amount}
              maxLength={18}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setAmount((v) => v?.replace(` ${token?.symbol}`, ''));
              }}
              onBlur={handleAmountBlur}
              onChange={(e) => {
                setAmount(e.target.value);
                onChange({ amount: e.target.value, balance });
              }}
            />
            {isMainnet && <span className="convert">{amountInUsd}</span>}
          </div>
        </div>
      </div>
      {errorMsg && <span className={clsx([!isManagerSynced && 'error-warning', 'error-msg'])}>{errorMsg}</span>}
    </div>
  );
}
