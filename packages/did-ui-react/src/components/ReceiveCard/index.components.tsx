import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';
import { ReactNode, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { transNetworkText } from '../../utils/converter';
import PortkeyQRCode from '../PortkeyQRCode';
import { ChainId } from '@portkey/types';
import { QRCodeDataObjType, shrinkSendQrData } from '../../utils/qrCode';
import { NetworkType } from '../../types';
import { MAINNET } from '../../constants/network';
import Copy from '../Copy';
import { supplementAllAelfAddress } from '../../utils/aelf';
import { useReceive } from '../../hooks/useReceive';
import SourceDestinationPicker from './components/SourceDestinationPicker';
import './index.less';
import { IUserTokenItemResponse } from '../types/assets';
import { ReceiveType } from '@portkey/services';

export interface ReceiveCardProps {
  receiveInfo: QRCodeDataObjType['toInfo'];
  assetInfo: QRCodeDataObjType['assetInfo'];
  networkType: NetworkType;
  title?: ReactNode;
  closeIcon?: ReactNode;
  symbolIcon?: string;
  backIcon?: ReactNode;
  className?: string;
  chainId: ChainId;
  onBack?: () => void;
}
export default function ReceiveCardMain({
  receiveInfo,
  assetInfo,
  symbolIcon,
  networkType,
  chainId,
  backIcon,
  className,
  closeIcon,
  title,
  onBack,
}: ReceiveCardProps) {
  const tokenInfo = {
    displayStatus: 'All' as const,
    imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
    isDefault: true,
    label: undefined,
    symbol: 'ELF',
    tokens: [
      {
        address: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
        chainId: 'AELF',
        chainImageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/mainChain.png',
        decimals: 8,
        displayChainName: 'aelf MainChain',
        id: '217e0eb3-4df2-8752-046c-3a10e6a9bbe4',
        imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
        isDefault: true,
        isDisplay: true,
        label: undefined,
        symbol: 'ELF',
      },
      {
        address: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
        chainId: 'tDVV',
        chainImageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/dappChain.png',
        decimals: 8,
        displayChainName: 'aelf dAppChain',
        id: 'db8c582e-22b5-bd39-9f42-3a10e6a9bbe4',
        imageUrl: 'https://portkey-did.s3.ap-northeast-1.amazonaws.com/img/aelf/Coin-ELF.png',
        isDefault: true,
        isDisplay: true,
        label: undefined,
        symbol: 'ELF',
      },
    ],
  } as IUserTokenItemResponse;
  const {
    loading,
    errorMsg,
    receiveType,
    destinationChain,
    destinationChainList,
    updateDestinationChain,
    sourceChain,
    sourceChainList,
    setSourceChain,
  } = useReceive(tokenInfo, chainId);

  const showSourceList = useCallback(() => {
    console.log('showSourceList');
  }, []);
  const showDestinationList = useCallback(() => {
    console.log('showDestinationList');
  }, []);

  return (
    <div className="portkey-ui-receive-content">
      <TitleWrapper
        className="portkey-ui-receive-header"
        leftElement={backIcon ? backIcon : <CustomSvg type="LeftArrow" onClick={onBack} />}
        title={`Receive ${tokenInfo.label ?? tokenInfo.symbol}`}
        rightElement={closeIcon}
      />
      {sourceChain && destinationChain && (
        <>
          <SourceDestinationPicker
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            onSourceClick={showSourceList}
            onDestinationClick={showDestinationList}
          />
          {receiveType === ReceiveType.Portkey && <div>Portkey</div>}
          {receiveType === ReceiveType.ETransfer && <div>ETransfer</div>}
        </>
      )}
    </div>
  );
}
