import { ReactNode } from 'react';
import './index.less';

interface TermsOfServiceProps {
  termsOfService?: ReactNode;
  privacyPolicy?: string;
}
export default function TermsOfServiceItem({ termsOfService, privacyPolicy }: TermsOfServiceProps) {
  return (
    <>
      {typeof termsOfService === 'string' ? (
        <div className="terms-of-service-item">
          <span>By continuing, you agree to the</span>
          <span className="link-content">
            <a href={termsOfService} target="_blank" rel="noreferrer" className="terms-text">
              {` Terms of Service`}
            </a>
            {privacyPolicy && typeof privacyPolicy === 'string' && (
              <>
                <span>{` and`}</span>
                <a href={privacyPolicy} target="_blank" rel="noopener noreferrer" className="terms-text">
                  {` Privacy Policy`}
                </a>
              </>
            )}
          </span>
        </div>
      ) : (
        termsOfService
      )}
    </>
  );
}
