const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

module.exports = {
  name: 'vcf',
  aliases: [
    'savecontact',
    'scontact',
    'savecontacts'
  ],
  category: 'group',
  description:
    '📇 Export all group members as VCF contact file',
  usage: '.vcf',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    const {
      from,
      isGroup,
      reply,
      react,
      groupMetadata
    } = extra;

    // GROUP CHECK
    if (!isGroup) {
      return reply(
`╭━━━〔 *❌ GROUP ONLY* 〕━━━⬣

> _This command only works in groups._

╰━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    // GROUP META CHECK
    if (!groupMetadata) {
      return reply(
`╭━━━〔 *❌ ERROR* 〕━━━⬣

> _Failed to fetch group metadata._

╰━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    try {

      await react('📇');

      const participants =
        groupMetadata.participants || [];

      if (!participants.length) {
        return reply(
`╭━━━〔 *❌ NO MEMBERS* 〕━━━⬣

> _No participants found in this group._

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      let vcard = '';
      let savedCount = 0;

      participants.forEach(
        (member, index) => {

          const jid =
            member.id || member.jid;

          if (!jid) return;

          const number =
            jid.split('@')[0];

          // VALID NUMBER CHECK
          if (!/^\d+$/.test(number)) {
            return;
          }

          const name =
            member.notify ||
            member.name ||
            `+${number}`;

          vcard +=
`BEGIN:VCARD
VERSION:3.0
FN:[${index + 1}] ${name}
TEL;type=CELL;waid=${number}:+${number}
END:VCARD
`;

          savedCount++;
        }
      );

      // NO VALID CONTACTS
      if (savedCount === 0) {
        return reply(
`╭━━━〔 *❌ EMPTY EXPORT* 〕━━━⬣

> _No valid phone numbers found._

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      // FILE PATH
      const filePath = path.join(
        tmpdir(),
        `GroupContacts_${Date.now()}.vcf`
      );

      fs.writeFileSync(
        filePath,
        vcard,
        'utf8'
      );

      // IMAGE PATH
      const imagePath = path.join(
        __dirname,
        '../../utils/bot_image.jpg'
      );

      const caption =
`╭━━━〔 *📇 VCARD EXPORT* 〕━━━⬣

┃ 👥 *GROUP:*
┃ _${groupMetadata.subject}_

┃ 📚 *TOTAL MEMBERS:*
┃ _${participants.length}_

┃ ✅ *SAVED CONTACTS:*
┃ _${savedCount}_

┃ ⚡ *STATUS:*
┃ _EXPORT COMPLETED_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Professional Contact Export System_`;

      // SEND WITH IMAGE PREVIEW
      if (fs.existsSync(imagePath)) {

        await sock.sendMessage(
          from,
          {
            image: fs.readFileSync(imagePath),
            caption
          },
          { quoted: msg }
        );
      }

      // SEND VCF FILE
      await sock.sendMessage(
        from,
        {
          document: fs.readFileSync(filePath),
          mimetype: 'text/vcard',
          fileName: `${groupMetadata.subject}_Contacts.vcf`,
          caption:
`╭━━━〔 *✅ VCARD READY* 〕━━━⬣

📁 *FILE:* _GroupContacts.vcf_
📇 *CONTACTS:* _${savedCount}_

╰━━━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: msg }
      );

      // DELETE TEMP FILE
      fs.unlinkSync(filePath);

      await react('✅');

    } catch (error) {

      console.error(
        '[VCF ERROR]',
        error
      );

      await react('❌');

      return reply(
`╭━━━〔 *❌ ERROR OCCURRED* 〕━━━⬣

> _${error.message}_

╰━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }
  }
};