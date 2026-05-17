const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'online',
  aliases: [
    'listonline',
    'whosonline'
  ],
  category: 'group',
  description:
    '🟢 Show online group members',
  usage: '.online',
  groupOnly: true,

  async execute(sock, msg, args, extra) {

    const {
      from,
      reply,
      react,
      participants
    } = extra;

    // CHECK PARTICIPANTS
    if (!participants) {
      return reply(
`╭━━━〔 *❌ ERROR* 〕━━━⬣

> _Unable to fetch participants._

╰━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }

    try {

      await react('🟢');

      // LOADING MESSAGE
      await sock.sendMessage(
        from,
        {
          text:
`╭━━━〔 *🔍 ONLINE CHECKER* 〕━━━⬣

> _Scanning group members..._

╰━━━━━━━━━━━━━━━━━━━━⬣`
        },
        { quoted: msg }
      );

      const presenceData = new Map();

      // PRESENCE HANDLER
      const presenceHandler = (
        update
      ) => {

        if (!update.presences) {
          return;
        }

        for (
          const [jid, presence]
          of Object.entries(
            update.presences
          )
        ) {
          presenceData.set(
            jid,
            presence
          );
        }
      };

      sock.ev.on(
        'presence.update',
        presenceHandler
      );

      // SUBSCRIBE PRESENCE
      for (const p of participants) {

        const jid =
          p.id || p.jid;

        try {
          await sock.presenceSubscribe(
            jid
          );
        } catch {}

        await new Promise(
          (r) =>
            setTimeout(r, 120)
        );
      }

      // WAIT FOR RESPONSES
      await new Promise(
        (r) =>
          setTimeout(r, 2500)
      );

      sock.ev.off(
        'presence.update',
        presenceHandler
      );

      const online = [];

      // FILTER ONLINE USERS
      for (const p of participants) {

        const jid =
          p.id || p.jid;

        const pres =
          presenceData.get(jid);

        const status =
          pres?.lastKnownPresence;

        if (
          status === 'available' ||
          status === 'composing' ||
          status === 'recording'
        ) {
          online.push(jid);
        }
      }

      // NO ONLINE USERS
      if (!online.length) {

        return sock.sendMessage(
          from,
          {
            text:
`╭━━━〔 *😴 ONLINE MEMBERS* 〕━━━⬣

┃ ❌ *NO MEMBERS ONLINE*

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Nobody is active right now._`
          },
          { quoted: msg }
        );
      }

      // BUILD ONLINE LIST
      let text =
`╭━━━〔 *🟢 ONLINE MEMBERS* 〕━━━⬣

┃ 👥 *GROUP MEMBERS:* _${participants.length}_
┃ 🟢 *ONLINE NOW:* _${online.length}_

╰━━━━━━━━━━━━━━━━━━━━⬣

`;

      online.forEach(
        (jid, index) => {

          text +=
`┃ ${index + 1}. @${jid.split('@')[0]}\n`;
        }
      );

      text +=
`\n╰━━━━━━━━━━━━━━━━━━━━⬣`;

      text +=
`\n\n> _Live Presence Detection System_`;

      // IMAGE PATH
      const imagePath = path.join(
        __dirname,
        '../../utils/bot_image.jpg'
      );

      // SEND WITH IMAGE
      if (
        fs.existsSync(imagePath)
      ) {

        await sock.sendMessage(
          from,
          {
            image:
              fs.readFileSync(
                imagePath
              ),
            caption: text,
            mentions: online
          },
          { quoted: msg }
        );

      } else {

        // FALLBACK TEXT
        await sock.sendMessage(
          from,
          {
            text,
            mentions: online
          },
          { quoted: msg }
        );
      }

      await react('✅');

    } catch (error) {

      console.error(
        '[ONLINE ERROR]',
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