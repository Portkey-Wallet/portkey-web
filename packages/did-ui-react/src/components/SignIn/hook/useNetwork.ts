import { useMemo } from 'react';
import { NetworkItem } from '../../../types';
import ConfigProvider from '../../config-provider';

export const useDefaultCurrentNetwork = ({
  networkList,
  defaultNetwork,
}: {
  defaultNetwork: string;
  networkList: NetworkItem[];
}) => {
  const _networkList = useMemo(() => networkList || ConfigProvider.config?.network?.networkList, [networkList]);

  const _defaultNetwork = useMemo(
    () => defaultNetwork || ConfigProvider.config?.network?.defaultNetwork || _networkList?.[0]?.networkType,
    [_networkList, defaultNetwork],
  );
  return useMemo(
    () => _networkList?.find((network) => network.networkType === _defaultNetwork),
    [_defaultNetwork, _networkList],
  );
};
