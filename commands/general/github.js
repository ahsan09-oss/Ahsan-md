/**
 * GitHub Command - Professional Repository Viewer
 */

const axios = require('axios');
const config = require('../../config');

const REPO_OWNER = 'ALI-XMD';
const REPO_NAME = 'ALI-MD';

module.exports = {
  name: 'github',
  aliases: ['repo', 'git', 'source', 'sc', 'script'],
  category: 'general',
  description: 'Show GitHub repository information and statistics',
  usage: `${config.prefix}github`,
  ownerOnly: false,

  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;

      await extra.react('⏳');

      const repoUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
      const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

      // Loading message
      const loading = await extra.reply(
        '🔍 Fetching repository information...'
      );

      try {
        // Fetch GitHub repo data
        const { data: repo } = await axios.get(apiUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': config.botName || 'WhatsAppBot'
          }
        });

        const stars = repo.stargazers_count?.toLocaleString() || '0';
        const forks = repo.forks_count?.toLocaleString() || '0';
        const watchers = repo.watchers_count?.toLocaleString() || '0';
        const issues = repo.open_issues_count?.toLocaleString() || '0';
        const size = `${(repo.size / 1024).toFixed(2)} MB`;

        const createdAt = new Date(repo.created_at)
          .toDateString();

        const updatedAt = new Date(repo.updated_at)
          .toDateString();

        let message = '';

        message += `╭━━━〔 *${config.botName} Repository* 〕━━━╮\n\n`;

        message += `👨‍💻 *Developer:* ${repo.owner.login}\n`;
        message += `📦 *Repository:* ${repo.name}\n`;
        message += `📝 *Description:* ${repo.description || 'No description'}\n`;
        message += `🌐 *GitHub URL:*\n${repo.html_url}\n\n`;

        message += `╭─❖ *Repository Statistics* ❖─╮\n`;
        message += `│ ⭐ Stars     : ${stars}\n`;
        message += `│ 🍴 Forks     : ${forks}\n`;
        message += `│ 👀 Watchers  : ${watchers}\n`;
        message += `│ 🐞 Issues    : ${issues}\n`;
        message += `│ 📁 Size      : ${size}\n`;
        message += `╰────────────────────────╯\n\n`;

        message += `╭─❖ *Repository Info* ❖─╮\n`;
        message += `│ 🔒 Privacy   : ${repo.private ? 'Private' : 'Public'}\n`;
        message += `│ 🌿 Branch    : ${repo.default_branch}\n`;
        message += `│ 💻 Language  : ${repo.language || 'Unknown'}\n`;
        message += `│ 📅 Created   : ${createdAt}\n`;
        message += `│ 🔄 Updated   : ${updatedAt}\n`;
        message += `╰────────────────────────╯\n\n`;

        message += `╭─❖ *Quick Actions* ❖─╮\n`;
        message += `│ ⭐ Star Repository\n`;
        message += `│ 🍴 Fork Repository\n`;
        message += `│ 📥 Clone Source Code\n`;
        message += `╰────────────────────────╯\n\n`;

        message += `📥 *Clone Command:*\n`;
        message += `\`\`\`bash\n`;
        message += `git clone ${repo.clone_url}\n`;
        message += `\`\`\`\n\n`;

        message += `> 🚀 Powered By ${config.botName}`;

        // Prevent oversized message
        if (message.length > 3500) {
          message = message.slice(0, 3500);
        }

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

        // Edit loading message
        await sock.sendMessage(
          chatId,
          {
            text: message,
            edit: loading.key,
            ...(contextInfo ? { contextInfo } : {})
          },
          { quoted: msg }
        );

        await extra.react('✅');

      } catch (apiError) {
        console.error('[GitHub API]', apiError.message);

        const fallback = `
╭━━━〔 *${config.botName} Repository* 〕━━━╮

⚠️ Unable to fetch live GitHub statistics.

🌐 *Repository URL:*
${repoUrl}

👨‍💻 *Developer:* ${config.ownerName}

📥 *Clone Command:*
\`\`\`bash
git clone ${repoUrl}.git
\`\`\`

> Powered By ${config.botName}
`.trim();

        await sock.sendMessage(
          chatId,
          {
            text: fallback,
            edit: loading.key
          },
          { quoted: msg }
        );

        await extra.react('⚠️');
      }

    } catch (error) {
      console.error('[github]', error);

      await extra.reply(
        `❌ Failed to fetch repository information.\n\n${error.message}`
      );

      await extra.react('❌');
    }
  }
};