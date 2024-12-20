import { devices } from '@portkey/utils';
import { useMemo } from 'react';
import { useMedia } from 'react-use';

export default function useMobile() {
  const isWide = useMedia('(max-width: 600px)');
  return useMemo(() => isWide || devices.isMobileDevices(), [isWide]);
}
