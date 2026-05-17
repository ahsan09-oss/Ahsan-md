/**
 * Professional AutoStatus System
 * Stylish • Modern • Production Safe
 */

const config = require('../../config');

const KEY_VIEW = 'autostatus_view';
const KEY_LIKE = 'autostatus_like';
const KEY_EMOJI = 'autostatus_emoji';

const RANDOM_EMOJIS = [
  '💚',
  '❤️',
  '🔥',
  '✨',
  '😍',
  '🥰',
  '🤩',
  '😎',
  '💫',
  '🥶',
  '🤝',
  '⚡'
];

/**
 * READ SETTINGS
 */
const readState = (db) => {

  const cfg =
    config.statusSettings || {};

  const view =
    db.getGlobalSetting(KEY_VIEW);

  const like =
    db.getGlobalSetting(KEY_LIKE);

  const emoji =
    db.getGlobalSetting(KEY_EMOJI);

  return {
    autoView:
      typeof view === 'boolean'
        ? view
        : !!cfg.autoView,

    autoLike:
      typeof like === 'boolean'
        ? like
        : !!cfg.autoLike,

    likeEmoji:
      typeof emoji === 'string' &&
      emoji.trim()
        ? emoji.trim()
        : (
            cfg.likeEmoji ||
            '💚'
          )
  };
};

module.exports = {
  name: 'autostatus',
  aliases: [
    'statusauto',
    'autostory'
  ],
  category: 'dev',
  description:
    'Auto view and auto like WhatsApp statuses',

  usage:
    `${config.prefix}autostatus <on|off|view|like|emoji|status>`,

  ownerOnly: true,

  /**
   * STATUS HOOK
   */
  async onMessage(sock, msg, extra) {

    try {

      // Only status messages
      if (
        extra.from !==
          'status@broadcast' ||
        msg.key.fromMe
      ) {
        return;
      }

      const db =
        extra.database;

      const state =
        readState(db);

      if (
        !state.autoView &&
        !state.autoLike
      ) {
        return;
      }

      /**
       * AUTO VIEW
       */
      if (state.autoView) {

        await sock.readMessages([
          msg.key
        ]).catch(() => {});
      }

      /**
       * AUTO LIKE
       */
      if (state.autoLike) {

        let emojiToSend =
          state.likeEmoji;

        // MULTI EMOJI SUPPORT
        if (
          typeof state.likeEmoji ===
            'string' &&
          state.likeEmoji.includes(',')
        ) {

          const emojiList =
            state.likeEmoji
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

        // RANDOM MODE
        else if (
          state.likeEmoji ===
          'random'
        ) {

          emojiToSend =
            RANDOM_EMOJIS[
              Math.floor(
                Math.random() *
                RANDOM_EMOJIS.length
              )
            ];
        }

        await sock.sendMessage(
          extra.from,
          {
            react: {
              text: emojiToSend,
              key: msg.key
            }
          }
        ).catch(() => {});
      }

    } catch (error) {

      console.error(
        '[AUTOSTATUS]',
        error.message
      );
    }
  },

  /**
   * COMMAND EXECUTE
   */
  async execute(
    sock,
    msg,
    args,
    extra
  ) {

    try {

      const db =
        extra.database;

      const sub =
        String(
          args[0] || 'status'
        ).toLowerCase();

      const state =
        readState(db);

      /**
       * ENABLE ALL
       */
      if (sub === 'on') {

        db.setGlobalSetting(
          KEY_VIEW,
          true
        );

        db.setGlobalSetting(
          KEY_LIKE,
          true
        );

        await extra.react('🟢');

        return extra.reply(
`╭━━━〔 *🟢 AUTOSTATUS ENABLED* 〕━━━⬣

┃ 👀 *AUTO VIEW:* _ON_
┃ ❤️ *AUTO LIKE:* _ON_
┃ ✨ *EMOJIS:* 
┃ _${state.likeEmoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Automatic status system activated._`
        );
      }

      /**
       * DISABLE ALL
       */
      if (sub === 'off') {

        db.setGlobalSetting(
          KEY_VIEW,
          false
        );

        db.setGlobalSetting(
          KEY_LIKE,
          false
        );

        await extra.react('🔴');

        return extra.reply(
`╭━━━〔 *🔴 AUTOSTATUS DISABLED* 〕━━━⬣

⚠️ _Auto view and auto like disabled._

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      /**
       * VIEW
       */
      if (sub === 'view') {

        const next =
          String(
            args[1] || ''
          ).toLowerCase();

        if (
          !['on', 'off']
            .includes(next)
        ) {

          return extra.reply(
`❌ *INVALID OPTION*

📌 *Usage:*
\`${config.prefix}autostatus view on\`

📌 *Options:*
• on
• off`
          );
        }

        db.setGlobalSetting(
          KEY_VIEW,
          next === 'on'
        );

        await extra.react('👀');

        return extra.reply(
`╭━━━〔 *👀 AUTO VIEW UPDATED* 〕━━━⬣

┃ STATUS:
┃ _${
  next === 'on'
    ? 'ENABLED'
    : 'DISABLED'
}_

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      /**
       * LIKE
       */
      if (sub === 'like') {

        const next =
          String(
            args[1] || ''
          ).toLowerCase();

        if (
          !['on', 'off']
            .includes(next)
        ) {

          return extra.reply(
`❌ *INVALID OPTION*

📌 *Usage:*
\`${config.prefix}autostatus like on\`

📌 *Options:*
• on
• off`
          );
        }

        db.setGlobalSetting(
          KEY_LIKE,
          next === 'on'
        );

        await extra.react('❤️');

        return extra.reply(
`╭━━━〔 *❤️ AUTO LIKE UPDATED* 〕━━━⬣

┃ STATUS:
┃ _${
  next === 'on'
    ? 'ENABLED'
    : 'DISABLED'
}_

╰━━━━━━━━━━━━━━━━━━━━⬣`
        );
      }

      /**
       * EMOJI
       */
      if (sub === 'emoji') {

        const emoji =
          args.slice(1)
            .join(' ')
            .trim();

        if (!emoji) {

          return extra.reply(
`❌ *PLEASE PROVIDE EMOJI*

📌 *Single Emoji*
\`${config.prefix}autostatus emoji 💚\`

📌 *Multiple Emojis*
\`${config.prefix}autostatus emoji ❤️,🔥,🥰,😎\`

📌 *Random Built-in*
\`${config.prefix}autostatus emoji random\``
          );
        }

        db.setGlobalSetting(
          KEY_EMOJI,
          emoji
        );

        await extra.react(
          emoji === 'random'
            ? '🎲'
            : '✨'
        );

        return extra.reply(
`╭━━━〔 *✨ STATUS EMOJI UPDATED* 〕━━━⬣

┃ 🎯 *NEW EMOJIS:*
┃ _${emoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Status reaction emoji updated successfully._`
        );
      }

      /**
       * STATUS PANEL
       */
      return extra.reply(
`╭━━━〔 *📊 AUTOSTATUS PANEL* 〕━━━⬣

┃ 👀 *AUTO VIEW:* 
┃ _${
  state.autoView
    ? 'ON'
    : 'OFF'
}_

┃ ❤️ *AUTO LIKE:* 
┃ _${
  state.autoLike
    ? 'ON'
    : 'OFF'
}_

┃ ✨ *EMOJIS:* 
┃ _${state.likeEmoji}_

╰━━━━━━━━━━━━━━━━━━━━⬣

*📌 AVAILABLE COMMANDS*

┃ 🟢 ON
┃ ➜ \`${config.prefix}autostatus on\`

┃ 🔴 OFF
┃ ➜ \`${config.prefix}autostatus off\`

┃ 👀 VIEW
┃ ➜ \`${config.prefix}autostatus view on\`

┃ ❤️ LIKE
┃ ➜ \`${config.prefix}autostatus like on\`

┃ ✨ EMOJI
┃ ➜ \`${config.prefix}autostatus emoji 💚\`

┃ 🎭 MULTI EMOJI
┃ ➜ \`${config.prefix}autostatus emoji ❤️,🔥,🥶\`

┃ 🎲 RANDOM
┃ ➜ \`${config.prefix}autostatus emoji random\`

╰━━━━━━━━━━━━━━━━━━━━⬣

> _Fast • Stylish • Professional_`
      );

    } catch (error) {

      console.error(
        '[AUTOSTATUS CMD]',
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