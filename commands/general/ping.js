/**
 * Professional Ping Command
 * Fast • Clean • Stylish
 */

const os = require('os');
const config = require('../../config');

module.exports = {
  name: 'ping',
  aliases: ['p', 'speed'],
  category: 'general',
  description: 'Check bot response speed and system status',
  usage: `${config.prefix}ping`,

  async execute(sock, msg, args, extra) {
    try {
      const start = Date.now();

      await extra.react('⏳');

      // Loading message
      const sent = await extra.reply(
        '🏓 *_Checking bot response speed..._*'
      );

      const end = Date.now();

      const speed = end - start;

      // RAM Usage
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

      // Uptime
      const uptime = process.uptime();

      const hours = Math.floor(
        uptime / 3600
      );

      const minutes = Math.floor(
        (uptime % 3600) / 60
      );

      const seconds = Math.floor(
        uptime % 60
      );

      // Ping Status
      let status = '🟢 Excellent';

      if (speed > 500) {
        status = '🟡 Normal';
      }

      if (speed > 1000) {
        status = '🔴 Slow';
      }

      // Stylish message
      const pingText = `
╭━━━〔 *🏓 PONG RESPONSE* 〕━━━⬣

┃ ⚡ *Speed:* ${speed}ms
┃ 📶 *Status:* ${status}
┃ 🤖 *Bot:* ${config.botName}
┃ 💾 *RAM Usage:* ${usedRam} MB
┃ 🖥️ *System RAM:* ${totalRam} GB
┃ ⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s

╰━━━━━━━━━━━━━━━━━━━━⬣

> 🚀 _Fast • Stable • Online_
`.trim();

      // Edit message
      await sock.sendMessage(
        extra.from,
        {
          text: pingText,
          edit: sent.key
        },
        { quoted: msg }
      );

      await extra.react('✅');

    } catch (error) {
      console.error('[PING ERROR]', error);

      await extra.reply(
        `❌ Error: ${error.message}`
      );

      await extra.react('❌');
    }
  }
};