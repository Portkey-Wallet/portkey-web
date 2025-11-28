import { useMemo } from 'react';
import { usePortkey } from '../components/context';

export const useIsMainnet = () => {
  const [{ networkType }] = usePortkey();

  return useMemo(() => networkType === 'MAINNET', [networkType]);
};
