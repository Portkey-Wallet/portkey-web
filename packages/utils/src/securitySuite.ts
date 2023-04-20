import { ISecuritySuite } from './util.type';

export class SecuritySuite implements ISecuritySuite {
  passwordStrengthCheck = (password: string) => {
    return /^\d+$/.test(password);
  };
}
