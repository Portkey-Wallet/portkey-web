import BN from 'bn.js';
export const sleep = (time: number) => {
  return new Promise<void>(resolve => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, time);
  });
};

/**
 * Based on time and random numbers, the same ID may be generated if the method is called multiple times within a short period of time. If a more reliable unique ID generation method is required, it is recommended to use a dedicated library or algorithm.
 * @returns string
 */
export const randomId = () => Date.now() + '_' + Math.floor(Math.random() * 999999);

export type TSignatureObject = {
  r: string;
  s: string;
  recoveryParam?: number | undefined;
};

export function zeroFill(str: string | BN) {
  return BN.isBN(str) ? str.toString(16, 64) : str.padStart(64, '0');
}
export const sigObjToStr = (sigObj: TSignatureObject) => {
  return [zeroFill(sigObj.r), zeroFill(sigObj.s), `0${sigObj?.recoveryParam?.toString() || 0}`].join('');
};

export const handleLoopFetch = async <T>({
  fetch,
  times = 0,
  interval = 1000,
  checkIsContinue,
  checkIsInvalid,
}: {
  fetch: () => Promise<T>;
  times?: number;
  interval?: number;
  checkIsContinue?: (param: T) => boolean;
  checkIsInvalid?: () => boolean;
}): Promise<T> => {
  try {
    const result = await fetch();
    console.log('=== handleLoopFetch result', result);
    if (checkIsContinue) {
      const isContinue = checkIsContinue(result);
      if (!isContinue) return result;
    } else {
      return result;
    }
  } catch (error) {
    const isInvalid = checkIsInvalid ? checkIsInvalid() : true;
    if (!isInvalid) throw new Error('fetch invalid');
    console.log('handleLoopFetch: error', times, error);
  }
  if (times === 1) {
    throw new Error('fetch exceed limit');
  }
  await sleep(interval);
  return handleLoopFetch({
    fetch,
    times: times - 1,
    interval,
    checkIsContinue,
    checkIsInvalid,
  });
};
