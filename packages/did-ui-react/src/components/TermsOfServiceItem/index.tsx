import { ReactNode } from 'react';
import './index.less';

interface TermsOfServiceProps {
  termsOfService?: ReactNode;
}
export default function TermsOfServiceItem({ termsOfService }: TermsOfServiceProps) {
  return (
    <>
      {typeof termsOfService === 'string' ? (
        <div className="terms-of-service-item">
          <span>Use the application according to</span>
          <a href={termsOfService} target="_blank" rel="noreferrer" className="font-medium terms-text">
            Terms of service
          </a>
        </div>
      ) : (
        termsOfService
      )}
    </>
  );
}
