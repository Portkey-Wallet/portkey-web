import clsx from 'clsx';
import { ChainId } from '@portkey/types';
import { useCallback, useState } from 'react';
import BackHeaderForPage from '../BackHeaderForPage';
import SwitchComponent from '../SwitchComponent';
import Copy from '../Copy';
import { formatAmountShow } from '../../utils/converter';
import singleMessage from '../CustomAnt/message';
import { unapproveTokenAllowance } from '../../utils/sandboxUtil/unapproveTokenAllowance';
import { errorTip, handleErrorMessage, setLoading } from '../../utils';
import './index.less';

export interface ITokenAllowanceDetailProps {
  chainId?: ChainId;
  contractAddress: string;
  url: string;
  icon: string;
  name: string;
  allowance: number;
  onBack?: () => void;
}

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
          allownance: allowance,
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
  }, [allowance, chainId, contractAddress, isOpen]);

  return (
    <div className={clsx('portkey-ui-token-allowance-detail-wrapper')}>
      <BackHeaderForPage title={`Details`} leftCallBack={onBack} />
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
        <div className="approve-token-desc">Skip guradians approve after enabled enough amount</div>
        <SwitchComponent text={isOpen ? 'Open' : 'Close'} onChange={handleSwitchChange} checked={isOpen} />
        {isOpen && (
          <div className="approve-amount-wrapper">
            <div className="approve-amount-title">Approve Amount</div>
            <div className="approve-amount-text-wrapper portkey-ui-flex-row-center">
              <div className="approve-amount-text">{formatAmountShow(allowance)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
