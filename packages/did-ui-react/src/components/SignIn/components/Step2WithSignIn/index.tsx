import type { ChainType } from '@portkey/types';
import { VerifierItem } from '@portkey/did';
import { ChainInfo, GuardiansApproved } from '@portkey/services';
import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { contractErrorHandler, did, errorTip, setLoading } from '../../../../utils';
import BackHeader from '../../../BackHeader';
import GuardianApproval from '../../../GuardianApproval/index.component';
import { BaseGuardianItem, VerifyStatus, OnErrorFunc } from '../../../../types';
import { getVerifierList } from '../../../../utils/sandboxUtil/getVerifierList';
import { SignInSuccess } from '../../../types';
import qs from 'query-string';
import './index.less';

interface Step2WithSignInProps {
  sandboxId?: string;
  chainInfo?: ChainInfo;
  chainType?: ChainType;
  isErrorTip?: boolean;
  guardianList?: BaseGuardianItem[];
  guardianIdentifierInfo: SignInSuccess;
  approvedList?: GuardiansApproved[];
  onFinish?: (guardianList: GuardiansApproved[]) => void;
  onCancel?: () => void;
  onError?: OnErrorFunc;
}

function Step2WithSignIn({
  sandboxId,
  chainType,
  chainInfo,
  isErrorTip,
  approvedList,
  guardianIdentifierInfo,
  onFinish,
  onCancel,
  onError,
}: Step2WithSignInProps) {
  const [guardianList, setGuardianList] = useState<BaseGuardianItem[] | undefined>();

  const getVerifierListHandler = useCallback(async () => {
    if (!chainInfo) return;
    const list = await getVerifierList({
      sandboxId,
      chainId: guardianIdentifierInfo.chainId,
      rpcUrl: chainInfo.endPoint,
      chainType: chainType ?? 'aelf',
      address: chainInfo.caContractAddress,
    });
    return list;
  }, [chainInfo, chainType, guardianIdentifierInfo.chainId, sandboxId]);

  const getGuardianList = useCallback(async () => {
    try {
      setLoading(true);
      const verifierList = await getVerifierListHandler();
      if (!verifierList) return;
      const verifierMap: { [x: string]: VerifierItem } = {};
      verifierList?.forEach((item) => {
        verifierMap[item.id] = item;
      });

      const payload = await did.getHolderInfo({
        loginGuardianIdentifier: guardianIdentifierInfo.identifier.replaceAll(/\s/g, ''),
        chainId: guardianIdentifierInfo.chainId,
      });

      const { guardians } = payload?.guardianList ?? { guardians: [] };
      const _guardianAccounts = [...guardians];

      const guardiansList = _guardianAccounts.map((_guardianAccount) => {
        const key = `${_guardianAccount.guardianIdentifier}&${_guardianAccount.verifierId}`;

        const guardianAccount = _guardianAccount.guardianIdentifier || _guardianAccount.identifierHash;
        const verifier = verifierMap?.[_guardianAccount.verifierId];

        const _guardian: BaseGuardianItem = {
          ..._guardianAccount,
          key,
          isLoginAccount: _guardianAccount.isLoginGuardian,
          verifier,
          identifier: guardianAccount,
          guardianType: _guardianAccount.type,
        };
        if (guardianIdentifierInfo.authenticationInfo)
          _guardian.accessToken =
            guardianIdentifierInfo.authenticationInfo?.googleAccessToken ||
            guardianIdentifierInfo.authenticationInfo?.appleIdToken;
        return _guardian;
      });

      setGuardianList(guardiansList);
    } catch (error) {
      errorTip(
        {
          errorFields: 'GuardianApproval',
          error: contractErrorHandler(error),
        },
        isErrorTip,
        onError,
      );
    } finally {
      setLoading(false);
    }
  }, [getVerifierListHandler, guardianIdentifierInfo, isErrorTip, onError]);

  useEffect(() => {
    getGuardianList();
  }, [getGuardianList]);

  const _guardianList = useMemo(() => {
    if (!approvedList) return guardianList;
    const approvedMap: { [x: string]: GuardiansApproved } = {};
    approvedList.forEach((item) => {
      approvedMap[`${item.identifier}&${item.verifierId}`] = item;
    });
    return guardianList?.map((guardian) => {
      const approvedItem = approvedMap[`${guardian.identifier}&${guardian.verifier?.id}`];
      if (approvedItem)
        return {
          ...guardian,
          status: VerifyStatus.Verified,
          verificationDoc: approvedItem.verificationDoc,
          signature: approvedItem.signature,
        };
      return guardian;
    });
  }, [approvedList, guardianList]);

  const [appleIdToken, setAppleIdToken] = useState<string>();

  useEffect(() => {
    const { id_token } = qs.parse(location.search);
    if (id_token && typeof id_token === 'string') {
      setAppleIdToken(id_token);
    }
  }, []);

  const ref = useRef<any>();

  const _onCancel = useCallback(() => {
    ref?.current?.clearStorage();
    history.pushState(null, '', `${location.pathname}`);
    onCancel?.();
  }, [onCancel]);

  const onConfirm = useCallback(
    (guardianList: GuardiansApproved[]) => {
      history.pushState(null, '', `${location.pathname}`);
      onFinish?.(guardianList);
    },
    [onFinish],
  );
  return (
    <div className="step-page-wrapper step2-sign-in-wrapper">
      <GuardianApproval
        ref={ref}
        chainId={guardianIdentifierInfo.chainId}
        header={<BackHeader onBack={_onCancel} />}
        appleIdToken={appleIdToken}
        guardianList={_guardianList}
        isErrorTip={isErrorTip}
        onConfirm={onConfirm}
        onError={onError}
      />
    </div>
  );
}

export default memo(Step2WithSignIn);
