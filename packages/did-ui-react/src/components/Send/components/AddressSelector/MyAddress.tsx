import { useMemo } from 'react';
import { IClickAddressProps } from '../../../types/assets';
import { ChainId } from '@portkey-v1/types';
import { NetworkType } from '../../../../types';
import { usePortkeyAsset } from '../../../context/PortkeyAssetProvider';
import { formatStr2EllipsisStr } from '../../../../utils';
import { transNetworkText } from '../../../../utils/converter';
import { MAINNET } from '../../../../constants/network';

export default function MyAddress({
  networkType,
  chainId,
  onClick,
}: {
  chainId: ChainId;
  networkType: NetworkType;
  onClick: (account: IClickAddressProps) => void;
}) {
  const [{ caAddressInfos }] = usePortkeyAsset();

  const userAddressInfo = useMemo(
    () => caAddressInfos?.filter((item) => item.chainId !== chainId) || [],
    [caAddressInfos, chainId],
  );

  return (
    <div className="portkey-ui-send-my-address">
      {userAddressInfo.length === 0 && <p className="no-data">There is no address</p>}
      {userAddressInfo?.map((item, idx) => {
        return (
          <div
            className="my-address-item"
            key={idx + item.caAddress}
            onClick={() => {
              onClick({ chainId: item.chainId, address: item.caAddress });
            }}>
            <p className="address">{`ELF_${formatStr2EllipsisStr(item.caAddress, [6, 6])}_${item.chainId}`}</p>
            <p className="network">{transNetworkText(item.chainId, networkType === MAINNET)}</p>
          </div>
        );
      })}
    </div>
  );
}
