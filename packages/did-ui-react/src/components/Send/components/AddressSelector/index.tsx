import { Tabs } from 'antd';
import Recents from './Recents';
import MyAddress from './MyAddress';
import { IClickAddressProps } from '../../../types/assets';
import { ChainId } from '@portkey-v1/types';
import { NetworkType } from '../../../../types';
import './index.less';

export default function AddressSelector({
  onClick,
  chainId,
  networkType,
}: {
  onClick: (account: IClickAddressProps) => void;
  chainId: ChainId;
  networkType: NetworkType;
}) {
  return (
    <Tabs
      className="portkey-ui-address-selector"
      items={[
        {
          label: 'Recents',
          key: 'recents',
          children: <Recents networkType={networkType} onChange={onClick} chainId={chainId} />,
        },
        {
          label: 'My address',
          key: 'myAddress',
          children: <MyAddress networkType={networkType} onClick={onClick} chainId={chainId} />,
        },
      ]}
    />
  );
}
