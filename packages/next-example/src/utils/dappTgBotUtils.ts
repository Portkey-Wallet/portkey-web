import TelegramBot from 'node-telegram-bot-api';

const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN_DAPP!;

export const dappTelegramBot = new TelegramBot(token, {
  polling: true,
  request: {
    url: undefined as any,
    proxy: 'http://127.0.0.1:7890',
  },
});

export function handleApproveCommand(msg: TelegramBot.Message) {
  dappTelegramBot.sendMessage(msg.chat.id, 'Received your message, what do you want to approve?');
}

const url = process.env.NEXT_PUBLIC_PORTKEY_WEB_APP_URL || '';
console.log(url, 'url==');
export function handleLoginCommand(msg: TelegramBot.Message) {
  dappTelegramBot.sendMessage(msg.chat.id, 'Please select:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Portkey Auth',
            web_app: {
              url: 'https://portkey-web-next-example.vercel.app/portkey-webapp',
            },
          },
          {
            text: 'Dapp Webapp',
            web_app: {
              url: 'https://3portkey-web-next-example.vercel.app/dapp-webapp',
            },
          },
        ],
      ],
      // keyboard: [
      //   [
      //     {
      //       text: "Portkey Wallet",
      //       web_app: {
      //         url: "https://portkey-web-next-example.vercel.app/portkey-webapp",
      //         // url: url, // "https://next-five-indol.vercel.app/portkeySignIn"
      //       },
      //     },
      //   ],
      // ],
    },
  });
}
