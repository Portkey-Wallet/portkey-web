import { ConfigProvider, IRampPreviewInitState, PortkeyAssetProvider, RampPreview } from '@portkey/did-ui-react';
import { useRouter } from 'next/router';
import { Store } from '../../utils';
import { useEffect, useState } from 'react';
import { ChainId } from '@portkey/types';

const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  // requestDefaults: {
  //   baseURL: isTest ? '/test' : undefined,
  // },
});

export default function RampPreviewPage() {
  const router = useRouter();

  const [initState, setInitState] = useState<IRampPreviewInitState>();
  const [chainId, setChainId] = useState<ChainId>();

  useEffect(() => {
    setInitState(JSON.parse(router?.query?.state as string).initState);
    setChainId(JSON.parse(router?.query?.state as string).chainId);
  }, []);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        {initState && (
          <RampPreview
            initState={initState}
            chainId={chainId}
            portkeyServiceUrl="https://did-portkey.portkey.finance"
            goBack={function (): void {
              router.back();
            }}
          />
        )}
      </PortkeyAssetProvider>
    </div>
  );
}