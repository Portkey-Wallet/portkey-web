import { useMemo, useState } from 'react';
import { CommonModal, CustomSvg, usePortkeyAsset } from '..';
import { useThrottleFirstCallback } from '../../hooks/throttle';
import { NetworkType } from '../../types';
import { CaAddressInfosType, IAssetToken } from '@portkey/services';
import { TokenType } from '../types/assets';
import { INftInfoType } from '@portkey/types';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { MAINNET } from '../../constants/network';
import CommonTabs from '../CommonTabs';
import SendTokenList from './TokenList';
import SendNFTList from './NFTList';
import CommonInput from '../CommonInput';
import TitleWrapper from '../TitleWrapper';
import { useEffectOnce } from 'react-use';
import './index.less';

export interface ISendAssetListProps {
  networkType: NetworkType;
  caAddressInfos?: CaAddressInfosType;
  onSelect: (v: IAssetToken | INftInfoType, type: TokenType) => void;
}

export enum SendAssetTabEnum {
  TOKEN = 'TOKED',
  NFT = 'NFT',
}

export default function SendAssetList({ networkType, caAddressInfos, onSelect }: ISendAssetListProps) {
  const [{ allAssetV2 }, { dispatch }] = usePortkeyAsset();
  const [filterWord, setFilterWord] = useState<string>('');
  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const [curTab, setCurTab] = useState<SendAssetTabEnum>(SendAssetTabEnum.TOKEN);

  const onSearchValChange = useThrottleFirstCallback(
    (v: string) => {
      setFilterWord(v);
      if (!caAddressInfos) return;
      basicAssetViewAsync
        .setAllAssetInfoV2({
          keyword: v,
          caAddressInfos,
        })
        .then(dispatch);
    },
    [caAddressInfos, dispatch],
  );

  useEffectOnce(() => {
    onSearchValChange();
  });

  const noDataMessage = useMemo(() => {
    return filterWord ? 'No results found' : 'There are currently no assets to send.';
  }, [filterWord]);

  return (
    <div className="portkey-ui-send-asset-list">
      <CommonInput
        type="search"
        placeholder="Search"
        value={filterWord}
        onChange={onSearchValChange}
        className="portkey-ui-send-search"
      />
      <CommonTabs
        className="portkey-ui-send-asset"
        activeKey={curTab}
        onChange={(v) => {
          setCurTab(v);
        }}
        items={[
          {
            label: 'Tokens',
            key: SendAssetTabEnum.TOKEN,
            children: (
              <SendTokenList
                onSelect={(v) => onSelect(v, 'TOKEN')}
                tokenInfos={allAssetV2?.tokenInfos || []}
                loading={false}
                noDataMessage={noDataMessage}
                isMainnet={isMainnet}
              />
            ),
          },
          {
            label: 'NFTs',
            key: SendAssetTabEnum.NFT,
            children: (
              <SendNFTList
                onSelect={(v) => onSelect(v, 'NFT')}
                nftInfos={allAssetV2?.nftInfos || []}
                loading={false}
                noDataMessage={noDataMessage}
                isMainnet={isMainnet}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export function SendAssetListPage({ onCancel, ...props }: ISendAssetListProps & { onCancel: () => void }) {
  return (
    <div className="portkey-ui-send-asset-list-page">
      <div className="send-select-asset-header portkey-ui-flex-between-center">
        <CustomSvg type="ArrowLeft" className="portkey-ui-cursor-pointer" onClick={onCancel} />
        <div>{`Select asset to send`}</div>
        <div></div>
      </div>
      <SendAssetList {...props} />
    </div>
  );
}

export function SendAssetListModal({
  open,
  onCancel,
  ...props
}: ISendAssetListProps & { open: boolean; onCancel: () => void }) {
  return (
    <CommonModal open={open} type="modal" className="send-select-asset-modal">
      <TitleWrapper
        className="send-select-asset-header"
        leftElement={<div className="header-title">{`Select asset to send`}</div>}
        rightElement={<CustomSvg type="Close" onClick={onCancel} />}
      />
      <SendAssetList {...props} />
    </CommonModal>
  );
}
