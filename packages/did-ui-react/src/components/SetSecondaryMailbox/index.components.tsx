import clsx from 'clsx';
import './index.less';
import BackHeaderForPage from '../BackHeaderForPage';
import { Form, Input } from 'antd';
import ThrottleButton from '../ThrottleButton';
import { SetSecondaryMailboxTip1, SetSecondaryMailboxTip2 } from '../../constants/security';
import CommonBaseModal from '../CommonBaseModal';
import CodeVerifyUI from '../CodeVerifyUI';
import BackHeader from '../BackHeader';
import { useSecondaryMail } from './hooks';

export interface ISetSecondaryMailboxProps {
  className?: string;
  onBack: () => void;
  defaultValue?: string;
  onSetSecondaryMailboxSuccess?: () => void;
  // onEdit?: () => void;
  wrapperStyle?: React.CSSProperties;
}
const { Item: FormItem } = Form;
export default function SetSecondaryMailboxMain(props: ISetSecondaryMailboxProps) {
  const { className, onBack, onSetSecondaryMailboxSuccess, defaultValue, wrapperStyle } = props;
  const {
    form,
    uiRef,
    inputRef,
    codeVerifyVisible,
    editable,
    onCodeChange,
    onReSend,
    onCodeFinish,
    handleBackView,
    onBottomButtonClick,
    onWrapperBackClick,
    codeError,
    code,
    setCodeVerifyVisible,
    setCode,
    value,
    setValue,
    error,
  } = useSecondaryMail(defaultValue || '', onBack, onSetSecondaryMailboxSuccess);
  return (
    <div style={wrapperStyle} className={clsx('portkey-ui-set-secondary-mail-wrapper', className)}>
      <BackHeaderForPage
        title={`${editable ? 'Set up Backup Mailbox' : 'Details'}`}
        leftCallBack={onWrapperBackClick}
      />
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        className="portkey-ui-flex-column portkey-ui-transfer-settings-form"
        requiredMark={false}>
        <div className="portkey-ui-form-content">
          <div className="section-two">
            <FormItem name="mailbox" label={'Backup Mailbox'}>
              <Input
                ref={inputRef}
                placeholder={'Not Set up'}
                disabled={!editable}
                value={value}
                onChange={(e) => {
                  // const { mailbox } = form.getFieldsValue();
                  const mailbox = e.target.value;
                  console.log('mailboxmailbox', mailbox);
                  setValue(mailbox);
                }}
                defaultValue={defaultValue}
              />
              {error && <span className="error-text">{error}</span>}
            </FormItem>
            {!editable && (
              <div className="portkey-ui-limit-tip">
                {SetSecondaryMailboxTip1}
                <br />
                <br />
                {SetSecondaryMailboxTip2}
              </div>
            )}
          </div>
        </div>
        <FormItem className="portkey-ui-footer-btn-wrap">
          <ThrottleButton className="portkey-ui-footer-btn" type="primary" onClick={onBottomButtonClick}>
            {editable ? 'Save' : 'Edit'}
          </ThrottleButton>
        </FormItem>
      </Form>
      <CommonBaseModal
        open={codeVerifyVisible}
        onClose={handleBackView}
        destroyOnClose
        className="verifier-page-wrapper">
        <BackHeader
          onBack={() => {
            setCodeVerifyVisible(false);
            setCode('');
          }}
        />
        <CodeVerifyUI
          ref={uiRef}
          code={code}
          error={codeError}
          className={className}
          isCountdownNow={true}
          guardianIdentifier={value}
          onCodeChange={onCodeChange}
          onReSend={onReSend}
          onCodeFinish={onCodeFinish}
        />
      </CommonBaseModal>
    </div>
  );
}
