import clsx from 'clsx';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Switch } from 'antd';
import { AccountType, GuardiansApproved, ITransferLimitItem, OperationTypeEnum, VerifierItem } from '@portkey/services';
import { divDecimals, formatAmountShow, timesDecimals } from '../../utils/converter';
import './index.less';
import CustomSvg from '../CustomSvg';
import CommonButton from '../CommonButton';
import CommonBaseModal from '../CommonBaseModal';
import GuardianApproval from '../GuardianApproval';
import BackHeader from '../BackHeader';
import { getOperationDetails } from '../utils/operation.util';
import { ChainId } from '@portkey/types';
import { ELF_SYMBOL } from '../../constants/assets';
import { NetworkType, UserGuardianStatus } from '../../types';
import { did, errorTip, formatGuardianValue, handleErrorMessage, setLoading } from '../../utils';
import { sleep } from '@portkey/utils';
import { setTransferLimit } from '../../utils/sandboxUtil/setTransferLimit';
import { getVerifierList } from '../../utils/sandboxUtil/getVerifierList';
import { getChainInfo } from '../../hooks';
import { ITransferLimitItemWithRoute } from '../../types/transfer';

export interface TransferSettingsProps {
  className?: string;
  wrapperStyle?: React.CSSProperties;
  initData: ITransferLimitItemWithRoute;
  originChainId: ChainId;
  networkType: NetworkType;
  sandboxId?: string;
  caHash: string;
  onBack?: () => void;
  onSuccess?: (data: ITransferLimitItemWithRoute) => void;
}

export interface ITransferSettingsFormInit {
  singleLimit: string;
  dailyLimit: string;
  restricted: boolean;
}

export default function TransferSettingsMain({
  className,
  wrapperStyle,
  initData,
  originChainId,
  caHash,
  networkType,
  sandboxId,
  onSuccess,
  onBack,
}: TransferSettingsProps) {
  const [dailyLimit, setDailyLimit] = useState<string>();
  const [dailyLimitError, setDailyLimitError] = useState<string | undefined>();
  const [transactionLimit, setTransactionLimit] = useState<string | undefined>();
  const [transactionLimitError, setTransactionLimitError] = useState<string>();
  const [isEditLimitModalOpen, setIsEditLimitModalOpen] = useState(false);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [guardianList, setGuardianList] = useState<UserGuardianStatus[]>();
  const [limitsOn, setLimitOn] = useState(initData.restricted);
  const targetChainId = useMemo(() => initData.chainId || originChainId, [initData.chainId, originChainId]);
  const verifierMap = useRef<{ [x: string]: VerifierItem }>();
  const symbol = useMemo(() => initData.symbol || ELF_SYMBOL, [initData.symbol]);

  const getVerifierInfo = useCallback(async () => {
    try {
      const chainInfo = await getChainInfo(originChainId);
      const list = await getVerifierList({
        sandboxId,
        chainId: originChainId,
        rpcUrl: chainInfo?.endPoint,
        chainType: 'aelf',
        address: chainInfo?.caContractAddress,
      });
      const _verifierMap: { [x: string]: VerifierItem } = {};
      list.forEach((item: VerifierItem) => {
        _verifierMap[item.id] = item;
      }, []);
      verifierMap.current = _verifierMap;
    } catch (error) {
      errorTip(
        {
          errorFields: 'getVerifierServers',
          error: handleErrorMessage(error),
        },
        true,
      );
    } finally {
      setLoading(false);
    }
  }, [originChainId, sandboxId]);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    setLoading(true);
    await getVerifierInfo();
    await getGuardianList();
    setLoading(false);
  };

  const onLimitChange = async () => {
    if (limitsOn) {
      setDailyLimit(undefined);
      setTransactionLimit(undefined);
      await getGuardianList();
      setIsGuardianModalOpen(true);
    } else {
      setIsEditLimitModalOpen(true);
    }
  };

  const limitCalFunc = useCallback(() => {
    const transDailyLimit = Number(dailyLimit) > 0 ? String(timesDecimals(dailyLimit, initData.decimals)) : '-1';
    const transSingleLimit = Number(transactionLimit)
      ? String(timesDecimals(transactionLimit, initData.decimals))
      : '-1';
    return { transDailyLimit, transSingleLimit };
  }, [dailyLimit, initData.decimals, transactionLimit]);

  const getGuardianList = useCallback(async () => {
    try {
      const payload = await did.getHolderInfo({
        caHash: caHash,
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
      _guardianList.reverse();
      setGuardianList(_guardianList);
      return _guardianList;
    } catch (error) {
      errorTip(
        {
          errorFields: 'GetGuardianList',
          error: handleErrorMessage(error),
        },
        true,
      );
    } finally {
      setLoading(false);
    }
  }, [caHash, originChainId]);

  const approvalSuccess = useCallback(
    async (approvalInfo: GuardiansApproved[]) => {
      try {
        setLoading(true);
        const guardiansApproved = formatGuardianValue(approvalInfo);
        const { transDailyLimit, transSingleLimit } = limitCalFunc() || {};

        await setTransferLimit({
          params: {
            dailyLimit: transDailyLimit,
            singleLimit: transSingleLimit,
            symbol,
            guardiansApproved,
          },
          targetChainId,
          sandboxId,
          caHash: caHash || '',
        });

        // Guarantee that the contract can query the latest data
        await sleep(1000);

        const params: ITransferLimitItemWithRoute = {
          dailyLimit: transDailyLimit,
          singleLimit: transSingleLimit,
          chainId: targetChainId,
          symbol: symbol,
          decimals: initData.decimals || 8,
          restricted: limitsOn,
          businessFrom: initData.businessFrom,
          chainImageUrl: initData.chainImageUrl,
          imageUrl: initData.imageUrl,
          displayChainName: initData.displayChainName,
        };

        setLimitOn(Number(transDailyLimit) > 0 ? true : false);
        onSuccess?.(params);
      } catch (e) {
        setLimitOn(initData.restricted);

        console.error('setTransferLimit===', e);
        errorTip(
          {
            errorFields: 'Handle Add Guardian',
            error: handleErrorMessage(e),
          },
          true,
        );
      } finally {
        setLoading(false);
        setIsGuardianModalOpen(false);
      }
    },
    [
      caHash,
      initData.businessFrom,
      initData.chainImageUrl,
      initData.decimals,
      initData.displayChainName,
      initData.imageUrl,
      initData.restricted,
      limitCalFunc,
      limitsOn,
      onSuccess,
      sandboxId,
      symbol,
      targetChainId,
    ],
  );

  const onEditClick = async () => {
    await getGuardianList();
    if (Number(initData.dailyLimit) >= 0 && Number(initData.singleLimit) >= 0) {
      setDailyLimit(String(divDecimals(initData.dailyLimit, initData.decimals)) || '');
      setTransactionLimit(String(divDecimals(initData.singleLimit, initData.decimals)) || '');
    }
    setIsEditLimitModalOpen(true);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    if (id === 'transactionLimit') {
      setTransactionLimit(e.target.value);
      setTransactionLimitError(undefined);
    } else {
      setDailyLimit(e.target.value);
      setDailyLimitError(undefined);
    }
  };

  const onUpdateLimitClick = async () => {
    let errorCheck = false;
    if (isNaN(Number(transactionLimit))) {
      errorCheck = true;
      setTransactionLimitError('Please enter a positive whole number');
    }

    if (isNaN(Number(dailyLimit))) {
      errorCheck = true;
      setDailyLimitError('Please enter a positive whole number');
    }

    if (Number(transactionLimit) > Number(dailyLimit)) {
      errorCheck = true;
      setTransactionLimitError('Cannot exceed the daily limit');
    }

    if (!errorCheck) {
      await getGuardianList();
      setIsEditLimitModalOpen(false);
      setIsGuardianModalOpen(true);
    }
  };

  const resetForm = () => {
    setDailyLimitError(undefined);
    setTransactionLimitError(undefined);
  };

  console.log('originChainId', originChainId);
  console.log('networkType', networkType);
  console.log('targetChainId', targetChainId);
  return (
    <>
      <div style={wrapperStyle} className={clsx('portkey-ui-transfer-settings-wrapper', className)}>
        <div className="transfer-settings-nav">
          <div className="left-icon" onClick={onBack}>
            <CustomSvg type="ArrowLeft" fillColor="var(--sds-color-icon-default-default)" />
          </div>
          <div className="transfer-settings-header">
            <p className="symbol">Transaction Limits</p>
          </div>
        </div>
        <div className="transfer-settings-content">
          <div className="transfer-settings-token">
            <img className="token-img" src={initData.imageUrl} />
            <span className="token-name">{initData.symbol}</span>
            <span className="token-network">{`${initData.displayChainName} ${networkType}`}</span>
          </div>
          <div className="transfer-settings-toggle">
            <div className="option">
              <span className="label">Transaction limits</span>
              <Switch defaultChecked onChange={onLimitChange} checked={limitsOn} />
            </div>
            <span className="description">
              {limitsOn
                ? 'Transactions over the limit require you to modify the limit settings with guardian approval.'
                : 'No transaction limit.'}
            </span>
          </div>
          {limitsOn && (
            <div className="transfer-limt-content">
              <div className="row">
                <span className="label">Limit per transaction</span>
                <span className="value">
                  {formatAmountShow(divDecimals(initData.singleLimit, initData.decimals))} {initData.symbol}
                </span>
              </div>
              <div className="row">
                <span className="label">Daily limit</span>
                <span className="value">
                  {formatAmountShow(divDecimals(initData.dailyLimit, initData.decimals))} {initData.symbol}
                </span>
              </div>
            </div>
          )}
          <div className="transfer-button-wrapper">
            <CommonButton className="item-button" type="primary" onClick={onEditClick}>
              Edit
            </CommonButton>
          </div>
        </div>
      </div>
      <CommonBaseModal
        className="portkey-ui-modal-approval"
        open={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}>
        <GuardianApproval
          header={<BackHeader onBack={() => setIsGuardianModalOpen(false)} />}
          originChainId={originChainId}
          networkType={networkType}
          targetChainId={targetChainId}
          guardianList={guardianList}
          onConfirm={approvalSuccess}
          operationType={OperationTypeEnum.modifyTransferLimit}
          caHash={caHash}
          operationDetails={getOperationDetails(OperationTypeEnum.modifyTransferLimit, {
            symbol: initData.symbol,
            singleLimit: limitCalFunc().transSingleLimit,
            dailyLimit: limitCalFunc().transDailyLimit,
          })}
        />
      </CommonBaseModal>
      <CommonBaseModal
        className="portkey-ui-modal-edit-limit"
        open={isEditLimitModalOpen}
        onClose={() => {
          resetForm();
          setIsEditLimitModalOpen(false);
        }}
        wrapClassName="portkey-ui-modal-edit-limit-content"
        height="max-content">
        <div className="limit-detail-header">
          <span className="title">Edit transaction limits</span>
          <CustomSvg
            type="Close2"
            fillColor="var(--portkey-ui-text-primary)"
            onClick={() => {
              setIsEditLimitModalOpen(false);
              resetForm();
            }}
          />
        </div>
        <div className="limit-detail-body">
          <div className="row">
            <span>Limit per transaction</span>
            <div
              className={clsx('input-container', {
                error: transactionLimitError,
              })}>
              <input
                className="input"
                value={transactionLimit || ''}
                onChange={(e) => onInputChange(e, 'transactionLimit')}
              />
              {transactionLimit && (
                <div
                  className="close-icon-wrapper"
                  onClick={() => {
                    setTransactionLimit(undefined);
                    setTransactionLimitError(undefined);
                  }}>
                  <CustomSvg className="close-icon" type="Close2" fillColor="var(--portkey-ui-text-primary)" />
                </div>
              )}
              <span className="symbol">{initData.symbol}</span>
            </div>
            {transactionLimitError && <span className="error">{transactionLimitError}</span>}
          </div>
          <div className="row">
            <span>Daily limit</span>
            <div
              className={clsx('input-container', {
                error: dailyLimitError,
              })}>
              <input className="input" value={dailyLimit || ''} onChange={(e) => onInputChange(e, 'dailyLimit')} />
              {dailyLimit && (
                <div
                  className="close-icon-wrapper"
                  onClick={() => {
                    setDailyLimit(undefined);
                    setDailyLimitError(undefined);
                  }}>
                  <CustomSvg className="close-icon" type="Close2" fillColor="var(--portkey-ui-text-primary)" />
                </div>
              )}
              <span className="symbol">{initData.symbol}</span>
            </div>
            {dailyLimitError && <span className="error">{dailyLimitError}</span>}
          </div>
        </div>
        <div className="limit-detail-footer">
          <CommonButton className="item-button" type="primary" onClick={onUpdateLimitClick}>
            Verify with guardian
          </CommonButton>
        </div>
      </CommonBaseModal>
    </>
  );
}
