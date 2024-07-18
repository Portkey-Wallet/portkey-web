import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import BackHeaderForPage from '../BackHeaderForPage';
import SwitchComponent from '../SwitchComponent';
import Copy from '../Copy';
import { divDecimals, formatAmountShow } from '../../utils/converter';
import singleMessage from '../CustomAnt/message';
import { unApproveTokenAllowance } from '../../utils/sandboxUtil/unapproveTokenAllowance';
import { handleErrorMessage, setLoading } from '../../utils';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import './index.less';
import { AllowanceItem, ISymbolApprovedItem } from '@portkey/services';
import TokenImageDisplay from '../TokenImageDisplay';
import { ZERO } from '../../constants/misc';

export type ITokenAllowanceDetailProps = AllowanceItem & {
  onBack?: () => void;
};

export default function TokenAllowanceDetailMain({
  chainId = 'AELF',
  contractAddress,
  url,
  icon,
  name,
  symbolApproveList,
  onBack,
}: ITokenAllowanceDetailProps) {
  const [{ caHash }] = usePortkeyAsset();

  const [cancelApproveMap, setCancelApproveMap] = useState<{ [x in string]: boolean }>({});

  const handleSwitchChange = useCallback(
    async (checked: boolean, symbol: string) => {
      if (!checked) {
        try {
          setLoading(true);
          await unApproveTokenAllowance({
            caHash: caHash || '',
            targetChainId: chainId,
            contractAddress,
            amount: Number.MAX_SAFE_INTEGER,
            symbol,
          });
          setCancelApproveMap((v) => {
            v[symbol] = true;
            return { ...v };
          });
          singleMessage.success('Approve multiple token disabled');
        } catch (e) {
          singleMessage.error(handleErrorMessage(e, 'Handle unapproved Token Allowance Error'));
        } finally {
          setLoading(false);
        }
      } else {
        singleMessage.error('Please interact with the dApp and initiate transaction again to enable this function.');
      }
    },
    [caHash, chainId, contractAddress],
  );

  const providedName = useMemo(() => name || 'Unknown', [name]);

  const checkCanClose = useCallback(
    (symbolAllowance: ISymbolApprovedItem) => {
      const symbol = symbolAllowance.symbol;
      if (cancelApproveMap[symbol]) return false;
      return ZERO.plus(symbolAllowance.amount).gt(0);
    },
    [cancelApproveMap],
  );

  return (
    <div className={clsx('portkey-ui-token-allowance-detail-wrapper')}>
      <BackHeaderForPage title={`Token Allowance`} leftCallBack={onBack} />
      <div className="portkey-ui-flex-column portkey-ui-flex-center token-info-header-wrapper">
        <TokenImageDisplay src={icon} symbol={providedName} width={64} />
        <div className="token-name">{providedName}</div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="token-url-wrapper">
          {url}
        </a>
      </div>
      <div className="portkey-ui-flex-column contract-address-wrapper">
        <div className="contract-address-label">Contract Address</div>
        <div className="contract-address portkey-ui-flex-row-center">
          <div className="contract-address-text">{contractAddress}</div>
          <Copy toCopy={contractAddress} className="contract-copy-icon" />
        </div>
      </div>
      <div className="token-info-divide" />

      {symbolApproveList?.map((item) => (
        <div className="approve-token-wrapper" key={item.symbol}>
          <div className="approve-token-title portkey-ui-flex-between-center">
            <div>{`Approve ${item.symbol}`}</div>

            <SwitchComponent
              onChange={(checked: boolean) => handleSwitchChange(checked, item.symbol)}
              checked={checkCanClose(item)}
            />
          </div>

          <div className="approve-token-desc">
            The dApp will not request your approval until the allowance is exhausted.
          </div>

          {checkCanClose(item) && (
            <div className="approve-amount-wrapper">
              <div className="approve-amount-title">Amount approved</div>
              <div className="approve-amount-text-wrapper portkey-ui-flex-row-center">
                <div className="approve-amount-text">{formatAmountShow(divDecimals(item.amount, item.decimals))}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
