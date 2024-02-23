import { IRampPreviewInitState, PortkeyAssetProvider, RampPreview } from '@portkey/did-ui-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ChainId } from '@portkey/types';

export default function RampPreviewPage() {
  const router = useRouter();

  const [initState, setInitState] = useState<IRampPreviewInitState>();
  const [chainId, setChainId] = useState<ChainId>();

  useEffect(() => {
    setInitState(JSON.parse(router?.query?.state as string).initState);
    setChainId(JSON.parse(router?.query?.state as string).chainId);
  }, [router?.query?.state]);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        {initState && (
          <RampPreview
            initState={initState}
            chainId={chainId}
            portkeyServiceUrl="https://localtest-applesign.portkey.finance"
            overrideAchConfig={{
              appId: 'f83Is2y7L425rxl8',
              baseUrl: 'https://ramptest.alchemypay.org',
              updateAchOrder: '/api/app/thirdPart/order/alchemy',
            }}
            onBack={function (): void {
              router.back();
            }}
          />
        )}
      </PortkeyAssetProvider>
    </div>
  );
}
