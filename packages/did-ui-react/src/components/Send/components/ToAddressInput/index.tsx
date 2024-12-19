import { Dispatch, forwardRef, SetStateAction, useCallback } from 'react';
import { Input } from 'antd';
import CustomSvg from '../../../CustomSvg';
import Loading, { LoadingColor } from '../../../Loading';
import './index.less';
import { ToAccount } from '../../index.components';

export enum InputStepEnum {
  input = 'input',
  show = 'show',
}

export interface IToAddressInputRef {
  onInput: (address: string) => void;
}

export interface IToAddressInput {
  toAccount: ToAccount;
  setToAccount: Dispatch<SetStateAction<ToAccount>>;
}

export const ToAddressInputRef = forwardRef<IToAddressInputRef, IToAddressInput>(function ({
  toAccount,
  setToAccount,
}) {
  const changeValue = useCallback(
    (v: string) => {
      setToAccount((pre) => ({ ...pre, address: v.trim() }));
    },
    [setToAccount],
  );

  const clearValue = useCallback(() => {
    setToAccount({ address: '' });
  }, [setToAccount]);

  const pastValue = useCallback(async () => {
    try {
      const v = await navigator.clipboard.readText();
      !!v.trim() && setToAccount({ address: v });
    } catch (error) {
      console.warn('pastValue err');
    }
  }, [setToAccount]);

  const renderAddressShow = useCallback(() => {
    return (
      <div className="flex-row-center address-show">
        <div className="label">{`To: `}</div>
        <div className="flex-row-center">
          <span>
            {`Olivia Ong`}
            <span className="gary-color">{`(ELF_22FM...xhWb_tDVV)`}</span>
          </span>
          {/* <span>{`ELF_22FM...xhWb_AELF`}</span> */}
        </div>
      </div>
    );
  }, []);

  // TODO-SA
  console.log(renderAddressShow);
  const renderAddressInput = useCallback(() => {
    return (
      <div className="flex-between-center address-input">
        <div className="label">{`To:`}</div>
        <div className="flex-1 flex-row-center input-content">
          <Input.TextArea
            className="address-textarea"
            placeholder="Address"
            autoSize={{ minRows: 1, maxRows: 3 }}
            value={toAccount.address}
            onChange={(e) => changeValue(e.target.value)}
          />
        </div>
        <div className="flex-row-center input-icon">
          <CustomSvg className="cursor-pointer" type="Close3" onClick={clearValue} />
          <Loading width={24} height={24} isDarkThemeWhiteLoading />
          <CustomSvg className="status-icon" type="WarningInfoFilled" />
          {/* <CustomSvg className="portkey-ui-to-address-input-row-icon" type="Check" /> */}
        </div>
      </div>
    );
  }, [changeValue, clearValue, toAccount.address]);

  return (
    <div className="to-address-input-wrap">
      <div className="address-input-container">{renderAddressInput()}</div>
      <div className="paste-container">
        <span className="show-text">{`Enter or `}</span>
        <span className="paste-text cursor-pointer" onClick={pastValue}>{`paste a wallet address`}</span>
      </div>
    </div>
  );
});

export default ToAddressInputRef;
