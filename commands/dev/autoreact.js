/**
 * Professional AutoReact System
 * Stylish • Modern • Production Safe
 */

const config = require('../../config');

const KEY_ENABLED = 'autoreact_enabled';
const KEY_MODE = 'autoreact_mode';
const KEY_EMOJI = 'autoreact_emoji';

const RANDOM_EMOJIS = [
  '❤️',
  '🔥',
  '✨',
  '💀',
  '😂',
  '😎',
  '🤝',
  '⚡',
  '💫',
  '🥶',
  '🌸',
  '💚'
];

module.exports = {
  name: 'autoreact',
  aliases: ['areact'],
  category: 'dev',
  description: 'Automatic reaction system',
  usage: `${config.prefix}autoreact <on/off/mode/emoji/status>`,
  // ownerOnly: true,

  /**
   * AUTO MESSAGE HOOK
   */
  async onMessage(sock, msg, extra) {
    try {

      // Ignore empty/bot messages
      if (
        !msg.message ||
        msg.key.fromMe
      ) {
        return;
      }

      const db = extra.database;

      // Settings
      const enabled =
        db.getGlobalSetting(KEY_ENABLED) ||
        false;

      if (!enabled) {
        return;
      }

      const mode =
        db.getGlobalSetting(KEY_MODE) ||
        'bot';

      const customEmoji =
        db.getGlobalSetting(KEY_EMOJI) ||
        '❤️';

      // Message content
      const content =
        msg.message.ephemeralMessage?.message ||
        msg.message;

      const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        '';

      /**
       * BOT MODE
       * React only on commands
       */
      if (mode === 'bot') {

        const prefixes = [
          config.prefix,
          '.',
          '/',
          '#'
        ];

        const firstChar =
          text?.trim()?.charAt(0);

        if (!prefixes.includes(firstChar)) {
          return;
        }

        // MULTI EMOJI SUPPORT
        let emojiToSend = customEmoji;

        // If multiple emojis provided
        if (
          typeof customEmoji === 'string' &&
          customEmoji.includes(',')
        ) {

          const emojiList = customEmoji
            .split(',')
            .map(e => e.trim())
            .filter(Boolean);

          if (emojiList.length) {

            emojiToSend =
              emojiList[
                Math.floor(
                  Math.random() *
                  emojiList.length
                )
              ];
          }
        }

        // Built-in random mode
        else if (
          customEmoji === 'random'
        ) {

          emojiToSend =
            RANDOM_EMOJIS[
              Math.floor(
                Math.random() *
                RANDOM_EMOJIS.length
              )
            ];
        }

        await extra.react(emojiToSend);

        return;
      }

      /**
       * ALL MODE
       * React on every message
       */
      if (mode === 'all') {

        let emojiToSend = customEmoji;

        // MULTI EMOJI SUPPORT
        if (
          typeof customEmoji === 'string' &&
          customEmoji.includes(',')
        ) {

          const emojiList = customEmoji
            .split(',')
            .map(e => e.trim())
            .filter(Boolean);

          if (emojiList.length) {

            emojiToSend =
              emojiList[
                Math.floor(
                  Math.random() *
                  emojiList.length
                )
              ];
          }
        }

        // Built-in random mode
        else if (
          customEmoji === 'random'
        ) {

          emojiToSend =
            RANDOM_EMOJIS[
              Math.floor(
                Math.random() *
                RANDOM_EMOJIS.length
              )
            ];
        }

        await extra.react(emojiToSend);

        return;
      }

    } catch (error) {

      console.error(
        '[AUTOREACT]',
        error.message
      );
    }
  },

  /**
   * COMMAND EXECUTE
   */
  async execute(sock, msg, args, extra) {
    try {

      const db = extra.database;

      const sub =
        args[0]?.toLowerCase();

      // Current settings
      const enabled =
        db.getGlobalSetting(KEY_ENABLED) ||
        false;

      const mode =
        db.getGlobalSetting(KEY_MODE) ||
        'bot';

      const emoji =
        db.getGlobalSetting(KEY_EMOJI) ||
        '❤️';

      /**
       * HELP MENU
       */
      if (!sub) {

        return extra.reply(
`╭━━━〔 *⚡ AUTOREACT SYSTEM* 〕━━━⬣

*📌 AVAILABLE COMMANDS*

┃ 🟢 *ON*
┃ _Enable AutoReact_
┃ ➜ \`${config.prefix}autoreact on\`

┃ 🔴 *OFF*
┃ _Disable AutoReact_
┃ ➜ \`${config.prefix}autoreact off\`

┃ 🤖 *BOT MODE*
┃ _React only on commands_
┃ ➜ \`${config.prefix}autoreact mode bot\`

┃ 🌍 *ALL MODE*
┃ _React on every message_
┃ ➜ \`${config.prefix}autoreact mode all\`

┃ ✨ *CUSTOM EMOJI*
┃ _Set one emoji_
┃ ➜ \`${config.prefix}autoreact emoji 😎\`

┃ 🎭 *MULTI EMOJI*
┃ _Random emoji from your list_
┃ ➜ \`${config.prefix}autoreact emoji ❤️,🔥,🥶,😎\`

┃ 🎲 *RANDOM MODE*
┃ _Use built-in random emojis_
┃ ➜ \`${config.prefix}autoreact emoji random\`

┃ 📊 *STATUS*
┃ _View current settings_
┃ ➜ \`${config.prefix}autoreact status\`

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Fast • Stylish • Professional_`
        );
      }

      /**
       * ENABLE
       */
      if (sub === 'on') {

        db.setGlobalSetting(
          KEY_ENABLED,
          true
        );

        await extra.react('🟢');

        return extra.reply(
`╭━━━〔 *🟢 AUTOREACT ENABLED* 〕━━━⬣

┃ ⚡ *STATUS:* _ONLINE_
┃ 🤖 *MODE:* _${mode.toUpperCase()}_
┃ ✨ *EMOJIS:* 
┃ _${emoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Auto reactions are now active._`
        );
      }

      /**
       * DISABLE
       */
      if (sub === 'off') {

        db.setGlobalSetting(
          KEY_ENABLED,
          false
        );

        await extra.react('🔴');

        return extra.reply(
`╭━━━〔 *🔴 AUTOREACT DISABLED* 〕━━━⬣

⚠️ _Automatic reactions have been turned off._

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      /**
       * MODE
       */
      if (sub === 'mode') {

        const newMode =
          args[1]?.toLowerCase();

        if (
          !['bot', 'all']
            .includes(newMode)
        ) {

          return extra.reply(
`❌ *INVALID MODE*

📌 *AVAILABLE MODES*

┃ 🤖 *bot*
┃ _React only on commands_

┃ 🌍 *all*
┃ _React on every message_

╰━━━━━━━━━━━━━━━━━━━━⬣

> Example:
\`${config.prefix}autoreact mode all\``
          );
        }

        db.setGlobalSetting(
          KEY_MODE,
          newMode
        );

        await extra.react('⚡');

        return extra.reply(
`╭━━━〔 *⚡ MODE UPDATED* 〕━━━⬣

┃ 🤖 *NEW MODE:* 
┃ _${newMode.toUpperCase()}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Settings updated successfully._`
        );
      }

      /**
       * EMOJI
       */
      if (sub === 'emoji') {

        const newEmoji =
          args.slice(1).join(' ').trim();

        if (!newEmoji) {

          return extra.reply(
`❌ *PLEASE PROVIDE EMOJI*

📌 *Single Emoji*
\`${config.prefix}autoreact emoji 😎\`

📌 *Multiple Emojis*
\`${config.prefix}autoreact emoji ❤️,🔥,🥶,😎\`

📌 *Random Built-in*
\`${config.prefix}autoreact emoji random\``
          );
        }

        db.setGlobalSetting(
          KEY_EMOJI,
          newEmoji
        );

        await extra.react(
          newEmoji === 'random'
            ? '🎲'
            : '✨'
        );

        return extra.reply(
`╭━━━〔 *✨ EMOJI UPDATED* 〕━━━⬣

┃ 🎯 *NEW EMOJIS:*
┃ _${newEmoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _AutoReact emojis updated successfully._`
        );
      }

      /**
       * STATUS
       */
      if (sub === 'status') {

        return extra.reply(
`╭━━━〔 *📊 AUTOREACT STATUS* 〕━━━⬣

┃ 🟢 *ENABLED:* 
┃ _${
  enabled ? 'YES' : 'NO'
}_

┃ ⚡ *MODE:* 
┃ _${mode.toUpperCase()}_

┃ ✨ *EMOJIS:* 
┃ _${emoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _System running normally._`
        );
      }

      /**
       * INVALID OPTION
       */
      return extra.reply(
`❌ *INVALID OPTION*

📌 *USAGE*
\`${this.usage}\`

📌 *TRY*
\`${config.prefix}autoreact status\``
      );

    } catch (error) {

      console.error(
        '[AUTOREACT CMD]',
        error
      );

      await extra.reply(
`╭━━━〔 *❌ ERROR OCCURRED* 〕━━━⬣

> ${error.message}

╰━━━━━━━━━━━━━━━━━━━━⬣`
      );
    }
  }
};