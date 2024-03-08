import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePortkey } from '../context';
import { MAINNET } from '../../constants/network';
import { addressFormat, divDecimalsStr, transNetworkText } from '../../utils/converter';
import Copy from '../Copy';
import SettingHeader from '../SettingHeader';
import './index.less';
import { ChainId, SeedTypeEnum } from '@portkey/types';
import { NFTItemBaseExpand } from '../types/assets';
import { did, formatStr2EllipsisStr } from '../../utils';
import ThrottleButton from '../ThrottleButton';
import clsx from 'clsx';
import NFTImage from '../NFTImage';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { sleep } from '@portkey/utils';
import moment from 'moment';

export interface NFTDetailProps {
  NFTDetail: NFTItemBaseExpand;
  onSend?: (nft: NFTItemBaseExpand) => void;
  onBack?: () => void;
}

export default function NFTDetailMain({ NFTDetail, onSend, onBack }: NFTDetailProps) {
  const [info, setInfo] = useState<NFTItemBaseExpand>({ ...NFTDetail });
  const [{ networkType, chainType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [{ caInfo, initialized }] = usePortkeyAsset();

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const updateDetail = useCallback(async () => {
    if (!caAddressInfos) return;

    const data = await did.services.assets.fetchAccountNftItem({
      symbol: '',
      caAddressInfos: caAddressInfos,
    });
    setInfo({ ...NFTDetail, ...data });
    // polling to get data
    if (!data.recommendedRefreshSeconds) return;
    sleep(data.recommendedRefreshSeconds * 1000);
    await updateDetail();
  }, [NFTDetail, caAddressInfos]);

  const initGetDetail = useCallback(async () => {
    const { recommendedRefreshSeconds } = NFTDetail;
    if (!recommendedRefreshSeconds) return;
    sleep(recommendedRefreshSeconds * 1000);
    await updateDetail();
  }, [NFTDetail, updateDetail]);

  useEffect(() => {
    if (initialized) {
      initGetDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  const renderCollectionInfo = useMemo(() => {
    const { collectionName, collectionImageUrl } = info;

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
  }, [info]);

  const renderPicture = useMemo(() => {
    const { imageUrl, symbol, isSeed, seedType } = info;

    return <NFTImage className="picture" name={symbol} imageUrl={imageUrl} isSeed={isSeed} seedType={seedType} />;
  }, [info]);

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
    const { tokenContractAddress, chainId, symbol, totalSupply, decimals } = info;

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
  }, [info, chainType, isMainnet, renderInfoRow]);

  const renderOriginSeedInfo = useMemo(() => {
    const { expires, isSeed, seedType, seedOwnedSymbol } = info;
    const formatExpires = expires ? `${moment.unix(Number(expires)).utc().format('MMM DD YYYY HH:mm:ss')} UTC` : '-';

    return (
      isSeed && (
        <div className="info">
          <div className="title">Token Creation via This Seed</div>
          {renderInfoRow({
            label: 'Type',
            value: seedType === SeedTypeEnum.FT ? 'Token' : 'NFT',
            className: 'origin-seed-type',
          })}
          {renderInfoRow({ label: 'Token Symbol', value: seedOwnedSymbol, className: 'origin-seed-token-symbol' })}
          {renderInfoRow({ label: 'Expires', value: formatExpires, className: 'origin-seed-expires' })}
        </div>
      )
    );
  }, [info, renderInfoRow]);

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
    const { inscriptionName, limitPerMint } = info;
    return (
      <div className="info">
        <div className="title">Inscription info</div>
        {renderInfoRow({ label: 'Inscription Name', value: inscriptionName, className: 'inscription-name' })}
        {renderInfoRow({ label: 'Limit Per Mint', value: String(limitPerMint), className: 'inscription-limit' })}
      </div>
    );
  }, [info, renderInfoRow]);

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
    const { balance, decimals } = info;
    return (
      <div>
        <div className="btn-wrap portkey-ui-flex-column-center">
          <div className="balance">{`You have: ${divDecimalsStr(balance, decimals)}`}</div>
          <ThrottleButton type="primary" onClick={() => onSend?.(info)}>
            Send
          </ThrottleButton>
        </div>
      </div>
    );
  }, [info, onSend]);

  const { alias, tokenId } = info;

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
