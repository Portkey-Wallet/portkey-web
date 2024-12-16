import { Input } from 'antd';
import CustomSvg from '../../../CustomSvg';
import Loading from '../../../Loading';
import './index.less';

const { TextArea } = Input;

export enum ToAddressInputStep {
  Editable = 1,
  ReadOnly = 2,
}

interface IToAddressInputProps {
  step: ToAddressInputStep;
}

export default function ToAddressInput({ step = ToAddressInputStep.ReadOnly }: IToAddressInputProps) {
  return (
    <div className="portkey-ui-to-address-input-wrapper">
      <div className="portkey-ui-to-address-input-row">
        <span className="portkey-ui-to-address-input-row-label">To:</span>
        {step === ToAddressInputStep.Editable ? (
          <div className="portkey-ui-to-address-input-row-editable">
            <div className="portkey-ui-to-address-input-row-input-wrapper">
              <TextArea
                className="portkey-ui-to-address-input-row-input"
                placeholder="Address"
                autoSize={{ minRows: 1, maxRows: 2 }}
              />
            </div>
            <div className="portkey-ui-to-address-input-row-icons-wrapper">
              <CustomSvg type="Close3" />
              <Loading width={24} height={24} isDarkThemeWhiteLoading />
              {/* <CustomSvg className="portkey-ui-to-address-input-row-icon" type="Check" /> */}
              {/* <CustomSvg className="portkey-ui-to-address-input-row-icon" type="WarningInfoFilled" /> */}
              {/* <CustomSvg className="portkey-ui-to-address-input-row-icon" type="WarnRedBackground" /> */}
            </div>
          </div>
        ) : (
          <div className="portkey-ui-to-address-input-row-readonly">
            <span className="portkey-ui-to-address-input-row-readonly-address-text">0xD101...7A08</span>
            <CustomSvg type="EditThin" />
          </div>
        )}
      </div>
      <div className="portkey-ui-to-address-input-tip">
        <span className="portkey-ui-to-address-input-tip-text">Enter or </span>
        <span className="portkey-ui-to-address-input-tip-paste">paste a wallet address</span>
      </div>
    </div>
  );
}
