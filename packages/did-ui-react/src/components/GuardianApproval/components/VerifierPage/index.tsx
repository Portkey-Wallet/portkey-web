import BackHeader from '../../../BackHeader';
import CodeVerify, { CodeVerifyProps } from '../../../CodeVerify/index.component';
import './index.less';

export default function VerifierPage({ onBack, ...props }: CodeVerifyProps & { onBack: () => void }) {
  return (
    <div className="verifier-page-wrapper">
      <BackHeader onBack={onBack} />
      <CodeVerify {...props} />
    </div>
  );
}
