import CommonButton from '../CommonButton';
import { CommonModalTip } from '../CommonModalTip';
import CustomSvg from '../CustomSvg';
import './index.less';

export default function SendReceivePreview() {
  return (
    <div className="portkey-ui-send-receive-preview portkey-ui-flex-column">
      <div className="portkey-ui-flex-between-center preview-header">
        <CustomSvg type="ArrowLeft" />
        <div>{`Preview`}</div>
        <CustomSvg type="help" />
      </div>
      <div className="portkey-ui-flex-1 preview-content">
        <div className="portkey-ui-flex-column-center">
          <CustomSvg type="SendActivity" />
          <div className="amount-show">{`1 ELF`}</div>
          <div className="usd-show">{`$0.37`}</div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>{`To`}</div>
          <div className="value-show">{`0xD101...7A08`}</div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>{`Destination network`}</div>
          <div className="value-show portkey-ui-flex-row-center gap-4">
            <CustomSvg type="ELF" />
            {`aelf dAppChain`}
          </div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div>
            <div className="portkey-ui-flex-row-center gap-4">
              {`Estimated network fee`}
              <CommonModalTip title="" content="" />
            </div>
            <div className="below-show text-color-danger">{`Not enough ELF`}</div>
          </div>
          <div className="value-show">
            <div className="text-color-danger">{`0 ELF`}</div>
            <div className="below-show text-color-danger">{`$0`}</div>
          </div>
        </div>
        <div className="portkey-ui-flex-between-center content-row-info">
          <div className="portkey-ui-flex-row-center gap-4">
            {`Estimated network fee`}
            <CommonModalTip title="" content="" />
          </div>
          <div className="value-show">
            <div>{`0 ELF`}</div>
            <div className="below-show">{`$0`}</div>
          </div>
        </div>
        <div className="portkey-ui-flex-center powered-by gap-4">
          <div>{`Powered by`}</div>
          <CustomSvg type="pb-ebridge" />
          {/* <CustomSvg type="pb-eTransfer" /> */}
        </div>
      </div>
      <div className="preview-footer">
        <CommonButton block type="primary">{`Send`}</CommonButton>
      </div>
    </div>
  );
}
