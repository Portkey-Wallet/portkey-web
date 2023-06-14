import BaseStyleProvider from '../BaseStyleProvider';
import UserInputPropsCom from './index.component';
import type { UserInputProps } from './index.component';

export default function UserInput(props?: UserInputProps) {
  return (
    <BaseStyleProvider>
      <UserInputPropsCom {...props} />
    </BaseStyleProvider>
  );
}
