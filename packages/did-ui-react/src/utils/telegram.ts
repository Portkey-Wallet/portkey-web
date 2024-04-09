import { CrossTabPushMessageType, openloginSignal } from '@portkey/socket';
import { forgeWeb, randomId, sleep } from '@portkey/utils';
import { stringifyUrl } from 'query-string';
import { pushEncodeMessage, pushMessageByApi } from './openlogin/crossTabMessagePush';
import { decodeMessageByRsaKey, did, handleErrorMessage } from '.';
import qs from 'query-string';
import { TelegramWebappInitData } from '@portkey/types';
import { getServiceUrl } from '../components/config-provider/utils';

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

export function getTelegramStartParam() {
  if (isTelegramPlatform()) {
    const Telegram = getTelegram();
    if (Telegram) {
      const initData = Telegram?.WebApp.initData;
      console.log('=== initData', initData);
      if (initData && typeof initData === 'string' && initData.length > 0) {
        console.log('===  qs.parse(initData)', qs.parse(initData));
        return { startParam: (qs.parse(initData)?.start_param as string) || '' };
      }
    }
  }
  return { startParam: null };
}

export async function getTelegramStorageById(storageKey: string, idKey: string, id: string) {
  if (isTelegramPlatform()) {
    const value = await did.config.storageMethod.getItem(storageKey);
    if (value && typeof value === 'string' && value.length > 0) {
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
  return res.data;
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
  if (storage && typeof storage === 'string' && storage.length > 0) {
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
export async function getAccessTokenAndOpenPortkeyWebapp({
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
    if (data && typeof data === 'string' && data.length > 0) {
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

export async function decodeDataWithInTelegram(storageKey: string, encodeData: string) {
  const storage = await did.config.storageMethod.getItem(storageKey);
  const { rsaKey } = JSON.parse(storage);
  return decodeMessageByRsaKey(rsaKey, encodeData);
}
