import {
  ConfigProvider,
  IRampPreviewInitState,
  PortkeyAssetProvider,
  RampPreview,
  RampTypeEnum,
} from '@portkey/did-ui-react';
import router, { useRouter } from 'next/router';
import { Store } from '../../utils';
import { useEffect, useState } from 'react';

const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  ramp: {
    isBuySectionShow: true,
    isSellSectionShow: true,
    isManagerSynced: false,
  },
  apiUrl: '',
});

export default function RampPage() {
  const router = useRouter();

  const [state, setState] = useState<IRampPreviewInitState>({
    crypto: '',
    network: '',
    fiat: '',
    country: '',
    amount: '',
    side: RampTypeEnum.BUY,
    tokenInfo: { balance: '300', decimals: 8 },
  });

  useEffect(() => {
    setState(JSON.parse(router?.query?.state as string));
  }, []);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <RampPreview
          state={state}
          goBack={function (): void {
            router.push('/ramp');
          }}></RampPreview>
      </PortkeyAssetProvider>
    </div>
  );
}
