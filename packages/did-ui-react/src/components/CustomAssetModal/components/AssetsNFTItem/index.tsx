import { IAssetItemType } from '@portkey/services';
import React from 'react';
import { transNetworkText } from '../../../../utils/converter';

export default function AssetsNFTItem({
  isMainnet,
  token,
  onSelect,
}: {
  isMainnet: boolean;
  token: IAssetItemType;
  onSelect?: (select: IAssetItemType, type: 'NFT') => void;
}) {
  return (
    <div
      key={`${token.chainId}_${token.nftInfo?.alias}_${token.nftInfo?.tokenId}`}
      className="item protocol"
      onClick={onSelect?.bind(undefined, token, 'NFT')}>
      <div className="avatar">
        {token.nftInfo?.imageUrl ? <img src={token.nftInfo.imageUrl} /> : token.nftInfo?.alias?.slice(0, 1)}
      </div>
      <div className="info">
        <p className="alias">{`${token.nftInfo?.alias} #${token.nftInfo?.tokenId}`}</p>
        <p className="network">{transNetworkText(token.chainId, isMainnet)}</p>
      </div>
      <div className="amount">
        <div className="balance">{token.nftInfo?.balance}</div>
      </div>
    </div>
  );
}
