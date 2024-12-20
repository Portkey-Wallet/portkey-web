import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import moment from 'moment';
import { NFT_SMALL_SIZE } from '../../constants/assets';
import TraitsItem from './TraitsItem';
import CustomSvg from '../CustomSvg';
import ExpandableText from '../ExpandableText';
import { Divider } from 'antd';

export interface NFTDetailProps {
  NFTDetail: NFTItemBaseExpand;
  onSend?: (nft: NFTItemBaseExpand) => void;
  onBack?: () => void;
  onCollectionDetail?: () => void;
}

export default function NFTDetailMain({ NFTDetail, onSend, onBack, onCollectionDetail }: NFTDetailProps) {
  const scrollerContainerRef = useRef<any>(null);
  const [info, setInfo] = useState<NFTItemBaseExpand>({ ...NFTDetail });
  const [{ networkType, chainType }] = usePortkey();
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [{ caInfo, initialized }] = usePortkeyAsset();
  const updateTimerRef = useRef<NodeJS.Timer | number>();
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  const caAddressInfos = useMemo(() => {
    if (!caInfo) return;
    return Object.entries(caInfo ?? {}).map(([chainId, info]) => ({
      chainId: chainId as ChainId,
      caAddress: info.caAddress,
    }));
  }, [caInfo]);

  const updateDetail = useCallback(async () => {
    const { symbol } = NFTDetail;
    if (!caAddressInfos || !symbol) return;

    const data = await did.services.assets.fetchAccountNftItem({
      symbol,
      caAddressInfos: caAddressInfos,
      width: NFT_SMALL_SIZE,
      height: -1,
    });

    setInfo({ ...NFTDetail, ...data });
  }, [NFTDetail, caAddressInfos]);

  useEffect(() => {
    // polling to get data
    if (initialized) {
      if (!info?.recommendedRefreshSeconds || !info?.inscriptionName) return;
      updateTimerRef.current = setInterval(() => {
        updateDetail();
      }, info.recommendedRefreshSeconds * 1000);
    }

    return () => {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NFTDetail, info?.recommendedRefreshSeconds, initialized]);

  const renderCollectionInfo = useMemo(() => {
    const { collectionName, collectionImageUrl, description } = info;

    return (
      <div className="collection-container">
        <div
          className="collection portkey-ui-flex-start-center"
          onClick={() => {
            onCollectionDetail?.();
          }}>
          <div className="img">
            {collectionImageUrl ? (
              <img src={collectionImageUrl} />
            ) : (
              <div className="img-text portkey-ui-flex-center">{collectionName?.slice(0, 1)}</div>
            )}
          </div>
          <div className="name">{collectionName}</div>
          <CustomSvg type="Vector" />
        </div>
        {description && <ExpandableText description={description} textClassName={'description'} />}
      </div>
    );
  }, [info]);

  const renderNFTTopPart = useMemo(() => {
    const { imageUrl, symbol, isSeed, seedType, balance, decimals } = info;

    return (
      <>
        <NFTImage className="picture" name={symbol} imageUrl={imageUrl} isSeed={isSeed} seedType={seedType} />
        <div className="balance">{`You own: ${divDecimalsStr(balance, decimals)}`}</div>
        <ThrottleButton type="primaryOutline" block onClick={() => onSend?.(info)} className="send-button">
          Send
        </ThrottleButton>
      </>
    );
  }, [info, onSend]);

  const renderInfoRow = useCallback(
    ({
      label,
      value,
      className,
      valueClassName,
      valuePrevNode,
    }: {
      label: string;
      value?: string;
      className?: string;
      valueClassName?: string;
      valuePrevNode?: ReactNode;
    }) => {
      return (
        value && (
          <div className={clsx('portkey-ui-flex-between', 'info-item', className)}>
            <div className="label">{label}</div>
            <div className="portkey-ui-flex-row-center">
              {valuePrevNode}
              <div className={clsx(valueClassName, 'value')}>{value}</div>
            </div>
          </div>
        )
      );
    },
    [],
  );

  const renderBasicInfo = useMemo(() => {
    const { tokenContractAddress, chainId, symbol, totalSupply, decimals, chainImageUrl } = info;

    const formatTokenContractAds = addressFormat(tokenContractAddress, chainId as ChainId, chainType);
    return (
      <>
        <div className="info">
          <div className="title">Basic Info</div>
          <div className="info-content">
            <div className="contract info-item portkey-ui-flex-between">
              <div className="label">Contract Address</div>
              <div className="contract-title portkey-ui-flex">
                {formatStr2EllipsisStr(formatTokenContractAds, [8, 9])}
                <Copy toCopy={formatTokenContractAds} iconType="CopyNew" />
              </div>
            </div>
            {renderInfoRow({
              label: 'Blockchain',
              value: transNetworkText(chainId, isMainnet),
              className: 'chain',
              valuePrevNode: <img className="chain-image" src={chainImageUrl} />,
            })}
            {renderInfoRow({
              label: 'Symbol',
              value: symbol,
              className: 'symbol',
              valueClassName: 'symbol-value',
            })}
            {renderInfoRow({
              label: 'Total Supply',
              value: divDecimalsStr(totalSupply, decimals),
              className: 'total-supply',
            })}
          </div>
        </div>
        <Divider className="divider" />
      </>
    );
  }, [info, chainType, isMainnet, renderInfoRow]);

  const renderOriginSeedInfo = useMemo(() => {
    const { expires, isSeed, seedType, seedOwnedSymbol } = info;
    const formatExpires = expires ? `${moment.unix(Number(expires)).utc().format('MMM DD YYYY HH:mm:ss')} UTC` : '-';

    return (
      isSeed && (
        <>
          <div className="info">
            <div className="title">Token Creation via This Seed</div>
            <div className="info-content">
              {seedType &&
                renderInfoRow({
                  label: 'Type',
                  value: seedType === SeedTypeEnum.FT ? 'Token' : 'NFT',
                  className: 'origin-seed-type',
                })}
              {seedOwnedSymbol &&
                renderInfoRow({
                  label: 'Token Symbol',
                  value: seedOwnedSymbol,
                  className: 'symbol',
                  valueClassName: 'symbol-value',
                })}
              {formatExpires &&
                renderInfoRow({ label: 'Expires', value: formatExpires, className: 'origin-seed-expires' })}
            </div>
          </div>
          <Divider className="divider" />
        </>
      )
    );
  }, [info, renderInfoRow]);

  const renderTraitsInfo = useMemo(() => {
    const { traitsPercentages } = info;

    return (
      <>
        {Array.isArray(traitsPercentages) && traitsPercentages?.length > 0 && (
          <>
            <div className="info">
              <div className="title">Traits</div>
              <div className="info-content gride-content">
                {traitsPercentages?.map((item, index) => {
                  return (
                    <TraitsItem
                      key={item.traitType + index}
                      traitType={item.traitType}
                      value={item.value}
                      percent={item.percent}
                    />
                  );
                })}
              </div>
            </div>
            <Divider className="divider" />
          </>
        )}
      </>
    );
  }, [info]);

  const renderGenerationInfo = useMemo(() => {
    return (
      <>
        {info?.generation && (
          <>
            <div className="info">
              <div className="title">Generation Info</div>
              <div className="info-content">
                {renderInfoRow({ label: 'Generation', value: info.generation, className: 'generation' })}
              </div>
            </div>
            <Divider className="divider" />
          </>
        )}
      </>
    );
  }, [info.generation, renderInfoRow]);

  const renderInscriptionInfo = useMemo(() => {
    return (
      <>
        {info?.inscriptionName && (
          <div className="info">
            <div className="title">Inscription Info</div>
            <div className="info-content">
              {renderInfoRow({
                label: 'Inscription Name',
                value: info.inscriptionName,
                className: 'inscription-name',
                valueClassName: 'inscription-name-value',
              })}
              {info.limitPerMint != null &&
                renderInfoRow({
                  label: 'Limit Per Mint',
                  value: String(info.limitPerMint),
                  className: 'inscription-limit',
                })}
            </div>
          </div>
        )}
      </>
    );
  }, [info?.inscriptionName, info?.limitPerMint, renderInfoRow]);

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

  const { alias, tokenId } = info;
  const [opacity, setOpacity] = useState(0);

  const handleScroll = useCallback((event: { target: any }) => {
    lastKnownScrollPosition.current = event.target.scrollTop;
    if (!ticking.current) {
      window.requestAnimationFrame(() => {
        if (lastKnownScrollPosition.current >= 560) {
          setOpacity(1);
        } else {
          setOpacity(0);
        }
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, []);

  useEffect(() => {
    const scrollerContainer = scrollerContainerRef.current;

    scrollerContainerRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      scrollerContainer?.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="portkey-ui-nft-detail" ref={scrollerContainerRef}>
      <div className="nft-detail-body">
        <SettingHeader
          leftCallBack={onBack}
          leftElement={undefined}
          title={`${alias} #${tokenId}`}
          titleStyle={{ opacity, textAlign: 'center' }}
        />
        {renderNFTTopPart}
        <div className="token-id">{`${alias} #${tokenId}`}</div>
        {renderCollectionInfo}
        {/* {renderPicture} */}
        {renderDetail}
      </div>
    </div>
  );
}
