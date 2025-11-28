import React from 'react';
import PortkeyStyleProvider from '../PortkeyStyleProvider';
import SetAllowanceMain, { SetAllowanceProps } from './index.component';

export default function SetAllowance(props: SetAllowanceProps) {
  return (
    <PortkeyStyleProvider>
      <SetAllowanceMain {...props} />
    </PortkeyStyleProvider>
  );
}
