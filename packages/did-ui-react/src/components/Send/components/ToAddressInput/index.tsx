import { Dispatch, forwardRef, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from 'antd';
import CustomSvg from '../../../CustomSvg';
import Loading from '../../../Loading';
import { ToAccount } from '../../index.components';
import {
  did,
  formatStr2EllipsisStr,
  getAddressChainId,
  getAelfAddress,
  isCrossChain,
  isDIDAelfAddress,
  isSameAddresses,
} from '../../../../utils';
import { IAssetToken } from '@portkey/services';
import { INftInfoType } from '@portkey/types';
import { Warning1Arr, WarningKey } from '../../../../constants/error';
import { useCheckSuffix, useDefaultToken } from '../../../../hooks/assets';
import { useDebounceCallback } from '../../../../hooks/debounce';
import { INetworkItem } from '../SelectNetwork';
import clsx from 'clsx';
import { MAIN_CHAIN_ID } from '../../../../constants/network';
import './index.less';

export enum InputStepEnum {
  input = 'input',
  show = 'show',
}

export enum SendAssetTypeEnum {
  token = 'token',
  nft = 'nft',
}

export interface IToAddressInputRef {
  onInput: (address: string) => void;
}

export interface IToAddressInput {
  sendType: SendAssetTypeEnum;
  toAccount: ToAccount;
  setToAccount: Dispatch<SetStateAction<ToAccount>>;
  step: InputStepEnum;
  setStep: (step: InputStepEnum) => void;
  selectedToken?: IAssetToken | INftInfoType;
  caAddress: string;
  warning: WarningKey | undefined;
  checkFinish: boolean;
  setWarning: Dispatch<SetStateAction<WarningKey | undefined>>;
  setCheckFinish: Dispatch<SetStateAction<boolean>>;
  setSendAmount: Dispatch<SetStateAction<string>>;
  setSendUSDAmount: Dispatch<SetStateAction<string>>;
  setChainList: Dispatch<SetStateAction<INetworkItem[]>>;
}

export const ToAddressInputRef = forwardRef<IToAddressInputRef, IToAddressInput>(function ({
  toAccount,
  setToAccount,
  step = InputStepEnum.input,
  selectedToken,
  caAddress,
  sendType,
  warning,
  checkFinish,
  setStep,
  setWarning,
  setCheckFinish,
  setSendAmount,
  setSendUSDAmount,
  setChainList,
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedPass, setCheckedPass] = useState(false);
  const isValidChainId = useCheckSuffix();
  const defaultToken = useDefaultToken();
  const isDangerWarning = useMemo(() => warning && Warning1Arr.includes(warning), [warning]);

  const changeValue = useCallback(
    (v: string) => {
      setToAccount((pre) => ({ ...pre, address: v.trim() }));
    },
    [setToAccount],
  );

  const clearValue = useCallback(() => {
    setToAccount({ address: '' });
    setStep(InputStepEnum.input);
    setSendAmount('');
    setSendUSDAmount('');
    setWarning(undefined);
  }, [setSendAmount, setSendUSDAmount, setStep, setToAccount, setWarning]);

  const onClickEdit = useCallback(() => {
    setStep(InputStepEnum.input);
    setCheckFinish(true);
    setCheckedPass(true);
    // changeValue(toAccount.address);
    // await sleep(10);
    // setToAccount((pre: any) => ({ ...pre, name: '' }));
  }, [setCheckFinish, setStep]);

  const pastValue = useCallback(async () => {
    try {
      const v = await navigator.clipboard.readText();
      !!v.trim() && setToAccount({ address: v });
    } catch (error) {
      console.warn('pastValue err');
    }
  }, [setToAccount]);

  const checkAddressByFE = useCallback(
    (v: string) => {
      if (!isDIDAelfAddress(v)) {
        return false;
      }

      // include chainId
      if (v.includes('_')) {
        const suffix = getAddressChainId(v, selectedToken?.chainId);

        // same address
        if (isSameAddresses(getAelfAddress(caAddress), getAelfAddress(v)) && suffix === selectedToken?.chainId) {
          setCheckedPass(false);
          setWarning(WarningKey.SAME_ADDRESS);
        } else if (!isValidChainId(suffix)) {
          // invalid chainId
          setCheckedPass(false);
          setWarning(WarningKey.INVALID_ADDRESS);
        } else if (isCrossChain(v, selectedToken?.chainId || MAIN_CHAIN_ID)) {
          // cross chain
          setCheckedPass(false);
          setWarning(WarningKey.CROSS_CHAIN);
        } else {
          setWarning(undefined);
          setCheckedPass(true);
        }
      } else {
        const isSameAddress = isSameAddresses(getAelfAddress(caAddress) || '', v);
        // same address
        if (
          selectedToken?.chainId === MAIN_CHAIN_ID &&
          !isSameAddress &&
          selectedToken?.symbol === defaultToken.symbol
        ) {
          setCheckedPass(false);
          setWarning(WarningKey.MAIN_CHAIN_TO_NO_AFFIX_ADDRESS_ELF);
        } else if (
          selectedToken?.chainId === MAIN_CHAIN_ID &&
          !isSameAddress &&
          selectedToken?.symbol !== defaultToken.symbol
        ) {
          setCheckedPass(true);
        } else if (selectedToken?.chainId === MAIN_CHAIN_ID && isSameAddress) {
          setCheckedPass(false);
          setWarning(WarningKey.SAME_ADDRESS);
        } else if (!isSameAddress && selectedToken?.symbol !== defaultToken.symbol) {
          setCheckedPass(true);
          // same chain transfer
          setToAccount((pre: any) => ({ ...pre, chainId: selectedToken?.chainId }));
        } else {
          setCheckedPass(false);
          setWarning(WarningKey.DAPP_CHAIN_TO_NO_AFFIX_ADDRESS_ELF);
        }
      }
      setCheckFinish(true);
      return true;
    },
    [
      caAddress,
      defaultToken.symbol,
      isValidChainId,
      selectedToken?.chainId,
      selectedToken?.symbol,
      setCheckFinish,
      setToAccount,
      setWarning,
    ],
  );

  const getNetworkList = useCallback(
    async (toAddress: string) => {
      if (!toAddress) {
        setWarning(undefined);
        setIsChecking(false);
        setCheckFinish(true);
        return;
      }

      try {
        setIsChecking(true);
        const { data, code } = await did.services.send.getSendNetworkList({
          symbol: selectedToken?.symbol || '',
          chainId: selectedToken?.chainId || 'AELF',
          toAddress,
        });

        if (code === '40001') {
          setWarning(WarningKey.INVALID_ADDRESS);
        } else {
          setCheckedPass(true);
          setChainList(data.networkList);
          setWarning(WarningKey.MAKE_SURE_SUPPORT_PLATFORM);
        }
      } catch (error) {
        console.log('getNetworkList err', error);
        setWarning(WarningKey.INVALID_ADDRESS);
      } finally {
        setIsChecking(false);
        setCheckFinish(true);
      }
    },
    [selectedToken?.chainId, selectedToken?.symbol, setChainList, setCheckFinish, setWarning],
  );

  const checkAddress = useDebounceCallback(async () => {
    const FEPass = checkAddressByFE(toAccount.address);

    // when send nft other chain is not support
    if (!FEPass && sendType === SendAssetTypeEnum.nft && !!toAccount.address) {
      setCheckFinish(true);
      return setWarning(WarningKey.INVALID_ADDRESS);
    }
    if (!FEPass) {
      await getNetworkList(toAccount.address);
    }
  }, [checkAddressByFE, getNetworkList, toAccount.address, sendType, setCheckFinish, setWarning]);

  useEffect(() => {
    checkAddress();
  }, [checkAddress, checkAddressByFE, getNetworkList, sendType, setCheckFinish, setWarning]);

  const renderAddressShow = useMemo(() => {
    return (
      <div className="portkey-ui-flex-row-center address-show">
        <div className="label">{`To: `}</div>
        <div className="portkey-ui-flex-row-center">
          <span>{formatStr2EllipsisStr(toAccount?.address, [8, 8])}</span>
          <CustomSvg className="edit-thin-icon cursor-pointer" type="EditThin" onClick={onClickEdit} />
        </div>
      </div>
    );
  }, [onClickEdit, toAccount?.address]);

  const renderAddressInput = useMemo(() => {
    return (
      <div className="portkey-ui-flex-between-center address-input">
        <div className="label">{`To:`}</div>
        <div className="portkey-ui-flex-1 portkey-ui-flex-row-center input-content">
          <Input.TextArea
            className="address-textarea"
            placeholder="Address"
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={toAccount.address}
            onChange={(e) => changeValue(e.target.value)}
          />
        </div>
        <div className="portkey-ui-flex-row-center input-icon">
          {toAccount.address && !isChecking && (
            <CustomSvg className="cursor-pointer" type="Close3" onClick={clearValue} />
          )}
          {isChecking && <Loading width={24} height={24} isDarkThemeWhiteLoading />}
          {toAccount.address && !isChecking && checkFinish && !checkedPass && (
            <CustomSvg className={clsx('status-icon', isDangerWarning && 'danger-warning')} type="WarningInfoFilled" />
          )}
          {toAccount.address && !isChecking && checkFinish && checkedPass && (
            <CustomSvg className="portkey-ui-to-address-input-row-icon" type="Check" />
          )}
        </div>
      </div>
    );
  }, [toAccount.address, isChecking, clearValue, checkFinish, checkedPass, isDangerWarning, changeValue]);

  return (
    <div className="to-address-input-wrap">
      <div className="address-input-container">
        {step === InputStepEnum.input ? renderAddressInput : renderAddressShow}
      </div>
      <div className="paste-container">
        <span className="show-text">{`Enter or `}</span>
        <span className="paste-text cursor-pointer" onClick={pastValue}>{`paste a wallet address`}</span>
      </div>
    </div>
  );
});

export default ToAddressInputRef;
