import AssetCard from '../AssetCard';
import { usePortkey } from '../context';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import { did } from '../../utils';
import { Button } from 'antd';

export default function AssetMain() {
  const [{ networkType }] = usePortkey();
  const [{ accountInfo, originChainId, caHash }] = usePortkeyAsset();
  // useEffect(() => {
  //   caHash && AuthServe.addRequestAuthCheck((did.services as any).__proto__, originChainId);
  // }, [caHash, originChainId]);

  return (
    <div>
      <AssetCard networkType={networkType} nickName={accountInfo?.nickName} />
      {caHash}
      <Button
        onClick={async () => {
          try {
            // AuthServe.setRefreshTokenConfig(originChainId);

            const result = await did.services.getCAHolderInfo('', caHash || '');

            console.log(result, 'getCAHolderInfo==');
          } catch (error) {
            console.log('getCAHolderInfo', error);
          }
        }}>
        Button
      </Button>

      <Button
        onClick={async () => {
          try {
            const _caHash = did.didWallet?.caInfo?.[originChainId]?.['caHash'];
            console.log(_caHash, 'caInfo===');

            console.log(_caHash, 'getCAHolderInfo==');
          } catch (error) {
            console.log('getCAHolderInfo', error);
          }
        }}>
        Button
      </Button>
    </div>
  );
}
2;
