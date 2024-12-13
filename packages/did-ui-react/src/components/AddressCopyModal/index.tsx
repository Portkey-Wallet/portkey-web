import { useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ChainId } from '@portkey/types';
import CommonModal from '../CommonModal';
import CustomSvg from '../CustomSvg';
import Copy from '../Copy';
import { formatStr2EllipsisStr } from '../../utils';
import { transNetworkText } from '../../utils/converter';
import { getChainIconType } from '../../utils/assets';
import './index.less';

interface ICAAddressInfo {
  chainId: ChainId;
  caAddress: string;
}

interface IAddressCopyModalProps {
  isMainnet: boolean;
  caAddressInfos?: ICAAddressInfo[];
}

export interface IAddressCopyModalRef {
  open: () => void;
}

const AddressCopyModal = forwardRef(({ isMainnet, caAddressInfos }: IAddressCopyModalProps, ref) => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
  }));

  return (
    <CommonModal className="portkey-ui-address-copy-modal" width={400} height={232} open={open} onClose={handleClose}>
      <div className="portkey-ui-address-copy-modal-title">Your addresses</div>
      {caAddressInfos?.map((item, index) => (
        <div key={index} className="portkey-ui-address-copy-modal-item">
          <div className="portkey-ui-address-copy-modal-item-chain-wrap">
            <CustomSvg
              className="portkey-ui-address-copy-modal-item-chain-icon"
              type={getChainIconType(item.chainId)}
            />
            <div className="portkey-ui-address-copy-modal-item-chain">
              <div className="portkey-ui-address-copy-modal-item-chain-text">
                {transNetworkText(item.chainId, isMainnet)}
              </div>
              <div className="portkey-ui-address-copy-modal-item-chain-address">{`ELF_${formatStr2EllipsisStr(
                item.caAddress,
                [4, 4],
              )}_${item.chainId}`}</div>
            </div>
          </div>
          <Copy
            iconClassName="portkey-ui-address-copy-modal-item-copy"
            toCopy={`ELF_${item.caAddress}_${item.chainId}`}
          />
        </div>
      ))}
    </CommonModal>
  );
});

export default AddressCopyModal;
