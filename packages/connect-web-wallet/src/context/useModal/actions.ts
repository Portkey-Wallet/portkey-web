import { basicActions } from '../utils';

const modalActions = {
  setDialogVisible: 'SET_DIALOG_VISIBLE',
  destroy: 'DESTROY',
};

export type modalState = {
  dialogVisible: boolean;
  leftCallBack?: () => void;
};

export const basicModalView = {
  setWalletDialog: {
    type: modalActions['setDialogVisible'],
    actions: (dialogVisible: boolean) => {
      return basicActions(modalActions['setDialogVisible'], {
        dialogVisible,
      });
    },
  },

  destroy: {
    type: modalActions['destroy'],
    actions: () => basicActions(modalActions['destroy']),
  },
};
