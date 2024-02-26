import { FetchRequest } from '@portkey/request';

export type AppleUserInfo = {
  isExpired: boolean;
  userId: string;
  email: string;
  expirationTime: Date;
  isPrivate: boolean;
};

export function parseAppleIdentityToken(identityToken?: string | null): AppleUserInfo | undefined {
  if (!identityToken) return;
  const parts = identityToken.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  const expirationTime = new Date(payload.exp * 1000);
  const isExpired = expirationTime < new Date();
  const userId = payload.sub;
  const email = payload.email;
  const isPrivate =
    typeof payload.is_private_email === 'string'
      ? payload.is_private_email === 'true'
      : payload.is_private_email || !payload.email;
  return { isExpired, userId, email, expirationTime, isPrivate };
}

type GoogleUserInfo = {
  email: string;
  family_name: string;
  given_name: string;
  id: string;
  locale: string;
  name: string;
  picture: string;
  verified_email: boolean;
  firstName: string;
  lastName: string;
};

const TmpUserInfo: { [key: string]: GoogleUserInfo } = {};

export async function getGoogleUserInfo(accessToken = ''): Promise<GoogleUserInfo> {
  const customFetch = new FetchRequest({});
  if (!TmpUserInfo[accessToken])
    TmpUserInfo[accessToken] = await customFetch.send({
      url: 'https://www.googleapis.com/userinfo/v2/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

  return {
    ...TmpUserInfo[accessToken],
    firstName: TmpUserInfo[accessToken].given_name,
    lastName: TmpUserInfo[accessToken].family_name,
  };
}

interface TelegramUserInfo {
  isExpired: boolean;
  userId: string;
  id: string;
  expirationTime: number;
  firstName: string;
  lastName?: string;
  picture?: string;
  email?: undefined;
  isPrivate: boolean;
}

export function parseTelegramToken(token?: string | null): TelegramUserInfo | undefined {
  if (!token) return;
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  const expirationTime = payload.exp * 1000;
  const isExpired = new Date(expirationTime) < new Date();
  const userId = payload.userId;
  const firstName = payload.firstName;
  const picture = payload.protoUrl;
  const lastName = payload.lastName;
  return { isExpired, userId, expirationTime, isPrivate: true, firstName, picture, lastName, id: userId };
}

interface FacebookUserInfo {
  isExpired: boolean;
  userId: string;
  id: string;
  expirationTime: number;
  firstName: string;
  lastName?: string;
  picture?: string;
  email?: undefined;
  isPrivate: boolean;
  name: string;
  accessToken: string;
}

const fbUserInfo: { [key: string]: FacebookUserInfo } = {};

export async function parseFacebookToken(tokenStr?: string | null): Promise<FacebookUserInfo | undefined> {
  if (!tokenStr) return;
  try {
    const { userId, token: accessToken, expiresTime } = JSON.parse(tokenStr);

    const expirationTime = Number(expiresTime) * 1000;
    const isExpired = new Date(expirationTime) < new Date();

    const customFetch = new FetchRequest({});
    if (!fbUserInfo[accessToken]) {
      const result = await customFetch.send({
        url: `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${accessToken}`,
        method: 'GET',
      });
      const [firstName, lastName] = result?.name.split(' ');

      fbUserInfo[accessToken] = {
        userId,
        id: userId,
        name: result.name,
        isExpired,
        expirationTime,
        isPrivate: true,
        firstName,
        lastName,
        picture: result?.picture?.data?.url,
        accessToken: accessToken,
      };
    }

    return fbUserInfo[accessToken];
  } catch (error) {
    return;
  }
}

interface TwitterUserInfo {
  isExpired: boolean;
  userId: string;
  id: string;
  expirationTime: number;
  firstName: string;
  lastName?: string;
  picture?: string;
  email?: undefined;
  isPrivate: boolean;
  name: string;
  accessToken: string;
  username?: string;
}

const XUserInfo: { [key: string]: TwitterUserInfo } = {};

interface TwitterTokenUserInfo {
  id?: string;
  name?: string;
  username?: string;
}

export function getTwitterInfoByToken(token: string) {
  const strArr = token.split('&');
  const map = {} as any;
  strArr.forEach((str) => {
    const [key, value] = str.split('=');
    //  Get only user parameters
    map[key] = value;
  });
  return map as TwitterTokenUserInfo;
}

export function parseTwitterToken(tokenStr?: string | null): TwitterUserInfo | undefined {
  if (!tokenStr) return;

  try {
    const { id = '', name = '', username = '' } = getTwitterInfoByToken(tokenStr);
    const [firstName, lastName] = name.split(' ');

    let expirationTime = Date.now() + 60 * 60 * 1000;

    if (XUserInfo[tokenStr]) expirationTime = XUserInfo[tokenStr].expirationTime;
    const isExpired = new Date(expirationTime) < new Date();

    return {
      isExpired,
      userId: id,
      id,
      expirationTime,
      firstName: firstName,
      lastName: lastName,
      picture: undefined,
      email: undefined,
      isPrivate: true,
      name: name,
      accessToken: tokenStr,
      username,
    };
  } catch (error) {
    return;
  }
}
