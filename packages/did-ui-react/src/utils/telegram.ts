import { CrossTabPushMessageType } from '@portkey/socket';
import { forgeWeb, randomId } from '@portkey/utils';
import { stringifyUrl } from 'query-string';
import { pushEncodeMessage } from './openlogin/crossTabMessagePush';
import { decodeMessageByRsaKey, did } from '.';

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
      const startParam = Telegram?.WebApp.initData;
      return { startParam };
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

export async function saveDataWithInTelegram({
  isSaveDataToStorage = true,
  isOpenTelegramLink = true,
  needPersist = false,
  loginId = '',
  storageKey = '',
  storageValue,
  pushMessage,
  telegramLink,
  onBeforeOpenLink,
}: {
  isSaveDataToStorage?: boolean;
  isOpenTelegramLink?: boolean;
  needPersist?: boolean;
  loginId?: string;
  storageKey?: string;
  storageValue?: Record<string, any>;
  pushMessage?: Record<string, any>;
  telegramLink?: string;
  onBeforeOpenLink?: () => Promise<void> | void;
}) {
  // Save Data
  // 1. Get publicKey and privateKey
  const cryptoManager = new forgeWeb.ForgeCryptoManager();
  const keyPair = await cryptoManager.generateKeyPair();
  loginId = loginId || randomId();
  const sessionAuth = JSON.stringify({
    loginId: loginId,
    publicKey: keyPair.publicKey,
    needPersist,
  });

  // 2. Save data to storage, default save privateKey
  if (isSaveDataToStorage) {
    let storageValueConcat = { rsaKey: keyPair.privateKey, loginId };
    if (storageValue && typeof storageValue === 'object') {
      storageValueConcat = Object.assign({}, storageValueConcat, storageValue);
    }
    await did.config.storageMethod.setItem(storageKey, JSON.stringify(storageValueConcat));
  }

  // 3. Save data to database, default save storageKey
  let params = { storageKey };
  if (pushMessage && typeof pushMessage === 'object') {
    params = Object.assign({}, params, pushMessage);
  }
  await pushEncodeMessage(sessionAuth, CrossTabPushMessageType.onAuthStatusChanged, JSON.stringify(params));

  await onBeforeOpenLink?.();

  // 4. Open telegram link
  if (isOpenTelegramLink && telegramLink) {
    const Telegram = getTelegram();
    Telegram?.WebApp.openTelegramLink(`${telegramLink}?startapp=${loginId}`);
  }
  return {
    loginId: loginId,
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  };
}

export async function decodeDataWithInTelegram(storageKey: string, encodeData: string) {
  const storage = await did.config.storageMethod.getItem(storageKey);
  const { rsaKey } = JSON.parse(storage);
  return decodeMessageByRsaKey(rsaKey, encodeData);
}
