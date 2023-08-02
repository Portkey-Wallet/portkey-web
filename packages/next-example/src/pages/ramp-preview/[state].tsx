import {
  ConfigProvider,
  IRampPreviewInitState,
  PortkeyAssetProvider,
  RampPreview,
  RampTypeEnum,
} from '@portkey/did-ui-react';
import { useRouter } from 'next/router';
import { Store } from '../../utils';
import { useEffect, useState } from 'react';

const myStore = new Store();

ConfigProvider.setGlobalConfig({
  storageMethod: myStore,
  // requestDefaults: {
  //   baseURL: isTest ? '/test' : undefined,
  // },
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
  });

  useEffect(() => {
    setState(JSON.parse(router?.query?.state as string));
  }, []);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        <RampPreview
          state={state}
          apiUrl="https://did-portkey.portkey.finance"
          goBack={function (): void {
            router.back();
          }}></RampPreview>
      </PortkeyAssetProvider>
    </div>
  );
}
