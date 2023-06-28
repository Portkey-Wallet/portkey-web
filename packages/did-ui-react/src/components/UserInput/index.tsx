import PortkeyStyleProvider from '../PortkeyStyleProvider';
import UserInputPropsCom from './index.component';
import type { UserInputProps } from './index.component';

export default function UserInput(props?: UserInputProps) {
  return (
    <PortkeyStyleProvider>
      <UserInputPropsCom {...props} />
    </PortkeyStyleProvider>
  );
}
