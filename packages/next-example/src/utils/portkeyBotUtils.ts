import TelegramBot from 'node-telegram-bot-api';

const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN_LUCKY!;

export const portkeyTelegramBot = new TelegramBot(token, {
  polling: true,
  request: {
    url: undefined as any,
    proxy: 'http://127.0.0.1:7890',
  },
});

export function handleApproveCommand(msg: TelegramBot.Message) {
  portkeyTelegramBot.sendMessage(msg.chat.id, 'Received your message, what do you want to approve?');
}

const url = process.env.NEXT_PUBLIC_PORTKEY_WEB_APP_URL || '';
console.log(url, 'url==');

export function handleLoginCommand(msg: TelegramBot.Message) {
  portkeyTelegramBot.sendMessage(msg.chat.id, 'Please select:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'New Portkey TG Login',
            web_app: {
              url: 'https://portkey-web-next-example.vercel.app/portkeySignIn',
              // url: url, // "https://next-five-indol.vercel.app/portkeySignIn"
            },
          },
          {
            text: 'Portkey TG Login',
            url: 'https://portkey-tg-demo.vercel.app/sign',
          },
        ],
        [
          {
            text: 'Symbol Market Mainnet',
            web_app: {
              url: 'https://eforest.finance/symbolmarket',
            },
          },
          {
            text: '@portkey_connect_bot',
            url: 'https://t.me/Dapp_V5_Bot/dappv5', // /dappv5?startapp=command
          },
        ],
      ],
      // keyboard: [
      //   [
      //     {
      //       text: "Portkey Wallet",
      //       web_app: {
      //         url: "https://portkey-web-next-example.vercel.app/portkeySignIn",
      //         // url: url, // "https://next-five-indol.vercel.app/portkeySignIn"
      //       },
      //     },
      //   ],
      // ],
    },
  });
}
