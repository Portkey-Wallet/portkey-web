import clsx from 'clsx';
import { useMemo, useState } from 'react';
import Copy from '../Copy';
import { divDecimals, formatAmountShow } from '../../utils/converter';
import singleMessage from '../CustomAnt/message';
import { unApproveTokenAllowance } from '../../utils/sandboxUtil/unapproveTokenAllowance';
import { formatStr2EllipsisStr, handleErrorMessage, setLoading } from '../../utils';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { AllowanceItem, ISymbolApprovedItem } from '@portkey/services';
import TokenImageDisplay from '../TokenImageDisplay';
import CustomSvg from '../CustomSvg';
import ChainTokenIcon from '../ChainTokenIcon';
import { formatTimeDifference } from '../../utils/time';

import './index.less';
import CoinImage from '../CoinImage';

export type ITokenAllowanceDetailProps = AllowanceItem & {
  onBack?: () => void;
};

export default function TokenAllowanceDetailMain({
  chainImageUrl,
  chainId = 'AELF',
  contractAddress,
  url,
  icon,
  name,
  symbolApproveList,
  onBack,
}: ITokenAllowanceDetailProps) {
  const [{ caHash }] = usePortkeyAsset();

  const [approvedList, setApprovedList] = useState<ISymbolApprovedItem[]>(
    symbolApproveList?.filter((item) => item.amount > 0) || [],
  );
  const [revokeList, setRevokeList] = useState<ISymbolApprovedItem[]>(
    symbolApproveList?.filter((item) => item.amount <= 0) || [],
  );
  const onRevokeClick = async (item: ISymbolApprovedItem) => {
    try {
      setLoading(true);
      await unApproveTokenAllowance({
        caHash: caHash || '',
        targetChainId: chainId,
        contractAddress,
        amount: Number.MAX_SAFE_INTEGER,
        symbol: item.symbol,
      });

      setApprovedList(approvedList.filter((approvedItem) => approvedItem.symbol !== item.symbol));
      setRevokeList([...revokeList, item]);
      singleMessage.success('Approve multiple token disabled');
    } catch (e) {
      singleMessage.error(handleErrorMessage(e, 'Handle unapproved Token Allowance Error'));
    } finally {
      setLoading(false);
    }
  };

  const providedName = useMemo(() => name || 'Unknown', [name]);

  return (
    <div className={clsx('portkey-ui-token-allowance-detail-wrapper')}>
      <div className="payment-security-detail-nav">
        <div className="left-icon" onClick={onBack}>
          <CustomSvg type="ArrowLeft" fillColor="var(--sds-color-icon-default-default)" />
        </div>
        <div className="payment-security-detail-header">
          <p className="symbol">Token Allowances</p>
        </div>
      </div>
      <div className="portkey-ui-flex-column portkey-ui-flex-center token-info-header-wrapper">
        <CoinImage src={icon} symbol={providedName} width={80} />
        <div className="token-name">{providedName}</div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="token-url-wrapper">
          {url}
        </a>
      </div>

      <div className="contract-address-wrapper">
        <span className="label">Contract Address</span>
        <span className="address">
          {formatStr2EllipsisStr(contractAddress, [7, 8])}
          <Copy toCopy={contractAddress} />
        </span>
      </div>

      <div className="approval-token-wrapper">
        {approvedList && approvedList.length > 0 && (
          <>
            <div className="title">Approvals</div>
            <div className="subtitle">
              The dApp won&apos;t ask for your approval for the tokens below until their allowance is used up.
            </div>
            {approvedList.map((item) => (
              <div key={item.symbol} className="approve-item">
                <div className="token-detail">
                  <ChainTokenIcon
                    symbol={item.symbol}
                    imageUrl={item.imageUrl || ''}
                    chainImageUrl={chainImageUrl || ''}
                  />
                  <div className="action" onClick={() => onRevokeClick(item)}>
                    <CustomSvg type="Delete" fillColor="var(--sds-color-text-danger-tertiary)" />
                    <span>Revoke</span>
                  </div>
                </div>
                <div className="approve-amount">
                  <span>Approved amount</span>
                  <span>{formatAmountShow(divDecimals(item.amount, item.decimals))}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {revokeList && revokeList.length > 0 && (
          <>
            <div className="title">Revoked</div>
            <div className="subtitle">
              To re-approve token allowance, go to the dApp site and initiate a transaction of the token type.
            </div>
            {revokeList.map((item) => (
              <div key={item.symbol} className="revoked-item">
                <div className="token-detail">
                  <ChainTokenIcon
                    showSymbol
                    symbol={item.symbol}
                    imageUrl={item.imageUrl || ''}
                    chainImageUrl={chainImageUrl || ''}
                  />
                  <div className="date-difference">{`Revoked ${formatTimeDifference(Number(item.updateTime))}`}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
