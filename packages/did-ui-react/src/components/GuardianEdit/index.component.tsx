import { Button, message } from 'antd';
import { GuardiansApproved, OperationTypeEnum } from '@portkey/services';
import { useState, useMemo, useCallback, memo, ReactNode, useRef, useEffect } from 'react';
import CommonSelect from '../CommonSelect';
import { VerifierItem } from '@portkey/did';
import { ChainId } from '@portkey/types';
import { did, errorTip, handleErrorMessage, setLoading } from '../../utils';
import { OnErrorFunc, UserGuardianStatus } from '../../types';
import CustomSvg from '../CustomSvg';
import { useTranslation } from 'react-i18next';
import GuardianApproval from '../GuardianApproval';
import CustomModal from '../CustomModal';
import CommonBaseModal from '../CommonBaseModal';
import GuardianAccountShow from '../GuardianAccountShow';
import clsx from 'clsx';
import BackHeader from '../BackHeader';
import { verifierExistTip, verifierUsedTip } from '../../constants/guardian';
import { AccountType } from '@portkey/services';
import './index.less';

const guardianIconMap: any = {
  Email: 'Email',
  Phone: 'GuardianPhone',
  Google: 'GuardianGoogle',
  Apple: 'GuardianApple',
};

export interface GuardianEditProps {
  header?: ReactNode;
  className?: string;
  originChainId: ChainId;
  caHash: string;
  verifierList?: VerifierItem[];
  isErrorTip?: boolean;
  guardianList?: UserGuardianStatus[];
  currentGuardian?: UserGuardianStatus;
  preGuardian?: UserGuardianStatus;
  networkType?: string;
  onError?: OnErrorFunc;
  handleEditGuardian?: (currentGuardian: UserGuardianStatus, approvalInfo: GuardiansApproved[]) => Promise<any>;
  handleRemoveGuardian?: (approvalInfo: GuardiansApproved[]) => Promise<any>;
  handleSetLoginGuardian: () => Promise<any>;
}
export interface ISocialInput {
  id: string;
  firstName: string;
  thirdPartyEmail: string;
  accessToken: string;
  isPrivate?: boolean;
}

function GuardianEdit({
  header,
  className,
  originChainId,
  caHash,
  isErrorTip = true,
  verifierList,
  currentGuardian,
  preGuardian,
  guardianList,
  networkType = 'MAINNET',
  onError,
  handleEditGuardian,
  handleRemoveGuardian,
  handleSetLoginGuardian,
}: GuardianEditProps) {
  const { t } = useTranslation();
  const [isExist, setIsExist] = useState<boolean>(false);
  const curGuardian = useRef<UserGuardianStatus | undefined>(currentGuardian);
  const [selectVerifierId, setSelectVerifierId] = useState<string | undefined>(currentGuardian?.verifier?.id);
  const [approvalVisible, setApprovalVisible] = useState<boolean>(false);
  const [isRemove, setIsRemove] = useState<boolean>(false);
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const editBtnDisable = useMemo(
    () => isExist || selectVerifierId === preGuardian?.verifier?.id,
    [isExist, preGuardian?.verifier?.id, selectVerifierId],
  );
  const getGuardianList = useCallback(async () => {
    try {
      const payload = await did.getHolderInfo({
        caHash,
        chainId: originChainId,
      });
      const { guardians } = payload?.guardianList ?? { guardians: [] };
      const guardianAccounts = [...guardians];
      const _guardianList: UserGuardianStatus[] = guardianAccounts.map((item) => {
        const key = `${item.guardianIdentifier}&${item.verifierId}`;
        const _guardian = {
          ...item,
          identifier: item.guardianIdentifier,
          key,
          guardianType: item.type as AccountType,
          verifier: verifierMap.current?.[item.verifierId],
        };
        return _guardian;
      });
      return _guardianList;
    } catch (error) {
      errorTip(
        {
          errorFields: 'GetGuardianList',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    }
  }, [caHash, isErrorTip, onError, originChainId]);

  const customSelectOption = useMemo(
    () => [
      {
        value: 'tip',
        disabled: true,
        className: 'portkey-option-tip',
        label: (
          <div className="portkey-ui-flex label-item">
            <CustomSvg type="Warning" />
            <div className="tip">{verifierUsedTip}</div>
          </div>
        ),
      },
    ],
    [],
  );
  const verifierSelectItems = useMemo(
    () =>
      verifierList?.map((item) => ({
        value: item?.id,
        iconUrl: item?.imageUrl ?? '',
        label: item?.name,
        icon: <img src={item?.imageUrl} />,
        id: item?.id,
        disabled: !!guardianList
          ?.filter((temp) => temp.key !== preGuardian?.key)
          .find((_guardian) => _guardian.verifierId === item.id),
      })),
    [guardianList, preGuardian?.key, verifierList],
  );
  useEffect(() => {
    const _verifierMap: { [x: string]: VerifierItem } = {};
    verifierList?.forEach((item: VerifierItem) => {
      _verifierMap[item.id] = item;
    }, []);
    verifierMap.current = _verifierMap;
  }, [verifierList]);
  const handleVerifierChange = useCallback((id: string) => {
    setSelectVerifierId(id);
    setIsExist(false);
  }, []);
  const checkValid = useCallback(async () => {
    // 1. check verifier valid
    const verifier = verifierMap.current?.[selectVerifierId!];
    if (!verifier) {
      message.error('Can not get the current verifier message');
      return false;
    }

    // fetch latest guardianList
    const _guardianList = await getGuardianList();
    // 2. check verifier exist
    const _verifierExist = _guardianList?.some((temp) => temp.verifierId === verifier.id);
    if (_verifierExist) {
      setIsExist(true);
      return false;
    }

    const _key = `${currentGuardian?.guardianIdentifier}&${selectVerifierId}`;
    const _guardian: UserGuardianStatus = {
      ...currentGuardian!,
      key: _key,
      verifier,
      verifierId: verifier.id,
    };
    curGuardian.current = _guardian;
    return true;
  }, [currentGuardian, getGuardianList, selectVerifierId]);
  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        if (isRemove) {
          await handleRemoveGuardian?.(approvalInfo);
        } else {
          await handleEditGuardian?.(curGuardian.current!, approvalInfo);
        }
      } catch (e) {
        errorTip(
          {
            errorFields: 'Handle Guardian',
            error: handleErrorMessage(e),
          },
          isErrorTip,
          onError,
        );
      } finally {
        setLoading(false);
      }
    },
    [handleEditGuardian, handleRemoveGuardian, isErrorTip, isRemove, onError],
  );
  const onConfirm = useCallback(async () => {
    const valid = await checkValid();
    if (valid) {
      setApprovalVisible(true);
    }
  }, [checkValid]);

  const removeLoginGuardians = useCallback(async () => {
    try {
      setLoading(true);
      await handleSetLoginGuardian();
      setIsRemove(true);
      setApprovalVisible(true);
    } catch (error) {
      errorTip(
        {
          errorFields: 'Unset Login Guardian',
          error: handleErrorMessage(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [handleSetLoginGuardian, isErrorTip, onError]);

  const onClickRemove = useCallback(() => {
    const isLoginAccountList = guardianList?.filter((item) => item.isLoginGuardian) || [];
    if (currentGuardian?.isLoginGuardian) {
      if (isLoginAccountList.length === 1) {
        CustomModal({
          type: 'info',
          content: <>{t('This guardian is the only login account and cannot be removed')}</>,
        });
      } else {
        CustomModal({
          type: 'confirm',
          okText: 'confirm',
          content: (
            <>{t('This guardian is set as a login account. Click "Confirm" to unset and remove this guardian')}</>
          ),
          onOk: removeLoginGuardians,
        });
      }
    } else {
      CustomModal({
        type: 'confirm',
        okText: 'Yes',
        cancelText: 'No',
        content: (
          <div className="portkey-ui-flex-column portkey-ui-remove-guardian-modal">
            <div className="remove-guardian-title">Are you sure you want to remove this guardian?</div>
            <div>Removing a guardian requires guardian approval</div>
          </div>
        ),
        onOk: () => {
          setIsRemove(true);
          setApprovalVisible(true);
        },
      });
    }
  }, [currentGuardian?.isLoginGuardian, guardianList, removeLoginGuardians, t]);

  return (
    <div className={clsx('portkey-ui-guardian-edit', 'portkey-ui-flex-column', className)}>
      {header}
      <div className="guardian-edit-body portkey-ui-flex-column portkey-ui-flex-1">
        <div className="input-item">
          <div className="guardian-edit-input-item-label">{`Guardian ${currentGuardian?.guardianType}`}</div>
          <div className="guardian-account guardian-edit-input-item-value portkey-ui-flex">
            <CustomSvg type={guardianIconMap[currentGuardian?.guardianType || 'Email']} />
            <GuardianAccountShow guardian={currentGuardian} />
          </div>
        </div>
        <div className="input-item">
          <p className="guardian-edit-input-item-label">{t('Verifier')}</p>
          <CommonSelect
            placeholder="Select Guardians Verifier"
            className="verifier-select, portkey-select-verifier-option-tip"
            value={selectVerifierId}
            onChange={handleVerifierChange}
            items={verifierSelectItems}
            customOptions={customSelectOption}
          />
          {isExist && <div className="guardian-edit-error-tip">{verifierExistTip}</div>}
        </div>
      </div>
      <div className="guardian-edit-footer">
        <div className="portkey-ui-flex-between guardian-add-btn-wrap">
          <Button className="guardian-btn guardian-btn-remove" onClick={onClickRemove}>
            {t('Remove')}
          </Button>
          <Button type="primary" className="guardian-btn " onClick={onConfirm} disabled={editBtnDisable}>
            {t('Send Request')}
          </Button>
        </div>
      </div>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={approvalVisible}
        onClose={() => setApprovalVisible(false)}>
        <GuardianApproval
          header={<BackHeader onBack={() => setApprovalVisible(false)} />}
          originChainId={originChainId}
          guardianList={guardianList?.filter((item) => item.key !== preGuardian?.key)}
          networkType={networkType}
          onConfirm={approvalSuccess}
          onError={onError}
          operationType={isRemove ? OperationTypeEnum.deleteGuardian : OperationTypeEnum.editGuardian}
        />
      </CommonBaseModal>
    </div>
  );
}

export default memo(GuardianEdit);
