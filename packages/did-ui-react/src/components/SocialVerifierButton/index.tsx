import { AccountType, AccountTypeEnum } from '@portkey/services';
import { Button, ButtonProps } from 'antd';
import LoginSocialGoogle, { LoginSocialGoogleComProps } from '../LoginSocialGoogle';
import LoginSocialApple from '../LoginSocialApple';
import { IAppleLoginConfig } from '../../types';

interface SocialVerifierButtonProps {
  type: AccountType;
  buttonProps: ButtonProps;
  Google?: LoginSocialGoogleComProps;
  Apple?: IAppleLoginConfig;
}

export default function SocialVerifierButton({ type, buttonProps, Google, Apple }: SocialVerifierButtonProps) {
  return (
    <div>
      {typeof window !== undefined && type === AccountTypeEnum[AccountTypeEnum.Google] && (
        <LoginSocialGoogle {...(Google as any)}>
          <Button {...buttonProps} />
        </LoginSocialGoogle>
      )}
      {type === AccountTypeEnum[AccountTypeEnum.Apple] && (
        <LoginSocialApple
          client_id={Apple?.clientId || ''}
          scope={'name email' + (Apple?.scope ?? '')}
          redirect_uri={Apple?.redirectURI || ''}>
          <Button {...buttonProps} />
        </LoginSocialApple>
      )}
      {(type === AccountTypeEnum[AccountTypeEnum.Email] || type === AccountTypeEnum[AccountTypeEnum.Phone]) && (
        <Button {...buttonProps} />
      )}
    </div>
  );
}
