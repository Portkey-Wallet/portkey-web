import { AccountType } from '@portkey/services';
import { ChainId } from '@portkey/types';
import { ICountryItem } from '../../types';
import { SignInProps } from '../SignStep/types';

export interface GuardianInputInfo {
  identifier: string;
  accountType: AccountType;
  authenticationInfo?: {
    authToken?: string;
    idToken?: string;
    nonce?: string;
    timestamp?: number;
  };
}

export interface IGuardianIdentifierInfo extends GuardianInputInfo {
  chainId: ChainId;
  isLoginGuardian?: boolean;
}

export interface IPhoneCountry {
  /** @deprecated Use `iso` replacement */
  country?: ICountryItem['country'];
  iso?: ICountryItem['iso'];
  countryList?: ICountryItem[];
}
export type ISignIn = {
  setOpen: (open: boolean) => void;
  setCurrentLifeCycle: (cycle: Required<SignInProps['defaultLifeCycle']>) => void;
};
export type SignInInterface = ISignIn;
