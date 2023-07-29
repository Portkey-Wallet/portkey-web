import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import './index.less';

export default function AssetCard() {
  const [{ networkType }] = usePortkey();
  const [{ accountInfo }] = usePortkeyAsset();
  return (
    <div>
      {networkType}
      {/* <div>{accountInfo?.nickName || '- -'}</div> */}
    </div>
  );
}
