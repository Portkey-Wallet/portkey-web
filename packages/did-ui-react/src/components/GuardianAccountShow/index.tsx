import { UserGuardianItem } from '../../types';
import { AccountType, AccountTypeEnum } from '@portkey/services';
import './index.less';

export default function AccountShow({ guardian }: { guardian: UserGuardianItem | undefined }) {
  switch (AccountTypeEnum[guardian?.guardianType as AccountType]) {
    case AccountTypeEnum.Email:
    case AccountTypeEnum.Phone:
      return <div className="account account-text-one-row">{guardian?.guardianIdentifier}</div>;
    case AccountTypeEnum.Google:
    case AccountTypeEnum.Apple:
      return (
        <div className="account account-text-two-row portkey-ui-flex-column">
          <span className="name">{guardian?.firstName}</span>
          <span className="detail">{guardian?.isPrivate ? '******' : guardian?.thirdPartyEmail}</span>
        </div>
      );
    default:
      return <></>;
  }
}
