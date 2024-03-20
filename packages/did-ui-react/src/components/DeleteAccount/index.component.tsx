import { Button } from 'antd';
import './index.less';
import CustomSvg from '../CustomSvg';
import BackHeaderForPage from '../BackHeaderForPage';
import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import { useEffectOnce } from 'react-use';
import CustomModal from '../CustomModal';
import { singleMessage } from '../CustomAnt';
import { did, handleErrorMessage, parseAppleIdentityToken, setLoading, socialLoginAuth } from '../../utils';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import ConfigProvider from '../config-provider';
import { usePortkey } from '../context';
import { getGuardianList } from '../SignStep/utils/getGuardians';

export interface DeleteAccountProps {
  className?: string;
  onBack?: () => void;
  onDelete?: () => void;
}

const DeleteAccountConditions = {
  warning:
    "Are you sure you want to delete your account?Please note that you won't be able to recover your account once it's deleted. ",
  explanation:
    'Account deletion is an irreversible operation. Once deleted, your account cannot be recovered. Please carefully consider this before continuing.',
  summary: 'Please note that your account can only be deleted if it meets the following conditions:',
  conditions: [
    {
      key: 1,
      label: 'Asset',
      content: 'Your account has no balance, including tokens and NFTs.',
    },
    {
      key: 2,
      label: 'Guardian',
      content: 'Your Apple ID is not set as a guardian by any other accounts.',
    },
    {
      key: 3,
      label: 'Login Device',
      content: 'Your account is only logged in on this device.',
    },
  ],
  accountDetection: {
    title: 'Unable to Delete Account',
    content: {
      assets:
        'There are still remaining assets in your account. To proceed, please first transfer all assets out of your account.',
      guardians:
        "Your Apple ID is set as a guardian by other accounts. To proceed, please first remove your Apple ID's linked guardian.",
      loginDevices:
        'Your account is logged in on other devices. To proceed, please first log out there or remove the login device.',
    },
    okText: 'Ok',
  },
};

export default function DeleteAccountMain({ className, onBack, onDelete }: DeleteAccountProps) {
  const [{ managementAccount, caHash, originChainId }] = usePortkeyAsset();
  const [{ networkType }] = usePortkey();
  const _socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);

  const deleteAccount = useCallback(async () => {
    if (!caHash || !managementAccount?.address) return;
    setLoading(true);
    let appleToken;
    try {
      const { Apple } = _socialLogin ?? {};
      let token;
      if (Apple?.customLoginHandler) {
        const result = await Apple.customLoginHandler();
        token = result.data?.accessToken || result.data?.token;
      } else {
        const result = await socialLoginAuth({
          type: 'Apple',
          clientId: Apple?.clientId,
          redirectURI: Apple?.redirectURI,
          network: networkType,
        });
        token = result.token;
      }
      const userInfo = parseAppleIdentityToken(token);
      const guardianList = await getGuardianList({
        caHash: did.didWallet.aaInfo.accountInfo?.caHash || '',
        originChainId,
      });
      let isExist;
      guardianList.forEach((item) => {
        if (item.type === 'Apple' && item.identifier === userInfo?.userId) {
          isExist = true;
        }
      });
      if (!isExist) {
        setLoading(false);
        return singleMessage.error('Account does not match');
      }

      appleToken = token;
    } catch (error) {
      // error
      setLoading(false);
    }
    if (!appleToken) return setLoading(false);

    try {
      setLoading(true);

      await did.services.communityRecovery.deletionAccount({ appleToken });
    } catch (error) {
      console.log(error);
      const message = handleErrorMessage(error, 'deletion account error');
      singleMessage.error(message);
    } finally {
      await did.logout({ chainId: originChainId });
      setLoading(false);

      onDelete?.();
    }
  }, [_socialLogin, caHash, managementAccount?.address, networkType, onDelete, originChainId]);

  const AccountCancellationModal = useCallback(
    (pass?: boolean) => {
      CustomModal({
        type: 'confirm',
        okText: 'Continue',
        cancelText: 'Cancel',
        className: 'portkey-ui-account-cancellation-modal',
        content: (
          <div className="portkey-ui-flex-column">
            <div className="account-cancellation-modal-title">Warning</div>
            <div>{DeleteAccountConditions.warning}</div>
          </div>
        ),
        onOk: pass ? deleteAccount : undefined,
        onCancel: pass ? undefined : onBack,
      });
    },
    [onBack, deleteAccount],
  );

  const CheckDeleteResultModal = useCallback((list: string[]) => {
    CustomModal({
      content: (
        <>
          <div className="title">Unable to Delete Account</div>
          {list.map((tip, index) => (
            <div key={index}>
              {list.length > 1 ? `${index + 1}. ` : ''}
              {tip}
            </div>
          ))}
        </>
      ),
    });
  }, []);

  const onDeleteAccount = useCallback(async () => {
    if (!caHash) return; // || !managerAddress
    setLoading(true);
    try {
      // deletion check
      const req = await did.services.communityRecovery.checkDeletion();
      const { validatedAssets, validatedDevice, validatedGuardian } = req || {};
      const ruleList: string[] = [];
      if (!validatedAssets) ruleList.push(DeleteAccountConditions.accountDetection.content.assets);
      if (!validatedDevice) ruleList.push(DeleteAccountConditions.accountDetection.content.loginDevices);
      if (!validatedGuardian) ruleList.push(DeleteAccountConditions.accountDetection.content.guardians);
      if (ruleList.length > 0) {
        return CheckDeleteResultModal(ruleList);
      }
      AccountCancellationModal(true);
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [AccountCancellationModal, CheckDeleteResultModal, caHash]);

  useEffectOnce(() => {
    // show alert after transition animation
    const timer = setTimeout(() => {
      AccountCancellationModal();
    }, 500);
    return () => clearTimeout(timer);
  });

  return (
    <div className={clsx('portkey-ui-delete-account', className)}>
      <div className="portkey-ui-flex-1">
        <BackHeaderForPage title="Delete Account" leftCallBack={onBack} />
        <div className="portkey-ui-flex-column-center portkey-ui-delete-account-body">
          <CustomSvg type="WarnRedBackground" style={{ width: 48, height: 48 }} />
          <div className="warning-tip">{DeleteAccountConditions.explanation}</div>
          <div className="conditions">
            <div className="conditions-summary">{DeleteAccountConditions.summary}</div>
            {DeleteAccountConditions.conditions.map((item) => {
              return (
                <div key={'DeleteAccountConditions_' + item.key + '_' + item.label} className="conditions-item">
                  <div className="conditions-item-label">{`${item.key}. ${item.label}`}</div>
                  <div className="conditions-item-value">{item.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="portkey-ui-delete-account-footer">
        <Button type="primary" onClick={onDeleteAccount}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
