import { DeviceInfoType, DeviceType } from '../types';

export const DEVICE_INFO_VERSION = '2.0.0';
const getDeviceType = () => {
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

// device
export const DEVICE_TYPE = getDeviceType();

export const DEVICE_TYPE_INFO: Record<DeviceType, DeviceInfoType> = {
  [DeviceType.OTHER]: {
    deviceName: 'Other',
    deviceType: DeviceType.OTHER,
  },
  [DeviceType.MAC]: {
    deviceName: 'macOS',
    deviceType: DeviceType.MAC,
  },
  [DeviceType.IOS]: {
    deviceName: 'iOS',
    deviceType: DeviceType.IOS,
  },
  [DeviceType.WINDOWS]: {
    deviceName: 'Windows',
    deviceType: DeviceType.WINDOWS,
  },
  [DeviceType.ANDROID]: {
    deviceName: 'Android',
    deviceType: DeviceType.ANDROID,
  },
};

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

export const isSafariBrowser = () => /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
