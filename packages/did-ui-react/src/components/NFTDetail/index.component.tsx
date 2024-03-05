import { useCallback, useMemo } from 'react';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { addressFormat, divDecimalsStr, transNetworkText } from '../../utils/converter';
import Copy from '../Copy';
import SettingHeader from '../SettingHeader';
import './index.less';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import { NFTItemBaseExpand } from '../types/assets';
import { formatStr2EllipsisStr } from '../../utils';
import ThrottleButton from '../ThrottleButton';
import SeedBadge from '../AssetTabs/components/SeedBadge';
import clsx from 'clsx';

export interface NFTDetailProps {
  NFTDetail: NFTItemBaseExpand;
  onSend?: (nft: NFTItemBaseExpand) => void;
  onBack?: () => void;
}

export default function NFTDetailMain({ NFTDetail, onSend, onBack }: NFTDetailProps) {
  const [{ networkType, chainType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);

  const renderCollectionInfo = useMemo(() => {
    const { collectionName, collectionImageUrl } = NFTDetail;

    return (
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
    );
  }, [NFTDetail]);

  const renderPicture = useMemo(() => {
    const { imageUrl, symbol, isSeed, seedType } = NFTDetail;

    return (
      <div className="picture portkey-ui-flex-center">
        {imageUrl ? (
          <img className="picture-common" src={imageUrl} />
        ) : (
          <div className="picture-text picture-common portkey-ui-flex-center">{symbol?.slice(0, 1)}</div>
        )}
        <SeedBadge className="seed-type-badge" isSeed={isSeed} seedType={seedType} />
      </div>
    );
  }, [NFTDetail]);

  const renderInfoRow = useCallback(
    ({
      label,
      value,
      className,
      valueClassName,
    }: {
      label: string;
      value?: string;
      className?: string;
      valueClassName?: string;
    }) => {
      return (
        value && (
          <div className={clsx('portkey-ui-flex-between', 'info-item', className)}>
            <div className="label">{label}</div>
            <div className={clsx(valueClassName)}>{value}</div>
          </div>
        )
      );
    },
    [],
  );

  const renderBasicInfo = useMemo(() => {
    const { tokenContractAddress, chainId, symbol, totalSupply, decimals } = NFTDetail;

    const formatTokenContractAds = addressFormat(tokenContractAddress, chainId as ChainId, chainType);
    return (
      <div className="info">
        <div className="title">Basic info</div>
        <div className="contract info-item portkey-ui-flex-between">
          <div className="label">Contract address</div>
          <div className="contract-title portkey-ui-flex">
            {formatStr2EllipsisStr(formatTokenContractAds, [6, 7])}
            <Copy toCopy={formatTokenContractAds} />
          </div>
        </div>
        {renderInfoRow({ label: 'Blockchain', value: transNetworkText(chainId, isMainnet), className: 'chain' })}
        {renderInfoRow({
          label: 'Token symbol',
          value: symbol,
          className: 'symbol',
          valueClassName: 'symbol-value',
        })}
        {renderInfoRow({
          label: 'Total supply',
          value: divDecimalsStr(totalSupply, decimals),
          className: 'total-supply',
        })}
      </div>
    );
  }, [NFTDetail, chainType, isMainnet, renderInfoRow]);

  const renderOriginSeedInfo = useMemo(() => {
    const { expires, isSeed, seedType, symbol } = NFTDetail;
    return (
      isSeed && (
        <div className="info">
          <div className="title">Token Creation via This Seed</div>
          {renderInfoRow({
            label: 'Type',
            value: seedType === SeedTypeEnum.FT ? 'Token' : 'NFT',
            className: 'origin-seed-type',
          })}
          {renderInfoRow({ label: 'Token Symbol', value: symbol, className: 'origin-seed-token-symbol' })}
          {renderInfoRow({ label: 'Expires', value: expires, className: 'origin-seed-expires' })}
        </div>
      )
    );
  }, [NFTDetail, renderInfoRow]);

  const renderTraitsInfo = useMemo(() => {
    return (
      <div className="info">
        <div className="title">Traits</div>
        <div className="origin-seed-token-symbol info-item portkey-ui-flex-between-center">
          <div className="label portkey-ui-flex-column">
            <span>Background</span>
            <span className="below-label-value">{'Background-value'}</span>
          </div>
          <div>{'Background'}</div>
        </div>
        <div className="origin-seed-expires info-item portkey-ui-flex-between-center">
          <div className="label portkey-ui-flex-column">
            <span>Eyes</span>
            <span className="below-label-value">{'Eyes-value'}</span>
          </div>
          <div>{'Eyes'}</div>
        </div>
      </div>
    );
  }, []);

  const renderGenerationInfo = useMemo(() => {
    return (
      <div className="info">
        <div className="title">Generation info</div>
        {renderInfoRow({ label: 'Generation', value: 'Generation', className: 'generation-token-symbol' })}
      </div>
    );
  }, [renderInfoRow]);

  const renderInscriptionInfo = useMemo(() => {
    return (
      <div className="info">
        <div className="title">Inscription info</div>
        {renderInfoRow({ label: 'Inscription Name', value: 'Inscription Name', className: 'inscription-name' })}
        {renderInfoRow({ label: 'Limit Per Mint', value: 'Limit Per Mint', className: 'inscription-limit' })}
      </div>
    );
  }, [renderInfoRow]);

  const renderDetail = useMemo(() => {
    return (
      <>
        {renderBasicInfo}
        {renderOriginSeedInfo}
        {renderTraitsInfo}
        {renderGenerationInfo}
        {renderInscriptionInfo}
      </>
    );
  }, [renderBasicInfo, renderGenerationInfo, renderInscriptionInfo, renderOriginSeedInfo, renderTraitsInfo]);

  const renderFooter = useMemo(() => {
    const { balance, decimals } = NFTDetail;
    return (
      <div>
        <div className="btn-wrap portkey-ui-flex-column-center">
          <div className="balance">{`You have: ${divDecimalsStr(balance, decimals)}`}</div>
          <ThrottleButton type="primary" onClick={() => onSend?.(NFTDetail)}>
            Send
          </ThrottleButton>
        </div>
      </div>
    );
  }, [NFTDetail, onSend]);

  const { alias, tokenId } = NFTDetail;

  return (
    <div className="portkey-ui-nft-detail">
      <div className="nft-detail-body">
        <SettingHeader leftCallBack={onBack} />
        {renderCollectionInfo}
        <div className="token-id">{`${alias} #${tokenId}`}</div>
        {renderPicture}
        {renderDetail}
      </div>
      {renderFooter}
    </div>
  );
}
