import React from 'react';
import Portal from '@rc-component/portal';
import { GetContainer } from '@rc-component/portal/es/Portal';

interface ContainerProps {
  children?: React.ReactNode;
  getContainer?: GetContainer;
}

export default function Container({ getContainer, children }: ContainerProps) {
  return getContainer ? (
    <Portal open autoLock={false} getContainer={getContainer}>
      {children}
    </Portal>
  ) : (
    <>{children}</>
  );
}
