'use client';
import { IRampPreviewInitState, PortkeyAssetProvider, RampPreview } from '@portkey/did-ui-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChainId } from '@portkey/types';

export default function RampPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [initState, setInitState] = useState<IRampPreviewInitState>();
  const [chainId, setChainId] = useState<ChainId>();

  useEffect(() => {
    setInitState(JSON.parse(searchParams.get('state') || '').initState);
    setChainId(JSON.parse(searchParams.get('state') || '').chainId);
  }, [searchParams]);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        {initState && (
          <RampPreview
            isMainnet={true}
            initState={initState}
            chainId={chainId}
            portkeyServiceUrl="https://localtest-applesign.portkey.finance"
            onBack={function (): void {
              router.back();
            }}
          />
        )}
      </PortkeyAssetProvider>
    </div>
  );
}
