import { CrossTabPushMessageType } from '@portkey/socket';
import { forgeWeb, randomId } from '@portkey/utils';
import { stringifyUrl } from 'query-string';
import { pushEncodeMessage } from './openlogin/crossTabMessagePush';
import { did } from '.';

export function isTelegramPlatform() {
  if (window != undefined) {
    const Telegram: Telegram = (window as any)?.Telegram;
    return !!(Telegram && Telegram.WebApp.platform && Telegram.WebApp.platform !== 'unknown');
  }
  return false;
}

export function getTelegram() {
  if (window != undefined) {
    return (window as any)?.Telegram as Telegram;
  }
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
  storageKey = '',
  storageValue,
  pushMessage,
  telegramLink,
}: {
  isSaveDataToStorage?: boolean;
  isOpenTelegramLink?: boolean;
  storageKey?: string;
  storageValue?: Record<string, any>;
  pushMessage?: Record<string, any>;
  telegramLink?: string;
}) {
  // Save Data
  // 1. Get publicKey and privateKey
  const cryptoManager = new forgeWeb.ForgeCryptoManager();
  const keyPair = await cryptoManager.generateKeyPair();
  const loginId = randomId();
  const sessionAuth = JSON.stringify({
    loginId: loginId,
    publicKey: keyPair.publicKey,
  });

  // 2. Save data to storage, default save privateKey
  if (isSaveDataToStorage) {
    let storageValueConcat = { rsaKey: keyPair.privateKey };
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
