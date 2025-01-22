import './index.less';
import CustomSvg, { CustomSvgType } from '../../../CustomSvg';
import CommonModalTip from '../../../CommonModalTip';

interface ILabel {
  text: string;
  tooltipProps?: {
    title: string;
    content: string;
  };
}

interface IValue {
  text?: string;
  content?: React.ReactNode;
  leftImageUrl?: string;
  leftSvgName?: CustomSvgType;
  textBelow?: string;
}

interface ICommonInfoRowProps {
  label: ILabel;
  value: IValue;
}

export const CommonInfoRow = ({ label, value }: ICommonInfoRowProps) => {
  return (
    <div className="common-info-row">
      <div className="common-info-label-column-wrap">
        <div className="common-info-label-wrap">{label.text}</div>

        {label.tooltipProps && <CommonModalTip modalClassName="common-info-row-tip-modal" {...label.tooltipProps} />}
      </div>

      <div className="common-info-value-column-wrap">
        {value.content || (
          <>
            <div className="common-info-value-wrap">
              {value.leftImageUrl ? (
                <img className="common-info-value-image" src={value.leftImageUrl} />
              ) : (
                value.leftSvgName && <CustomSvg className="common-info-value-image" type={value.leftSvgName} />
              )}

              <div className="common-info-value">{value.text}</div>
            </div>

            {value.textBelow && <div className="common-info-value-below">{value.textBelow}</div>}
          </>
        )}
      </div>
    </div>
  );
};
