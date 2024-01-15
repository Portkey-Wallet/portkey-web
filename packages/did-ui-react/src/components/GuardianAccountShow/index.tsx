import { UserGuardianItem } from '../../types';
import { AccountType, AccountTypeEnum } from '@portkey-v1/services';
import './index.less';

export default function AccountShow({ guardian }: { guardian: UserGuardianItem | undefined }) {
  switch (AccountTypeEnum[guardian?.guardianType as AccountType]) {
    case AccountTypeEnum.Email:
    case AccountTypeEnum.Phone:
      return <div className="social-guardian-account account-text-one-row">{guardian?.guardianIdentifier}</div>;
    case AccountTypeEnum.Google:
    case AccountTypeEnum.Apple:
    case AccountTypeEnum.Telegram:
      return (
        <div className="social-guardian-account account-text-two-row portkey-ui-flex-column">
          <span className="social-guardian-name">{guardian?.firstName}</span>
          <span className="social-guardian-detail">{guardian?.isPrivate ? '******' : guardian?.thirdPartyEmail}</span>
        </div>
      );
    default:
      return <></>;
  }
}
