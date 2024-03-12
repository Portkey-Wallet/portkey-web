import { IAssetItemType } from '@portkey/services';
import { divDecimalsStr, transNetworkText } from '../../../../utils/converter';
import NFTImage from '../../../NFTImage';

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
      <NFTImage
        className="avatar"
        name={token.nftInfo?.alias}
        imageUrl={token.nftInfo?.imageUrl}
        isSeed={token.nftInfo?.isSeed}
        seedType={token.nftInfo?.seedType}
      />
      <div className="info">
        <p className="alias">{`${token.nftInfo?.alias} #${token.nftInfo?.tokenId}`}</p>
        <p className="network">{transNetworkText(token.chainId, isMainnet)}</p>
      </div>
      <div className="amount">
        <div className="balance">{divDecimalsStr(token.nftInfo?.balance, token.nftInfo?.decimals)}</div>
      </div>
    </div>
  );
}
