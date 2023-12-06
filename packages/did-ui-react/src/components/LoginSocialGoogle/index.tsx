/**
 * LoginSocialGoogle
 */
import { Button } from 'antd';
import React, { memo } from 'react';
import { IGoogleLoginConfig } from '../../types';
import { IResolveParams, ObjectType } from '../types';

export interface LoginSocialGoogleComProps extends IGoogleLoginConfig {
  children?: React.ReactNode;
  onResolve: ({ provider, data }: IResolveParams) => void;
  onReject?: (reject: string | ObjectType) => void;
}

const LoginSocialGoogleCom = (props: LoginSocialGoogleComProps) => {
  return (
    <Button
      onClick={async () => {
        try {
          throw 'Not support';
          // const res = await googleAuthAccessToken(props);
          // props?.onResolve?.({ provider: 'Google', data: res });
        } catch (error) {
          props.onReject?.(error as any);
        }
      }}>
      {props.children}
    </Button>
  );
};

export default memo(LoginSocialGoogleCom);
