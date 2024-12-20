import VerifierPair from '../../../VerifierPair';
import { useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { UserGuardianItem, UserGuardianStatus } from '../../../../types';
import CustomSvg from '../../../CustomSvg';

interface GuardianItemProps {
  item: UserGuardianStatus;
  onClick?: (item: UserGuardianItem) => void;
}

function GuardianItems({ item, onClick }: GuardianItemProps) {
  const { t } = useTranslation();

  const accountShow = useCallback((guardian: UserGuardianItem) => {
    switch (guardian.guardianType) {
      case 'Email':
      case 'Phone':
        return <div className="account-text account-text-one-row">{guardian.guardianIdentifier}</div>;
      case 'Google':
        return (
          <div className="account-text account-text-two-row">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.thirdPartyEmail}</div>
          </div>
        );
      case 'Apple':
      case 'Telegram':
      case 'Twitter':
      case 'Facebook':
        return (
          <div className="account-text account-text-two-row">
            <div className="name">{guardian.firstName}</div>
            <div className="detail">{guardian.isPrivate ? '******' : guardian.thirdPartyEmail || '******'}</div>
          </div>
        );
    }
  }, []);

  return (
    <li className={clsx('verifier-item')} onClick={() => onClick?.(item)}>
      {item.isLoginGuardian && <div className="login-icon">{t('Login Account')}</div>}
      <div className="item-box">
        <div className="portkey-ui-w-100 item-left">
          <VerifierPair
            guardian={item}
            guardianType={item.guardianType}
            verifierSrc={item.verifier?.imageUrl}
            verifierName={item.verifier?.name}
          />
          {accountShow(item)}
        </div>
        <CustomSvg className="portkey-ui-enter-btn" type="ChevronRight" style={{ width: 16, height: 16 }} />
      </div>
    </li>
  );
}

export default memo(GuardianItems);
