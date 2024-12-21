import { useMemo } from 'react';
import { IClickAddressProps } from '../../../types/assets';
import { ChainId } from '@portkey/types';
import { NetworkType } from '../../../../types';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { formatStr2EllipsisStr } from '../../../../utils';
import { transNetworkTextV2 } from '../../../../utils/converter';
import ImgWithCornerMark from '../../../ImgWithCornerMark';
import clsx from 'clsx';
import { useCurrentChainList } from '../../../../hooks';

export default function MyAddress({
  chainId,
  onClick,
}: {
  chainId: ChainId;
  networkType: NetworkType;
  onClick: (account: IClickAddressProps) => void;
}) {
  const { chainList } = useCurrentChainList();
  const [{ caAddressInfos }] = usePortkeyAsset();
  const userAddressInfo = useMemo(
    () => caAddressInfos?.filter((item) => item.chainId !== chainId) || [],
    [caAddressInfos, chainId],
  );

  const chainImageUrl = useMemo(
    () => chainList.find((item) => item.chainId !== chainId)?.chainImageUrl,
    [chainId, chainList],
  );

  return (
    <>
      {userAddressInfo?.map((item, idx) => {
        return (
          <div
            className={clsx(['portkey-ui-flex-between-center', 'recent-item'])}
            key={idx + item.caAddress}
            onClick={() => {
              onClick({ chainId: item.chainId, address: item.caAddress });
            }}>
            <div className="left-section">
              <ImgWithCornerMark mainImgTitle={item.caAddress} cornerImgSrc={chainImageUrl || ''} />
            </div>
            <div className="center-section">
              <div className="address">{formatStr2EllipsisStr(item.caAddress, [8, 8])}</div>
              <div className="chain-info">
                {transNetworkTextV2({
                  chainId: item.chainId,
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
