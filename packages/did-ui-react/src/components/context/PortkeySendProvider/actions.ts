import { basicActions } from '../utils';
import { did } from '../../../utils';
import { BaseListInfo } from '../../../types';
import { CaAddressInfosType, RecentContactItemType } from '@portkey-v1/services';

export const PortkeySendActions = {
  initialized: 'INITIALIZED',
  destroy: 'DESTROY',
  setRecentTx: 'setRecentTx',
};

export interface SendState {
  initialized?: boolean;
  recentTx?: BaseListInfo<RecentContactItemType>;
}

export const basicSendView = {
  initialized: {
    type: PortkeySendActions['initialized'],
    actions: (initialized: boolean) => basicActions(PortkeySendActions['initialized'], { initialized }),
  },

  destroy: {
    type: PortkeySendActions['destroy'],
    actions: () => basicActions(PortkeySendActions['destroy']),
  },
};

const fetchRecentList = async ({
  isUpdate,
  caAddressInfos,
  skipCount,
  pageSize,
}: {
  isUpdate?: boolean;
  skipCount: number;
  pageSize: number;
  caAddressInfos: CaAddressInfosType;
}) => {
  const response = await did.services.transaction.getRecentTransactionUsers({
    skipCount,
    maxResultCount: pageSize,
    caAddressInfos,
  });
  const payload = {
    isUpdate,
    skipCount,
    list: response.data,
    totalRecordCount: response.totalRecordCount,
  };
  return basicActions<string, typeof payload>(PortkeySendActions['setRecentTx'], payload);
};

export const basicSendAction = {
  setRecentList: fetchRecentList,
};
