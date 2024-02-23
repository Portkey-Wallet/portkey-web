import { useMemo } from 'react';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { addressFormat, formatAmountShow, transNetworkText } from '../../utils/converter';
import Copy from '../Copy';
import SettingHeader from '../SettingHeader';
import './index.less';
import { ChainId } from '@portkey/types';
import { NFTItemBaseExpand } from '../types/assets';
import { formatStr2EllipsisStr } from '../../utils';
import ThrottleButton from '../ThrottleButton';

export interface NFTDetailProps {
  NFTDetail: NFTItemBaseExpand;
  onSend?: (nft: NFTItemBaseExpand) => void;
  onBack?: () => void;
}

export default function NFTDetailMain({ NFTDetail, onSend, onBack }: NFTDetailProps) {
  const [{ networkType, chainType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  const renderDetail = useMemo(() => {
    const { tokenContractAddress, chainId, alias, totalSupply } = NFTDetail;

    const formatTokenContractAds = addressFormat(tokenContractAddress, chainId as ChainId, chainType);
    return (
      <div className="info">
        <div className="title">Basic info</div>
        <div className="contract info-item flex-between">
          <div className="label">Contract address</div>
          <div className="contract-title flex">
            {formatStr2EllipsisStr(formatTokenContractAds)}
            <Copy toCopy={formatTokenContractAds} />
          </div>
        </div>
        <div className="chain info-item flex-between">
          <div className="label">Blockchain</div>
          <div>{transNetworkText(chainId, isMainnet)}</div>
        </div>
        <div className="alias info-item flex-between">
          <div className="label">Token</div>
          <div className="alias-name">{alias}</div>
        </div>
        <div className="total-supply info-item flex-between">
          <div className="label">Total supply</div>
          <div>{formatAmountShow(totalSupply, 0)}</div>
        </div>
      </div>
    );
  }, [NFTDetail, chainType, isMainnet]);

  const { collectionName, collectionImageUrl, tokenId, imageUrl, symbol, balance } = NFTDetail;

  return (
    <div className="portkey-ui-nft-detail">
      <div className="nft-detail-body">
        <SettingHeader leftCallBack={onBack} />
        <div className="collection portkey-ui-flex-start-center">
          <div className="img">
            {collectionImageUrl ? (
              <img src={collectionImageUrl} />
            ) : (
              <div className="img-text portkey-ui-flex-center">{collectionName?.slice(0, 1)}</div>
            )}
          </div>
          <div className="name">{collectionName}</div>
        </div>
        <div className="token-id">#{tokenId}</div>
        <div className="picture portkey-ui-flex-center">
          {imageUrl ? (
            <img className="picture-common" src={imageUrl} />
          ) : (
            <div className="picture-text picture-common portkey-ui-flex-center">{symbol?.slice(0, 1)}</div>
          )}
        </div>
        {renderDetail}
      </div>
      <div>
        <div className="btn-wrap portkey-ui-flex-column-center">
          <div className="balance">{`You have: ${formatAmountShow(balance, 0)}`}</div>
          <ThrottleButton type="primary" onClick={() => onSend?.(NFTDetail)}>
            Send
          </ThrottleButton>
        </div>
      </div>
    </div>
  );
}
