import { forgeWeb, sleep } from '@portkey/utils';
import { TOpenLoginSessionInfo, TPushMessageByApi } from './types';
import { did } from '../did';
import { singleMessage } from '../../components';
import { handleErrorMessage } from '../errorHandler';
import { CrossTabPushMessageType } from '@portkey/socket';

export const pushMessageByApi = async ({ methodName, params, times = 0 }: TPushMessageByApi): Promise<any> => {
  const { loginId, data } = params;

  try {
    return await did.services.common.saveData({
      clientId: loginId,
      methodName: methodName,
      data: data,
    });
  } catch (error: any) {
    console.log(error?.message);
    const currentTimes = ++times;
    await sleep(500);
    if (currentTimes > 5) {
      const err = error?.message || 'Network error';
      singleMessage.error(handleErrorMessage(err));
      throw err;
    }

    return pushMessageByApi({ methodName, params, times: currentTimes });
  }
};

export const pushEncodeMessage = async (storage: string, methodName: CrossTabPushMessageType, params: string) => {
  const sessionInfo = (JSON.parse(storage) || {}) as TOpenLoginSessionInfo;
  const { publicKey, loginId } = sessionInfo;
  console.log(publicKey, loginId, params);
  let encrypted;
  try {
    const cryptoManager = new forgeWeb.ForgeCryptoManager();
    encrypted = await cryptoManager.encryptLong(publicKey, params);
  } catch (error) {
    throw 'Failed to encrypt user token';
  }

  await pushMessageByApi({
    methodName,
    params: {
      loginId: sessionInfo.loginId,
      data: encrypted,
    },
  });
};
