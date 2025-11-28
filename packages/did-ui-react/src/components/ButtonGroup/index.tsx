import CommonButton, { CommonButtonType } from '../CommonButton';
import clsx from 'clsx';
import './index.less';

export interface IButtonGroup {
  className?: string;
  buttons: {
    content: string;
    onClick: () => void;
    type: CommonButtonType;
  }[];
  type: 'row' | 'col';
}

export default function ButtonGroup({ className, buttons, type }: IButtonGroup) {
  const [b1, b2] = buttons;
  return buttons.length < 2 ? null : (
    <div
      className={clsx(
        type === 'row' ? 'portkey-ui-flex-row-center' : 'portkey-ui-flex-column-center',
        'portkey-ui-button-group',
        className,
      )}>
      <CommonButton type={b1.type} onClick={b1.onClick} block>
        {b1.content}
      </CommonButton>
      <CommonButton type={b2.type} onClick={b2.onClick} block>
        {b2.content}
      </CommonButton>
    </div>
  );
}
