import clsx from 'clsx';
import { useCallback, useState } from 'react';
import BackHeaderForPage from '../BackHeaderForPage';
import SwitchComponent from '../SwitchComponent';
import Copy from '../Copy';
import { formatAmountShow } from '../../utils/converter';
import singleMessage from '../CustomAnt/message';
import { unapproveTokenAllowance } from '../../utils/sandboxUtil/unapproveTokenAllowance';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import './index.less';
import { AllowanceItem } from '@portkey/services';

export type ITokenAllowanceDetailProps = AllowanceItem & {
  onBack?: () => void;
};

export default function TokenAllowanceDetailMain({
  chainId = 'AELF',
  contractAddress,
  url,
  icon,
  name,
  allowance,
  onBack,
}: ITokenAllowanceDetailProps) {
  const [isOpen, setOpen] = useState(allowance > 0);

  const handleSwitchChange = useCallback(async () => {
    if (isOpen) {
      try {
        setLoading(true);
        await unapproveTokenAllowance({
          targetChainId: chainId,
          contractAddress,
          amount: Number.MAX_SAFE_INTEGER,
        });
        setOpen(false);
      } catch (e) {
        errorTip({
          errorFields: 'Handle Unapprove Token Allowance Error',
          error: handleErrorMessage(e),
        });
      } finally {
        setLoading(false);
      }
    } else {
      singleMessage.error('Please interact with the dApp and initiate transaction again to enable this function.');
    }
  }, [chainId, contractAddress, isOpen]);

  return (
    <div className={clsx('portkey-ui-token-allowance-detail-wrapper')}>
      <BackHeaderForPage title={`Token Allowance`} leftCallBack={onBack} />
      <div className="portkey-ui-flex-column portkey-ui-flex-center token-info-header-wrapper">
        <img src={icon} className="token-image" />
        <div className="token-name">{name}</div>
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
      <div className="approve-token-wrapper">
        <div className="approve-token-title">Approve multiple tokens</div>
        <div className="approve-token-desc">
          This will approve access to all tokens and the dApp will not request your approval until the allowance is
          exhausted.
        </div>
        <SwitchComponent text={isOpen ? 'Open' : 'Close'} onChange={handleSwitchChange} checked={isOpen} />
        {isOpen && (
          <div className="approve-amount-wrapper">
            <div className="approve-amount-title">Amount approved</div>
            <div className="approve-amount-text-wrapper portkey-ui-flex-row-center">
              <div className="approve-amount-text">{formatAmountShow(allowance)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
