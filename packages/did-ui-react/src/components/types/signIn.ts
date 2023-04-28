import { AccountType } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { CountryItem } from '../../types';

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
  country: CountryItem['country'];
  countryList: CountryItem[];
}

export type SignInInterface = {
  setOpen: (open: boolean) => void;
};
