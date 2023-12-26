import { devices } from '@portkey-v1/utils';
import { useMemo } from 'react';
import { useMedia } from 'react-use';

export default function useMobile() {
  const isWide = useMedia('(max-width: 768px)');
  return useMemo(() => isWide || devices.isMobileDevices(), [isWide]);
}
