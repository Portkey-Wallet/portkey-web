import { isNotificationEvents } from '@portkey/providers';

export default class PermissionController {
  whitelist: string[];
  constructor({ whitelist = [] }: { whitelist?: string[] }) {
    this.whitelist = whitelist;
  }

  checkAllowMethod(methodName: string) {
    return this.whitelist.includes(methodName) || isNotificationEvents(methodName);
  }
}
