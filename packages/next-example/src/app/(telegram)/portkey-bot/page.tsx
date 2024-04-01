import { handleApproveCommand, handleLoginCommand, portkeyTelegramBot } from '../../../utils/portkeyBotUtils';

export default function TgBot() {
  // const reg = new RegExp("^/approve$");
  // bot.onText(reg, () => {});
  portkeyTelegramBot.addListener('message', (message: any) => {
    console.log('portkey bot message', message);
    // bot.sendMessage("", "Approve");
  });

  portkeyTelegramBot.onText(/\/approve/, handleApproveCommand);
  portkeyTelegramBot.onText(/\/login/, handleLoginCommand);

  return (
    <div className="page-container">
      <h1>PORTKEY BOT</h1>
    </div>
  );
}
