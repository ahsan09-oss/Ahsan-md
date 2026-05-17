/**
 * Professional Uptime Command
 * Modern • Stylish • Production Safe
 */

const os = require('os');
const config = require('../../config');

/**
 * Format uptime
 */
function formatUptime(seconds) {
  seconds = Number(seconds);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (days) {
    parts.push(`${days}d`);
  }

  if (hours) {
    parts.push(`${hours}h`);
  }

  if (minutes) {
    parts.push(`${minutes}m`);
  }

  if (secs || !parts.length) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

module.exports = {
  name: 'uptime',
  aliases: [
    'runtime',
    'botuptime',
    'alive'
  ],
  category: 'general',
  description: 'Show bot uptime and status',
  usage: `${config.prefix}uptime`,

  async execute(sock, msg, args, extra) {
    try {

      await extra.react('⏳');

      // Process uptime
      const processUptime =
        process.uptime();

      const uptime =
        formatUptime(processUptime);

      // System uptime
      const systemUptime =
        formatUptime(os.uptime());

      // RAM
      const usedRam = (
        process.memoryUsage().heapUsed /
        1024 /
        1024
      ).toFixed(2);

      const totalRam = (
        os.totalmem() /
        1024 /
        1024 /
        1024
      ).toFixed(2);

      // CPU
      const cpuModel =
        os.cpus()?.[0]?.model ||
        'Unknown CPU';

      // Bot info
      const botName =
        config.botName || 'Bot';

      const version =
        config.version || '1.0.0';

      // Current time
      const now = new Date();

      const currentTime =
        now.toLocaleString();

      // Stylish response
      let message = '';

      message += `╭━━━〔 *🤖 BOT STATUS* 〕━━━⬣\n\n`;

      message += `┃ 🚀 *Bot:* ${botName}\n`;
      message += `┃ 🧬 *Version:* ${version}\n`;
      message += `┃ 📶 *Status:* Online\n`;
      message += `┃ ⏱️ *Bot Uptime:* ${uptime}\n`;
      message += `┃ 🖥️ *System Uptime:* ${systemUptime}\n`;
      message += `┃ 💾 *RAM Usage:* ${usedRam} MB\n`;
      message += `┃ 🧠 *System RAM:* ${totalRam} GB\n`;
      message += `┃ ⚙️ *Platform:* ${os.platform()}\n`;
      message += `┃ 🔥 *CPU:* ${cpuModel}\n`;

      message += `\n╰━━━━━━━━━━━━━━━━━━━━⬣`;

      message += `\n\n📅 *Current Time:*`;
      message += `\n> _${currentTime}_`;

      message += `\n\n🚀 _Powered By ${botName}_`;

      await extra.reply(message);

      await extra.react('✅');

    } catch (error) {
      console.error(
        '[UPTIME ERROR]',
        error
      );

      await extra.reply(
        '❌ Failed to fetch uptime information.'
      );

      await extra.react('❌');
    }
  }
};