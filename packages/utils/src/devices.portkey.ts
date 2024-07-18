export interface DeviceInfoType {
  deviceName?: string;
  deviceType?: DeviceType;
}

export enum DeviceType {
  OTHER,
  MAC,
  IOS,
  WINDOWS,
  ANDROID,
}

export const DEVICE_INFO_VERSION = '2.0.0';

export const getDeviceInfo = (deviceType: DeviceType): DeviceInfoType => {
  switch (deviceType) {
    case DeviceType.MAC: {
      return { deviceName: 'macOS', deviceType };
    }
    case DeviceType.WINDOWS: {
      return { deviceName: 'Windows', deviceType };
    }
    default: {
      return { deviceName: 'Other', deviceType };
    }
  }
};

export const getDeviceType = () => {
  if (typeof navigator === 'undefined') return DeviceType.OTHER;
  if (!navigator?.userAgent) return DeviceType.OTHER;
  const agent = navigator.userAgent.toLowerCase();
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  if (isMac) {
    return DeviceType.MAC;
  }
  if (agent.indexOf('win') >= 0 || agent.indexOf('wow') >= 0) {
    return DeviceType.WINDOWS;
  }
  return DeviceType.OTHER;
};

export const getExtraData = async (): Promise<string> => {
  const deviceInfo = getDeviceInfo(getDeviceType());
  return JSON.stringify({
    transactionTime: Date.now(),
    deviceInfo: JSON.stringify(deviceInfo),
    version: DEVICE_INFO_VERSION,
  });
};
