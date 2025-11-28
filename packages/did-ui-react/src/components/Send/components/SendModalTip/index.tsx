import { useMemo } from 'react';
import CommonButton, { CommonButtonType } from '../../../CommonButton';
import CommonModal from '../../../CommonModal';
import CustomSvg from '../../../CustomSvg';
import ButtonGroup from '../../../ButtonGroup';
import './index.less';

export interface ITipContentProps {
  title: string;
  content: string;
  onClose: () => void;
}

export function TipContent({ title, content, onClose }: ITipContentProps) {
  return (
    <div className="portkey-ui-send-modal-content portkey-ui-flex-column">
      <div className="tip-icon portkey-ui-flex-between-center">
        {/* TODO-SA  fillColor*/}
        <CustomSvg fillColor="#fff" type="Warning" />
        <CustomSvg type="Close" onClick={onClose} />
      </div>
      <div className="tip-title">{title}</div>
      <div className="tip-content">{content}</div>
    </div>
  );
}

export type ButtonGroupType = 'row' | 'col';

export interface ISendModalTipProps extends ITipContentProps {
  open: boolean;
  buttons: {
    content: string;
    onClick: () => void;
    type: CommonButtonType;
  }[];
  buttonGroupType?: ButtonGroupType;
}

export default function SendModalTip({
  open,
  title,
  content,
  buttons,
  buttonGroupType = 'row',
  onClose,
}: ISendModalTipProps) {
  const [b1] = buttons;
  const renderButton = useMemo(() => {
    return buttons.length === 1 ? (
      <CommonButton type={b1.type} onClick={b1.onClick} block>
        {b1.content}
      </CommonButton>
    ) : (
      <ButtonGroup type={buttonGroupType} buttons={buttons} />
    );
  }, [b1, buttonGroupType, buttons]);
  return (
    <CommonModal open={open}>
      <div className="portkey-ui-send-modal-tip">
        <TipContent title={title} content={content} onClose={onClose} />
        <div className="portkey-ui-send-modal-button">{renderButton}</div>
      </div>
    </CommonModal>
  );
}
