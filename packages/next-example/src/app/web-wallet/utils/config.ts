import { NetworkType } from '@portkey/provider-types';
import { LOGIN_CONFIG } from '../constants/config';

export const getNetworkConfig = (network: NetworkType) => {
  return LOGIN_CONFIG[network];
};
