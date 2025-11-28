import { ReactNode } from 'react';

export enum SocialMediaItemType {
  email = 'email',
  link = 'link',
}
export interface ISocialMedia {
  icon: ReactNode;
  type: `${SocialMediaItemType}`;
  link: string;
}
