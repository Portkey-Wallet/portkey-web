import { AccountType } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { ICountryItem } from '../../types';

export interface GuardianInputInfo {
  identifier: string; // account
  accountType: AccountType;
  authenticationInfo?: {
    appleIdToken?: string;
    googleAccessToken?: string;
  };
}

export interface SignInSuccess extends GuardianInputInfo {
  chainId: ChainId;
  isLoginIdentifier?: boolean;
}

export interface IPhoneCountry {
  /** @deprecated Use `iso` replacement */
  country?: ICountryItem['country'];
  iso?: ICountryItem['iso'];
  countryList?: ICountryItem[];
}
export type ISignIn = {
  setOpen: (open: boolean) => void;
};
export type SignInInterface = ISignIn;
