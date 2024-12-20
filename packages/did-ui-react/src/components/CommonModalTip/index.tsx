import { useState } from 'react';
import CustomSvg from '../CustomSvg';
import CommonModal from '../CommonModal';
import CommonButton from '../CommonButton';
import './index.less';

export interface ICommonModalTip {
  title: string;
  content: string;
  className?: string;
}

export function CommonModalTip({ title, content, className }: ICommonModalTip) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CustomSvg type="help" onClick={() => setOpen(true)} className={className} />
      <CommonModal open={open} type="modal" className="portkey-ui-common-modal-tip">
        <div className="common-modal-tip">
          <div className="portkey-ui-flex-between-center">
            <div className="common-modal-tip-title">{title}</div>
            <CustomSvg type="Close" onClick={() => setOpen(false)} />
          </div>
          <div className="common-modal-tip-content">{content}</div>
          <CommonButton block type="primary" onClick={() => setOpen(false)}>{`OK`}</CommonButton>
        </div>
      </CommonModal>
    </>
  );
}
