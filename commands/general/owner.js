/**
 * Owner Command - Professional Owner Contact Card
 */

const config = require('../../config');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'owner',
  aliases: ['creator', 'dev', 'botowner'],
  category: 'general',
  description: 'Show bot owner contact information',
  usage: `${config.prefix}owner`,
  ownerOnly: false,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      await extra.react('⏳');

      // Normalize owner data
      const ownerNumbers = Array.isArray(config.ownerNumber)
        ? config.ownerNumber
        : [config.ownerNumber];

      const ownerNames = Array.isArray(config.ownerName)
        ? config.ownerName
        : [config.ownerName];

      // Create vCards
      const contacts = ownerNumbers.map((num, index) => {
        const cleanNumber = String(num).replace(/[^0-9]/g, '');

        const name =
          ownerNames[index] ||
          ownerNames[0] ||
          'Bot Owner';

        return {
          vcard: [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${name}`,
            `ORG:${config.botName || 'WhatsApp Bot'};`,
            `TEL;type=CELL;type=VOICE;waid=${cleanNumber}:${cleanNumber}`,
            'END:VCARD'
          ].join('\n')
        };
      });

      const displayName =
        ownerNames[0] ||
        config.ownerName ||
        'Bot Owner';

      // Professional message
      let caption = '';

      caption += `╭━━━〔 *${config.botName} Owner* 〕━━━╮\n\n`;

      caption += `👑 *Owner Name:* ${displayName}\n`;
      caption += `🤖 *Bot Name:* ${config.botName}\n`;
      caption += `📞 *Available Contacts:* ${contacts.length}\n\n`;

      caption += `📌 Please contact only for:\n`;
      caption += `• Bot support\n`;
      caption += `• Bug reports\n`;
      caption += `• Business inquiries\n`;
      caption += `• Collaboration\n\n`;

      caption += `⚠️ Avoid spam or unnecessary calls.\n\n`;

      caption += `╰━━━━━━━━━━━━━━━━━━━━╯\n\n`;

      caption += `> Powered By ${config.botName}`;

      // Newsletter context
      const newsletterJid = config.newsletterJid || '';

      const contextInfo = newsletterJid
        ? {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid,
              newsletterName: config.botName,
              serverMessageId: -1
            }
          }
        : undefined;

      // Send contacts
      await sock.sendMessage(
        chatId,
        {
          contacts: {
            displayName,
            contacts
          }
        },
        { quoted: msg }
      );

      // Bot image
      const imagePath = path.join(
        __dirname,
        '../../utils/bot_image.jpg'
      );

      let imageBuffer = null;

      if (fs.existsSync(imagePath)) {
        imageBuffer = fs.readFileSync(imagePath);
      }

      // Send caption with image
      if (imageBuffer) {
        await sock.sendMessage(
          chatId,
          {
            image: imageBuffer,
            caption,
            ...(contextInfo ? { contextInfo } : {}),
            mentions: [extra.sender]
          },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          chatId,
          {
            text: caption,
            ...(contextInfo ? { contextInfo } : {}),
            mentions: [extra.sender]
          },
          { quoted: msg }
        );
      }

      await extra.react('✅');

    } catch (error) {
      console.error('[owner]', error);

      await extra.reply(
        `❌ Failed to fetch owner contact.\n\n${error.message}`
      );

      await extra.react('❌');
    }
  }
};