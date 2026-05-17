/**
 * Menu Command - Premium Stylish WhatsApp Menu
 * Full Image Menu • Stylish • Modern
 */

const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');

const fs = require('fs');
const path = require('path');

const CATEGORY_ORDER = [
  {
    key: 'general',
    emoji: '🏠',
    name: 'MAIN MENU'
  },
  {
    key: 'ai',
    emoji: '🤖',
    name: 'AI MENU'
  },
  {
    key: 'group',
    emoji: '👥',
    name: 'GROUP MENU'
  },
  {
    key: 'dev',
    emoji: '👑',
    name: 'OWNER MENU'
  },
  {
    key: 'owner',
    emoji: '🛠️',
    name: 'OWNER MENU 2'
  },
  {
    key: 'media',
    emoji: '📥',
    name: 'DOWNLOAD MENU'
  },
  {
    key: 'fun',
    emoji: '🎮',
    name: 'FUN MENU'
  },
  {
    key: 'utility',
    emoji: '🧰',
    name: 'UTILITY MENU'
  },
  {
    key: 'anime',
    emoji: '🌸',
    name: 'ANIME MENU'
  },
  {
    key: 'textmaker',
    emoji: '✨',
    name: 'TOOLS MENU'
  }
];

/**
 * Collect Categories
 */
const collectCategories = (commands) => {

  const categories = {};

  commands.forEach((cmd, name) => {

    if (cmd.name !== name) {
      return;
    }

    const key = String(
      cmd.category || 'general'
    ).toLowerCase();

    if (!categories[key]) {
      categories[key] = [];
    }

    categories[key].push(cmd);

  });

  Object.keys(categories).forEach((key) => {

    categories[key].sort((a, b) =>
      String(a.name).localeCompare(
        String(b.name)
      )
    );

  });

  return categories;
};

/**
 * Stylish Font
 */
const smallCaps = (text = '') => {

  const normal =
    'abcdefghijklmnopqrstuvwxyz';

  const small =
    'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ';

  return text
    .toLowerCase()
    .split('')
    .map((c) => {

      const i =
        normal.indexOf(c);

      return i >= 0
        ? small[i]
        : c;

    })
    .join('');
};

/**
 * Build Menu
 */
const buildMenu = ({
  commands,
  categories,
  owner,
  botName,
  userTag
}) => {

  let text = '';

  text += `*🌍⃝⃘̉̉̉━⋆─⋆──❂*\n`;
  text += `*┊ ┊ ┊ ┊ ┊*\n`;
  text += `*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*\n`;
  text += `*┊ ☠︎︎*\n`;
  text += `*✧ ${botName} 𓂃✍︎𝄞*\n`;
  text += `*╰────────────────❂*\n\n`;

  text += `*┏━━━━━━━━━━━━━❥❥❥*\n`;
  text += `*┃*     *🏠 MAIN MENU*\n`;
  text += `*┗━━━━━━━━━━━━━❥❥❥*\n`;

  text += `*┏━━━━━━━━━━━━━❥❥❥*\n`;
  text += `*┃* *👑 OWNER* - ${owner}\n`;
  text += `*┃* *👤 USER* - @${userTag}\n`;
  text += `*┃* *🚀 VERSION* - ${config.version || '1.0.0'}\n`;
  text += `*┃* *📚 COMMANDS* - ${commands.size}\n`;
  text += `*┃* *⚡ PREFIX* - [ ${config.prefix} ]\n`;
  text += `*┃* *🌐 MODE* - PUBLIC\n`;
  text += `*┃* *🟢 STATUS* - ONLINE\n`;
  text += `*┗━━━━━━━━━━━━━❥❥❥*\n\n`;

  CATEGORY_ORDER.forEach((cat) => {

    const cmdList =
      categories[cat.key];

    if (
      !cmdList ||
      !cmdList.length
    ) {
      return;
    }

    text += `*┏━━━━━━━━━━━━━❥❥❥*\n`;
    text += `*┃* *${cat.emoji} ${cat.name}*\n`;
    text += `*┗━━━━━━━━━━━━━❥❥❥*\n`;

    cmdList.forEach((cmd) => {

      text += `*┃* ⬡ _${smallCaps(cmd.name)}_\n`;

    });

    text += `*┗━━━━━━━━━━━━━❥❥❥*\n\n`;

  });

  text += `> _Fast • Powerful • Professional_\n\n`;

  text += `> \`\`\`Powered By ${botName}\`\`\``;

  return text;
};

/**
 * Send Menu Message
 */
const sendMenuMessage = async (
  sock,
  msg,
  extra,
  text,
  botName
) => {

  const imagePath = path.join(
    __dirname,
    '../../utils/bot_image.jpg'
  );

  const contextInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid:
        config.newsletterJid ||
        '120363403978278535@newsletter',

      newsletterName: botName,

      serverMessageId: -1
    }
  };

  // IMAGE MENU
  if (fs.existsSync(imagePath)) {

    const imageBuffer =
      fs.readFileSync(imagePath);

    return sock.sendMessage(
      extra.from,
      {
        image: imageBuffer,
        caption: text,
        mentions: [extra.sender],
        contextInfo
      },
      { quoted: msg }
    );

  }

  // FALLBACK TEXT
  return sock.sendMessage(
    extra.from,
    {
      text,
      mentions: [extra.sender],
      contextInfo
    },
    { quoted: msg }
  );
};

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Display all commands',
  usage: `${config.prefix}menu`,

  async execute(
    sock,
    msg,
    args,
    extra
  ) {

    try {

      const commands =
        loadCommands();

      const categories =
        collectCategories(commands);

      const ownerNames =
        Array.isArray(config.ownerName)
          ? config.ownerName
          : [config.ownerName];

      const displayOwner =
        ownerNames[0] ||
        'Bot Owner';

      const botName =
        config.botName ||
        'ALI-MD';

      const userTag =
        extra.sender.split('@')[0];

      const menuText =
        buildMenu({
          commands,
          categories,
          owner: displayOwner,
          botName,
          userTag
        });

      await sendMenuMessage(
        sock,
        msg,
        extra,
        menuText,
        botName
      );

    } catch (error) {

      console.error(
        '[MENU ERROR]',
        error
      );

      await extra.reply(
`❌ *Error Occurred*

> ${error.message}`
      );

    }
  }
};