import { Collapse } from 'antd';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import CustomSvg from '../../../CustomSvg';
import { transNetworkText } from '../../../../utils/converter';
import { RecentAddressItem, RecentContactItemType } from '@portkey/services';
import { formatStr2EllipsisStr } from '../../../../utils';
import { IClickAddressProps } from '../../../types/assets';

export interface IContactCardProps {
  user: RecentContactItemType;
  onChange: (account: IClickAddressProps) => void;
  fromRecents?: boolean;
  className?: string;
  isMainnet: boolean;
}

export default function ContactCard({ user, className, fromRecents = true, onChange, isMainnet }: IContactCardProps) {
  const isDisabled = useCallback(
    (transactionTime: string | undefined): boolean => fromRecents && !transactionTime,
    [fromRecents],
  );
  const header = useMemo(
    () => (
      <div className="header">
        <div className="icon">{user.index || ''}</div>
        <p>{user.name}</p>
      </div>
    ),
    [user.index, user.name],
  );

  // const navigate = useNavigate();
  // const goRecentDetail = (targetAddress: string, targetChainId: ChainId) => {
  //   navigate('/recent-detail', {
  //     state: { chainId: chainId, targetAddress, targetChainId, name: user.name, index: user.index },
  //   });
  // };

  return (
    <Collapse className={clsx('portkey-ui-contact-card', className)}>
      <Collapse.Panel header={header} key={user.address}>
        <div className="content">
          {user?.addresses?.map((address: RecentAddressItem) => (
            <div key={address.address} className={clsx(['portkey-ui-flex-between-center', 'content-item'])}>
              <div
                className={clsx(['main-info', isDisabled(address?.transactionTime) ? 'disabled' : null])}
                onClick={() =>
                  onChange({ ...address, name: user.name, isDisable: isDisabled(address?.transactionTime) })
                }>
                <span className={'address'}>
                  {`ELF_${formatStr2EllipsisStr(address.address, [6, 6])}_${address.chainId}`}
                </span>
                <span className={clsx(['network', isDisabled(address?.transactionTime) ? 'disabled' : ''])}>
                  {transNetworkText(address.chainId, isMainnet)}
                </span>
              </div>

              <div className="go-detail">
                <CustomSvg className="go-detail-icon" type={'Info'} />
              </div>
            </div>
          ))}
        </div>
      </Collapse.Panel>
    </Collapse>
  );
}
