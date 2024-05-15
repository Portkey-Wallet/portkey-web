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
