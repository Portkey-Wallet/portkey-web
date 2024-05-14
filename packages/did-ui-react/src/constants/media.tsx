import { CustomSvg } from '../components';
import { SocialMediaItemType } from '../components/types/social';

export const SOCIAL_MEDIA = [
  { icon: <CustomSvg type="Twitter" />, type: SocialMediaItemType.link, link: 'https://twitter.com/Portkey_DID' },
  // { icon: <CustomSvg type="Medium" />, link: '' },
  { icon: <CustomSvg type="Telegram" />, type: SocialMediaItemType.link, link: 'https://t.me/Portkey_Official_Group' },
  { icon: <CustomSvg type="Discord" />, type: SocialMediaItemType.link, link: 'https://discord.com/invite/EUBq3rHQhr' },
  { icon: <CustomSvg type="EmailIcon" />, type: SocialMediaItemType.email, link: 'support@portkey.finance' },
];
