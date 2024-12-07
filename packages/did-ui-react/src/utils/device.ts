import { FetchRequest } from '@portkey/request';
import { DEVICE_INFO_VERSION, DEVICE_TYPE_INFO } from '../constants/device';
import { DeviceInfoType, DeviceType, ExtraDataDecodeType, ExtraDataType, QRExtraDataType } from '../types';

const checkDateNumber = (value: number): boolean => {
  return !isNaN(value) && !isNaN(new Date(value).getTime());
};

export const getDeviceInfoFromQR = (qrExtraData?: QRExtraDataType, deviceType?: DeviceType): DeviceInfoType => {
  if (qrExtraData !== undefined) {
    return {
      ...DEVICE_TYPE_INFO[DeviceType.OTHER],
      ...qrExtraData.deviceInfo,
    };
  }
  if (deviceType === undefined || DeviceType[deviceType] === undefined) {
    return DEVICE_TYPE_INFO[DeviceType.OTHER];
  }
  return DEVICE_TYPE_INFO[deviceType];
};

const isJSON = (str: string) => {
  if (typeof str !== 'string') return false;
  try {
    JSON.parse(str);
    return true;
  } catch (_e) {
    return false;
  }
};

export const extraDataEncode = async (
  deviceInfo: DeviceInfoType,
  apiUrl: string,
  // isNeedEncrypt = false,
): Promise<string> => {
  const isNeedEncrypt = false;
  if (!isNeedEncrypt) {
    return JSON.stringify({
      transactionTime: Date.now(),
      deviceInfo: JSON.stringify(deviceInfo),
      version: DEVICE_INFO_VERSION,
    });
  }
  // TODO
  let deviceInfoJSON = JSON.stringify(deviceInfo);
  try {
    const customFetch = new FetchRequest({});
    const rst = await customFetch.send({
      url: apiUrl,
      method: 'GET',
      params: {
        data: [deviceInfoJSON],
      },
    });

    const resultList = rst?.result;
    deviceInfoJSON = resultList?.[0] || '';

    if (typeof deviceInfoJSON !== 'string' || isJSON(deviceInfoJSON)) {
      deviceInfoJSON = '';
    }
  } catch (error) {
    deviceInfoJSON = '';
    console.log(error);
  }

  return JSON.stringify({
    transactionTime: Date.now(),
    deviceInfo: deviceInfoJSON,
    version: DEVICE_INFO_VERSION,
  });
};

export const extraDataListDecode = async (extraDataStrList: string[], baseUrl: string) => {
  const extraDataList = extraDataStrList.map((extraDataStr) => {
    // let version = '0.0.1';
    let extraEncodeData: ExtraDataType;
    try {
      extraEncodeData = JSON.parse(extraDataStr) as ExtraDataType;
      if (
        typeof extraEncodeData !== 'object' ||
        (typeof extraEncodeData === 'object' && Array.isArray(extraEncodeData))
      ) {
        throw new Error('error type');
      }
      if (!extraEncodeData.deviceInfo) extraEncodeData.deviceInfo = '';
      if (typeof extraEncodeData.version !== 'string') extraEncodeData.version = '0.0.1';
      if (typeof extraEncodeData.transactionTime !== 'number' || !checkDateNumber(extraEncodeData.transactionTime)) {
        extraEncodeData.transactionTime = 0;
      }
    } catch (error) {
      extraEncodeData = {
        deviceInfo: typeof extraDataStr !== 'string' ? '' : extraDataStr,
        transactionTime: 0,
        version: '0.0.1',
      };
    }
    return extraEncodeData;
  });

  const decryptDataList: Array<string> = [];
  const decryptIndexList: Array<number> = [];
  extraDataList.forEach((item, idx) => {
    if (!item.deviceInfo || item.version !== '2.0.0') return;
    decryptDataList.push(item.deviceInfo);
    decryptIndexList.push(idx);
  });
  try {
    const customFetch = new FetchRequest({});
    const rst = await customFetch.send({
      url: `${baseUrl}/api/app/account/device/encrypt`,
      params: {
        data: decryptDataList,
      },
    });
    const resultList = rst.result;
    if (Array.isArray(resultList)) {
      resultList.forEach((item, idx) => {
        if (typeof item !== 'string') return;
        extraDataList[decryptIndexList[idx]].deviceInfo = item;
      });
    }
  } catch (error) {
    console.log('fetchDecrypt: error', error);
  }

  return extraDataList.map((item) => extraDataDecode(item));
};

export const extraDataDecode = (_extraData: ExtraDataType): ExtraDataDecodeType => {
  const extraData = {
    ..._extraData,
    deviceInfo: {
      ...DEVICE_TYPE_INFO[DeviceType.OTHER],
    },
  };

  const deviceInfoStr = _extraData.deviceInfo;
  let extraDataArray;
  let deviceType: DeviceType, transactionTime: number | undefined;
  let firstNum;
  let secondNum;
  switch (_extraData.version) {
    case '0.0.1':
      extraDataArray = deviceInfoStr.split(',').map((itemValue) => Number(itemValue));

      (deviceType = DeviceType.OTHER), (transactionTime = undefined);
      firstNum = extraDataArray[0];
      if (firstNum !== undefined && !isNaN(firstNum)) {
        if (DeviceType[firstNum] !== undefined) {
          deviceType = firstNum;
        } else if (checkDateNumber(firstNum)) {
          transactionTime = firstNum;
        }
      }
      secondNum = extraDataArray[1];
      if (transactionTime === undefined && secondNum !== undefined && checkDateNumber(secondNum)) {
        transactionTime = secondNum;
      }
      if (DEVICE_TYPE_INFO[deviceType] !== undefined) {
        extraData.deviceInfo = DEVICE_TYPE_INFO[deviceType];
      }
      if (transactionTime) {
        extraData.transactionTime = transactionTime;
      }
      break;

    case '1.0.0':
    case '2.0.0':
      try {
        extraData.deviceInfo = {
          ...extraData.deviceInfo,
          ...JSON.parse(deviceInfoStr),
        };
      } catch (error) {
        // extraData.deviceInfo = DEVICE_TYPE_INFO[DeviceType.OTHER];
      }
      break;

    default:
      break;
  }

  if (extraData.deviceInfo.deviceType === undefined || DeviceType[extraData.deviceInfo.deviceType] === undefined) {
    extraData.deviceInfo.deviceType = DeviceType.OTHER;
  }

  return extraData;
};

export function compareVersions(v1: string, v2: string) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    if (v1Part < v2Part) {
      return -1;
    } else if (v1Part > v2Part) {
      return 1;
    }
  }
  return 0;
}
export function isMobileWidth() {
  return window.innerWidth < 769;
}
export function isPadWidth() {
  return window.innerWidth >= 769 && window.innerWidth <= 1024;
}
