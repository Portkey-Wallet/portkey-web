import AES from 'crypto-js/aes';
import encUTF8 from 'crypto-js/enc-utf8';

export const encrypt = (str: string, password: string): string => {
  return AES.encrypt(str, password).toString();
};

export const decrypt = (str: string, password: string): string | false => {
  try {
    return AES.decrypt(str, password).toString(encUTF8);
  } catch (error) {
    return false;
  }
};
