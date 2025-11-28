import { ResponseMessagePreset } from '@portkey/provider-types';

export const RESPONSE_ERROR_MAP = {
  0: ResponseMessagePreset.SUCCESS,
  // 1xxxx The error code is the error received by the catch
  100001: '',
  200001: 'Payload is false.',
  200002: 'No Wallet Info.',
  200003: 'You closed the prompt without any action.',
  200004: 'The user is not connected to Portkey, please connect the user first',
  200005: 'Please check your chain connection is correct',
  // 3xxxxx Temporarily only used for internal redirects
  300000: '',
  // [40000, 41000) is a dynamic error
  // 400001 are dynamic errors
  // [41001, 42000) is fixed bug
  400001: '',
  410001: 'Forbidden',
  410002: ResponseMessagePreset.ERROR_IN_PARAMS,
  // 5xxxxxx is generally related to the interface request, and the plug-in actively throws it out
  // Currently only 500001, serviceWorker.ts reports an error
  500001: 'connect wallet error',

  // 500002 NotificationService.js failed
  // 6xxxxx is Failed to establish connection registration
  600001: 'Invalid connection',
  600002: 'Chrome Extension update, please refresh the page',
  // 7xxxxx transaction failed
  700001: ResponseMessagePreset.UNIMPLEMENTED,
  700002: 'The contract call failed, please check the contract address and contract name',
  // 8xxxxx is the error code of the event
  800001: '',
};

export interface PortkeyResultType {
  error: keyof typeof RESPONSE_ERROR_MAP;
  name?: string;
  message?: string;
  Error?: any;
  stack?: any;
  data?: any;
}
