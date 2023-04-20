/**
 * LoginSocialGoogle
 */
import { Button } from 'antd';
import React, { memo } from 'react';
import { IResolveParams } from 'reactjs-social-login';
import { IGoogleLoginConfig } from '../../types';
import { googleAuthAccessToken } from '../../utils';
import { ObjectType } from '../types';

export interface LoginSocialGoogleComProps extends IGoogleLoginConfig {
  children?: React.ReactNode;
  onResolve: ({ provider, data }: IResolveParams) => void;
  onReject?: (reject: string | ObjectType) => void;
}

const LoginSocialGoogleCom = (props: LoginSocialGoogleComProps) => {
  return (
    // <LoginSocialGoogle
    //   isOnlyGetToken
    //   scope={
    //     'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile' +
    //     (props?.scope ?? '')
    //   }
    //   client_id={props?.clientId || ''}
    //   {...props}
    //   ux_mode={props?.uxMode}
    //   onResolve={props?.onResolve}
    //   login_hint={props?.loginHint}
    //   access_type={props?.accessType}
    //   auto_select={props?.autoSelect}
    //   redirect_uri={props?.redirectUri}
    //   cookie_policy={props?.cookiePolicy}
    //   hosted_domain={props?.hostedDomain}
    //   discoveryDocs={props?.discoveryDocs}
    //   fetch_basic_profile={props?.fetchBasicProfile}
    //   onReject={props?.onReject as any}
    // />
    <Button
      onClick={async () => {
        try {
          const res = await googleAuthAccessToken(props);
          props?.onResolve?.({ provider: 'Google', data: res });
        } catch (error) {
          props.onReject?.(error as any);
        }
      }}>
      {props.children}
    </Button>
  );
};

export default memo(LoginSocialGoogleCom);
