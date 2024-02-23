import { useEffect } from 'react';
import AreaCodeInner from '../AreaCodeInner';
import { AreaCodeProps } from '../index';
import './index.less';

export default function AreaCodeModal({ open, value, areaList, onChange, onCancel }: AreaCodeProps) {
  useEffect(() => {
    if (!open) return;
    const listener = () => onCancel?.();
    window.addEventListener('click', listener);
    return () => {
      window.removeEventListener('click', listener);
    };
  }, [onCancel, open]);

  return open ? (
    <AreaCodeInner className="area-code-modal-wrapper" value={value} areaList={areaList} onChange={onChange} />
  ) : null;
}
