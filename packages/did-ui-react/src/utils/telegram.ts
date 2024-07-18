import { CrossTabPushMessageType } from '@portkey/socket';
import { TGetTelegramAuthTokenParams } from '@portkey/services';
import {
  getCommunicationSocketUrl,
  getCustomNetworkType,
  getServiceUrl,
  getStorageInstance,
} from '../components/config-provider/utils';
import { NetworkType, UserGuardianStatus } from '../types';
import { Open_Login_Guardian_Approval_Bridge, Open_Login_Guardian_Bridge } from '../constants/telegram';
import OpenLogin from './openlogin';
import { IOpenloginHandlerResult, TOpenLoginQueryParams } from '../types/openlogin';
import { TelegramPlatform, did } from '.';

export function hasCurrentTelegramGuardian(guardianList?: UserGuardianStatus[]) {
  return guardianList?.some(
    (item) => item?.guardianType === 'Telegram' && item?.guardianIdentifier === TelegramPlatform.getTelegramUserId(),
  );
}

export async function generateAccessTokenByPortkeyServer(params: TGetTelegramAuthTokenParams) {
  return await did.services.getTelegramAuthToken(params);
}

export async function getDataFromOpenLogin({
  params,
  socketMethod,
  openLoginBridgeURLMap,
  isRemoveLocalStorage = false,
  removeLocalStorageKey = '',
  needConfirm = false,
  callback,
}: {
  params: TOpenLoginQueryParams;
  socketMethod: CrossTabPushMessageType[];
  openLoginBridgeURLMap: typeof Open_Login_Guardian_Approval_Bridge | typeof Open_Login_Guardian_Bridge;
  isRemoveLocalStorage?: boolean;
  removeLocalStorageKey?: string;
  needConfirm?: boolean;
  callback: (
    result: Pick<Required<IOpenloginHandlerResult>, 'data'> & Omit<IOpenloginHandlerResult, 'data'>,
  ) => Promise<void>;
}) {
  // savaDataToStorage - initData
  const serviceURI = getServiceUrl();
  const socketURI = getCommunicationSocketUrl();
  const ctw = getCustomNetworkType();
  const networkType: NetworkType = params?.networkType || 'MAINNET';

  const openlogin = new OpenLogin({
    customNetworkType: ctw,
    networkType,
    serviceURI: serviceURI,
    socketURI,
    currentStorage: getStorageInstance(),
  });

  const result = await openlogin.openloginHandler({
    url: openLoginBridgeURLMap[ctw][networkType],
    queryParams: params,
    socketMethod,
    needConfirm,
  });
  if (!result?.data) return null;
  if (isRemoveLocalStorage && removeLocalStorageKey) await did.config.storageMethod.removeItem(removeLocalStorageKey);
  await callback(result as Parameters<typeof callback>[0]);
}
