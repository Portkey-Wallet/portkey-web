import { ModalProps } from 'antd';
import AssetModal from '../AssetModal';
import { NetworkType } from '../../types';
import { useMemo, useState } from 'react';
import TitleWrapper from '../TitleWrapper';
import CustomSvg from '../CustomSvg';
import AssetDropdown from '../AssetDropdown';
import { basicAssetViewAsync } from '../context/PortkeyAssetProvider/actions';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { CaAddressInfosType, IAssetItemType } from '@portkey-v1/services';
import { MAINNET } from '../../constants/network';
import AssetsTokenItem from './components/AssetsTokenItem';
import AssetsNFTItem from './components/AssetsNFTItem';
import '../CustomTokenList/index.less';
import { TokenType } from '../types/assets';
import { useThrottleFirstCallback } from '../../hooks/throttle';
import CheckFetchLoading from '../CheckFetchLoading';

type ICustomTokenModalProps = ModalProps & {
  networkType: NetworkType;
  onSelect: (v: IAssetItemType, type: TokenType) => void;
  onCancel: () => void;
  caAddressInfos?: CaAddressInfosType;
};

export default function CustomAssetModal({
  networkType,
  caAddressInfos,
  onSelect,
  onCancel,
  ...props
}: ICustomTokenModalProps) {
  const [{ allAsset }, { dispatch }] = usePortkeyAsset();
  const [filterWord, setFilterWord] = useState<string>('');

  const isMainnet = useMemo(() => networkType === MAINNET, [networkType]);
  const onSearchValChange = useThrottleFirstCallback(
    (v: string) => {
      setFilterWord(v);
      if (!caAddressInfos) return;
      basicAssetViewAsync
        .setAllAssetInfo({
          keyword: v,
          caAddressInfos,
        })
        .then(dispatch);
    },
    [caAddressInfos, dispatch],
  );

  return (
    <AssetModal {...props} onClose={onCancel}>
      <div className="portkey-ui-flex-column portkey-ui-custom-token-list">
        <TitleWrapper
          className="custom-token-header"
          leftElement={false}
          title={'Search Assets'}
          rightElement={<CustomSvg type="Close2" onClick={onCancel} />}
        />
        <AssetDropdown placeholder="Search Assets" onInputChange={onSearchValChange} />
        <div className="list">
          {!allAsset?.list || allAsset?.list.length === 0 ? (
            <CheckFetchLoading
              list={allAsset?.list}
              emptyElement={
                <div className="empty-content">
                  <p className="empty-text">
                    {filterWord.length === 0 ? 'There are currently no assets to send' : 'There is no search result'}
                  </p>
                </div>
              }
            />
          ) : (
            allAsset.list.map((token: IAssetItemType) => {
              return token.nftInfo?.tokenId ? (
                <AssetsNFTItem isMainnet={isMainnet} token={token} onSelect={onSelect} />
              ) : (
                <AssetsTokenItem isMainnet={isMainnet} token={token} onSelect={onSelect} />
              );
            })
          )}
        </div>
      </div>
    </AssetModal>
  );
}
