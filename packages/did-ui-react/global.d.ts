/// <reference types="react-scripts" />

declare module 'aelf-sdk';
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare const window: Window &
  typeof globalThis & {
    Telegram?: Telegram;
  };
