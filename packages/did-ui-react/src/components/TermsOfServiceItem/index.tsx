import './index.less';

interface TermsOfServiceProps {
  termsOfServiceUrl?: string;
}
export default function TermsOfServiceItem({ termsOfServiceUrl }: TermsOfServiceProps) {
  return termsOfServiceUrl ? (
    <div className="terms-of-service-item">
      <span>Use the application according to</span>
      <a href={termsOfServiceUrl} target="_blank" rel="noreferrer" className="terms-text">
        Terms of service
      </a>
    </div>
  ) : null;
}
