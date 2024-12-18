import './index.less';
import CustomSvg from '../CustomSvg';
import BackHeaderForPage from '../BackHeaderForPage';
import clsx from 'clsx';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useEffectOnce } from 'react-use';
import { singleMessage } from '../CustomAnt';
import { did, handleErrorMessage, parseAppleIdentityToken, setLoading, socialLoginAuth } from '../../utils';
import { usePortkeyAsset } from '../context/PortkeyAssetProvider';
import ConfigProvider from '../config-provider';
import { usePortkey } from '../context';
import { getGuardianList } from '../SignStep/utils/getGuardians';
import CommonButton from '../CommonButton';
import CommonModal from '../CommonModal';

export interface DeleteAccountProps {
  className?: string;
  onBack?: () => void;
  onDelete?: () => void;
}

const DeleteAccountConditions = {
  warning: 'Are you sure you want to delete your account? This action is irreversible.',
  explanation:
    'Deleting your account is a permanent action. Once deleted, your account cannot be recovered. Please consider this carefully before proceeding.',
  summary: 'To continue with deletion, ensure the following conditions are met:',
  conditions: [
    {
      key: 1,
      label: 'Assets',
      content: 'Transfer all assets, including Tokens and NFTs, out of your account.',
    },
    {
      key: 2,
      label: 'Guardians',
      content: 'Other users must have disassociated the Guardian from your current email.',
    },
    {
      key: 3,
      label: 'Login Device',
      content: 'Ensure your account is only logged in on this device.',
    },
  ],
  accountDetection: {
    title: 'Unable to Delete Account',
    content: {
      assets: 'You still have assets in your account. Please transfer them out to continue.',
      guardians:
        'Your account is currently set as a guardian for other accounts. Please disassociate your account as a guardian to proceed.',
      loginDevices:
        'Your account is logged in on other devices. Please log out of those devices or remove them to proceed.',
    },
    okText: 'OK',
  },
};

export default function DeleteAccountMain({ className, onBack, onDelete }: DeleteAccountProps) {
  const [{ managementAccount, caHash, originChainId }] = usePortkeyAsset();
  const [openWarningModal, setOpenWarningModal] = useState<boolean>(false);
  const [openUnableDeleteModal, setOpenUnableDeleteModal] = useState<boolean>(false);
  const [{ networkType }] = usePortkey();
  const _socialLogin = useMemo(() => ConfigProvider.getSocialLoginConfig(), []);
  const ruleListRef = useRef<string[]>();
  const passRef = useRef<boolean>();

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
        token = result?.token;
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
      console.log(error);
    } finally {
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

  const AccountCancellationModal = useCallback((pass?: boolean) => {
    passRef.current = pass;
    setOpenWarningModal(true);
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
        ruleListRef.current = ruleList;
        return setOpenUnableDeleteModal(true);
      }
      AccountCancellationModal(true);
    } catch (error) {
      singleMessage.error(handleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [caHash, AccountCancellationModal]);

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
        <BackHeaderForPage title="Account Deletion" leftCallBack={onBack} />
        <div className="portkey-ui-flex-column-center portkey-ui-delete-account-body">
          <CustomSvg type="VectorWarning" style={{ width: 64, height: 64 }} className="warning-icon" />
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
        <CommonButton type="danger" onClick={onDeleteAccount} block>
          Confirm account deletion
        </CommonButton>
      </div>
      <CommonModal
        className="deletion-warning-modal"
        open={openWarningModal}
        height={'auto'}
        onClose={() => {
          setOpenWarningModal(false);
        }}>
        <div className="portkey-ui-flex-column deletion-warning-modal-container">
          <CustomSvg type={'Error'} className="deletion-warning-modal-error" />
          <div className="account-cancellation-modal-title">Delete Account Warning</div>
          <div className="account-cancellation-modal-content">{DeleteAccountConditions.warning}</div>
          <div className="portkey-ui-flex-row-center deletion-warning-modal-bottom-wrapper">
            <CommonButton
              type="outline"
              block
              onClick={() => {
                if (!passRef.current) {
                  onBack?.();
                }
                setOpenWarningModal(false);
              }}>
              Cancel
            </CommonButton>
            <CommonButton
              type="danger"
              block
              onClick={() => {
                if (passRef.current) {
                  deleteAccount();
                }
                setOpenWarningModal(false);
              }}>
              Continue
            </CommonButton>
          </div>
        </div>
      </CommonModal>
      <CommonModal
        className="unable-delete-modal"
        open={openUnableDeleteModal}
        height={'auto'}
        onClose={() => {
          setOpenUnableDeleteModal(false);
        }}>
        <div className="portkey-ui-flex-column unable-delete-modal-container">
          <CustomSvg type={'Error'} className="unable-delete-modal-error" />
          <div className="unable-delete-modal-title">Unable to Delete Account</div>
          <div className="unable-delete-modal-content">
            <div>Please check the following:</div>
            {ruleListRef.current?.map((tip, index) => (
              <div key={index}>
                {(ruleListRef.current?.length || 0) > 1 ? `. ` : ''}
                {tip}
              </div>
            ))}
          </div>
          <div className="portkey-ui-flex-row-center unable-delete-modal-bottom-wrapper">
            <CommonButton
              type="primary"
              block
              onClick={() => {
                setOpenUnableDeleteModal(false);
              }}>
              {DeleteAccountConditions.accountDetection.okText}
            </CommonButton>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}
