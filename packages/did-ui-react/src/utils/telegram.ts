import { CrossTabPushMessageType, openloginSignal } from '@portkey/socket';
import { forgeWeb, randomId } from '@portkey/utils';
import { stringifyUrl } from 'query-string';
import { pushEncodeMessage, pushMessageByApi } from './openlogin/crossTabMessagePush';
import { decodeMessageByRsaKey, did, handleErrorMessage } from '.';
import qs from 'query-string';
import { TelegramWebappInitData } from '@portkey/types';
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

export function getTelegram() {
  if (window != undefined) {
    return (window as any)?.Telegram as Telegram;
  }
}

export function isTelegramPlatform() {
  if (window != undefined) {
    const Telegram = getTelegram();
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
  }
  return false;
}

export function getTelegramInitData() {
  if (isTelegramPlatform()) {
    const Telegram = getTelegram();
    const initData = Telegram?.WebApp.initData;
    if (initData && typeof initData === 'string') {
      return qs.parse(initData) as unknown as TelegramWebappInitData;
    }
  }
}

export function getTelegramUserId() {
  const telegramInitData = getTelegramInitData();
  const telegramUserInfo =
    telegramInitData?.user && typeof telegramInitData?.user === 'string' ? JSON.parse(telegramInitData.user) : {};
  return telegramUserInfo?.id ? String(telegramUserInfo.id) : undefined;
}

export function hasCurrentTelegramGuardian(guardianList?: UserGuardianStatus[]) {
  return guardianList?.some(
    (item) => item?.guardianType === 'Telegram' && item?.guardianIdentifier === getTelegramUserId(),
  );
}

export function getTelegramStartParam() {
  const initData = getTelegramInitData();
  return { startParam: initData?.start_param || '' };
}

export async function getTelegramStorageById(storageKey: string, idKey: string, id: string) {
  if (isTelegramPlatform()) {
    const value = await did.config.storageMethod.getItem(storageKey);
    if (value && typeof value === 'string') {
      const valueParse = JSON.parse(value);
      if (valueParse[idKey] === id) {
        return valueParse;
      }
    }
  }
  return {};
}

export function openLinkFromTelegram(url: string, params: Record<string, any>) {
  try {
    const handleOrderUrl = stringifyUrl(
      {
        url,
        query: params,
      },
      { encode: true },
    );
    const telegram = getTelegram();
    telegram?.WebApp.openLink(handleOrderUrl);
  } catch (error) {
    throw new Error('Open Link Failed');
  }
}

// usage: telegram auth in dapp-webapp
export async function saveEncodeInfoToStorageAndPortkeyDatabase(
  // storageKey: string,
  methodName: CrossTabPushMessageType,
  extraData?: Record<string, any>,
  extraStorageData?: Record<string, any>,
) {
  // 1. Generate publicKey and privateKey
  const cryptoManager = new forgeWeb.ForgeCryptoManager();
  const keyPair = await cryptoManager.generateKeyPair();
  const loginId = randomId();

  // 2. Save encode info to dapp localStorage
  const storageValue = {
    rsaKey: keyPair.privateKey,
    methodName,
    ...extraStorageData,
  };
  console.log('----- extraStorageData: ', extraStorageData);
  await did.config.storageMethod.setItem(loginId, JSON.stringify(storageValue));
  let concatData = { publicKey: keyPair.publicKey };
  if (extraData && typeof extraData === 'object') {
    concatData = Object.assign({}, concatData, extraData);
  }
  // 3. Save publicKey to database
  await pushMessageByApi({
    methodName,
    params: {
      loginId,
      data: JSON.stringify(concatData),
      needPersist: true,
    },
  });

  return { loginId };
}

export async function invokeDataFromPortkeyDatabase(loginId: string, methodName: CrossTabPushMessageType) {
  // 1. open socket to get data
  const serviceURI = getServiceUrl();
  await openloginSignal.doOpen({
    url: `${serviceURI}/communication`,
    clientId: loginId,
  });
  const res = await openloginSignal.GetTabDataAsync({
    requestId: loginId,
    methodName,
  });
  await openloginSignal.destroy();

  // 2. Return publicKey
  return res?.data;
}

// usage: jump to portkey-webapp
export async function generateAccessTokenByPortkeyServer(telegramUserInfo: TelegramWebappInitData) {
  return await did.services.getTelegramAuthToken(telegramUserInfo);
}

// usage: jump to portkey-webapp
export async function saveAccessTokenToPortkeyDatabase(
  loginId: string,
  publicKey: string,
  methodName: CrossTabPushMessageType,
  token: string,
) {
  const sessionAuth = JSON.stringify({
    loginId: loginId,
    publicKey: publicKey,
    needPersist: true,
  });
  await pushEncodeMessage(sessionAuth, methodName, token);
}

// usage: back to dapp-webapp
export async function getDataFromLocalStorage(loginId: string) {
  const storage = await did.config.storageMethod.getItem(loginId);
  console.log('storage: ', storage);
  if (storage && typeof storage === 'string') {
    return JSON.parse(storage);
  }
  return null;
}

// usage: back to dapp-webapp
export async function getAndDecodeAccessToken(loginId: string, methodName: CrossTabPushMessageType, rsaKey: string) {
  const encodeData = await invokeDataFromPortkeyDatabase(loginId, methodName);
  console.log('=== encodeData', encodeData);
  return decodeMessageByRsaKey(rsaKey, encodeData);
}

// usage: first step - attach telegram login in dapp-webapp
export async function saveDataAndOpenPortkeyWebapp(
  yourTelegramLink: string,
  targetTelegramLink: string,
  extraStorageData?: Record<string, any>,
) {
  try {
    const { loginId } = await saveEncodeInfoToStorageAndPortkeyDatabase(
      CrossTabPushMessageType.onSavePublicKey,
      {
        yourTelegramLink,
      },
      extraStorageData,
    );
    console.log('=== loginId', loginId);
    if (targetTelegramLink) {
      const Telegram = getTelegram();
      // TODO tg test
      // window.open(`${targetTelegramLink}?startapp=${loginId}`);
      Telegram?.WebApp.openTelegramLink(`${targetTelegramLink}?startapp=${loginId}`);
    }
    return;
  } catch (error) {
    throw Error(handleErrorMessage(error));
  }
}

// usage: second step - get accessToken in portkey-webapp
export async function getAccessTokenAndOpenDappWebapp({
  loginId,
  telegramUserInfo,
  onBeforeBack,
}: {
  loginId: string;
  telegramUserInfo: TelegramWebappInitData;
  onBeforeBack?: (loginId: string) => Promise<void> | void;
}) {
  try {
    const data = await invokeDataFromPortkeyDatabase(loginId, CrossTabPushMessageType.onSavePublicKey);
    console.log('===dapp data', data);
    let dataParse = data;
    if (data && typeof data === 'string') {
      dataParse = JSON.parse(data);
    }

    if (!dataParse?.publicKey) throw Error('No publicKey');

    // TODO tg test
    const accessToken = await generateAccessTokenByPortkeyServer(telegramUserInfo);
    // const accessToken = { token: '21345yutgmhnfgbdvfsadfsgdhfjgkhkjghfnbgdvfc' };
    console.log('=== accessToken', accessToken);
    await saveAccessTokenToPortkeyDatabase(
      loginId,
      dataParse.publicKey,
      CrossTabPushMessageType.onAuthStatusChanged,
      accessToken.token,
    );

    await onBeforeBack?.(loginId);

    if (dataParse?.yourTelegramLink) {
      const Telegram = getTelegram();
      Telegram?.WebApp.openTelegramLink(`${dataParse.yourTelegramLink}?startapp=${loginId}`);
    }
  } catch (error) {
    throw Error(handleErrorMessage(error));
  }
}

// usage: last step - get accessToken in dapp-webapp
export async function getAccessTokenInDappTelegram(loginId: string) {
  try {
    const { rsaKey, ...extraData } = await getDataFromLocalStorage(loginId);
    console.log('=== rsaKey', rsaKey);
    if (!rsaKey) return; // TODO tg
    const accessToken = await getAndDecodeAccessToken(loginId, CrossTabPushMessageType.onAuthStatusChanged, rsaKey);
    return {
      accessToken,
      ...extraData,
    };
  } catch (error) {
    throw Error(handleErrorMessage(error));
  }
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
    // sdkUrl: Open_Login_Bridge.local,
  });
  console.log('=== openlogin', openlogin);

  console.log('=== params', params);
  const result = await openlogin.openloginHandler({
    url: openLoginBridgeURLMap[ctw][networkType],
    queryParams: params,
    socketMethod,
    needConfirm,
  });
  console.log('====== result', result);
  if (!result?.data) return null;
  if (isRemoveLocalStorage && removeLocalStorageKey) await did.config.storageMethod.removeItem(removeLocalStorageKey);
  await callback(result as Parameters<typeof callback>[0]);
}
