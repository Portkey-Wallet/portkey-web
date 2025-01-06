import { Button } from 'antd';
import { useCallback } from 'react';
import { useModalDispatch } from '../../context/useModal/hooks';
import { basicModalView } from '../../context/useModal/actions';

export default function DialogExample() {
  const dispatch = useModalDispatch();
  const onOpen = useCallback(() => {
    dispatch(basicModalView.setWalletDialog.actions(true));
  }, [dispatch]);
  return (
    <div>
      <Button onClick={onOpen}>Open Dialog</Button>
    </div>
  );
}
