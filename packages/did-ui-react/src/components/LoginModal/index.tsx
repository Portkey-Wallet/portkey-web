import { CreateWalletType } from '../types';
import CommonModal from '../CommonModal';
import './index.less';
import ThrottleButton from '../ThrottleButton';

export default function LoginModal({
  open,
  // type = 'Login',
  maskClosable = true,
  onCancel,
}: // onConfirm,
{
  open?: boolean;
  type?: CreateWalletType;
  maskClosable?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) {
  // const title = type !== 'Login' ? 'You already have an account' : 'You don’t have an account';
  // const content =
  //   type !== 'Login' ? 'Do you want to log in with this account instead?' : 'Would you like to create one account?';
  // const btn = type !== 'Login' ? 'Log in' : 'Sign up';
  const title = 'This email is not registered';
  const content =
    'Email sign-up is suspended. You can log in using your registered email or create a new account through alternative methods.';
  const btn = 'OK';
  return (
    <CommonModal
      maskClosable={maskClosable}
      closable={false}
      open={open}
      width={320}
      title={'Continue with this account?'}
      type={'modal'}
      className="portkey-ui-signup-confirm-modal"
      onClose={onCancel}>
      <div className="warning-modal-wrapper">
        <div className="modal-title">{title}</div>
        <p className="modal-content-v2">
          {content}
          {/*{type === 'Login' &&*/}
          {/*  'This account has not been registered yet. Click "Confirm" to complete the registration.'}*/}
          {/*{type === 'SignUp' && 'This account already exists. Click "Confirm" to log in.'}*/}
        </p>
        <div className="btn-warning-wrapper">
          {/* <ThrottleButton onClick={onCancel}>Cancel</ThrottleButton> */}
          <ThrottleButton type="primary" onClick={onCancel}>
            {btn}
          </ThrottleButton>
        </div>
      </div>
    </CommonModal>
  );
}
