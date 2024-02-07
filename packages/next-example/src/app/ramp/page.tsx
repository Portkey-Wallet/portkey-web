'use client';
import { PortkeyAssetProvider, Ramp } from '@portkey/did-ui-react';
import { useRouter } from 'next/navigation';

export default function RampPage() {
  const router = useRouter();

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <Ramp
          onBack={function (): void {
            router.push('/sign');
          }}
          onShowPreview={function (data): void {
            router.push(`/ramp-preview/${JSON.stringify(data)}`);
          }}
          tokenInfo={{
            decimals: 8,
            chainId: 'AELF',
            symbol: 'ELF',
            tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
          }}
          portkeyWebSocketUrl={'http://192.168.66.117:5577/ca'}
          isMainnet={true}
          isBuySectionShow={false}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
