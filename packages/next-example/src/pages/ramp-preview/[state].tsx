import {
  ConfigProvider,
  IRampPreviewInitState,
  ITokenInfo,
  PortkeyAssetProvider,
  RampPreview,
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

  const [state, setState] = useState<IRampPreviewInitState>();
  const [tokenInfo, setTokenInfo] = useState<ITokenInfo>();

  useEffect(() => {
    setState(JSON.parse(router?.query?.state as string));
    setTokenInfo(JSON.parse(router?.query?.state as string));
  }, []);

  return (
    <div>
      <PortkeyAssetProvider originChainId="AELF" pin="111111">
        {state && tokenInfo && (
          <RampPreview
            state={state}
            apiUrl="https://did-portkey.portkey.finance"
            goBack={function (): void {
              router.back();
            }}
            tokenInfo={tokenInfo}
          />
        )}
      </PortkeyAssetProvider>
    </div>
  );
}
