/**
 * Professional Pair Command
 * Stylish • Stable • Production Safe
 */

const axios = require('axios');
const config = require('../../config');

const {
  sendInteractiveMessage
} = require('../../utils/button');

module.exports = {
  name: 'pair',
  aliases: ['getpair', 'paircode'],
  category: 'utility',
  description:
    'Generate WhatsApp pairing code',
  usage: `${config.prefix}pair <number>`,
  ownerOnly: false,

  async execute(sock, msg, args, extra) {
    const {
      reply,
      react,
      from
    } = extra;

    try {

      // Validate input
      const input = args[0];

      if (!input) {
        return reply(
          `❌ *Please provide a phone number.*\n\n` +
          `📌 *Example:*\n` +
          `${config.prefix}pair 923001234567`
        );
      }

      // Clean number
      const number = input.replace(
        /[^0-9]/g,
        ''
      );

      // Validate length
      if (
        number.length < 10 ||
        number.length > 15
      ) {
        return reply(
          '❌ Invalid phone number.\n' +
          'Use country code format.\n\n' +
          'Example: 923001234567'
        );
      }

      await react('⏳');

      // Loading message
      const loading =
        await sock.sendMessage(
          from,
          {
            text:
`╭━━━〔 *🔐 PAIR CODE* 〕━━━⬣

⏳ Generating pairing code...
📱 Number: ${number}

> _Please wait..._

╰━━━━━━━━━━━━━━━━━━━━⬣`
          },
          { quoted: msg }
        );

      const loadingKey = loading.key;

      // API URL
      const apiUrl =
        `https://ali-pair-e74cb826f895.herokuapp.com/pair?number=${encodeURIComponent(number)}`;

      let pairCode = null;
      let lastError = null;

      // Retry logic
      for (let i = 1; i <= 2; i++) {
        try {

          const response =
            await axios.get(apiUrl, {
              timeout: 45000,
              headers: {
                'User-Agent':
                  config.botName || 'ALI-MD'
              }
            });

          if (
            response.status === 200 &&
            response.data &&
            response.data.code
          ) {
            pairCode =
              response.data.code;

            break;
          }

          throw new Error(
            'Invalid API response'
          );

        } catch (err) {

          lastError = err;

          if (i === 2) {
            break;
          }

          // Retry notice
          await sock.sendMessage(
            from,
            {
              text:
`🔄 Retrying request...
⏳ Attempt ${i + 1}/2`,
              edit: loadingKey
            }
          );

          await new Promise(
            (resolve) =>
              setTimeout(resolve, 3000)
          );
        }
      }

      // No code received
      if (!pairCode) {
        throw new Error(
          lastError?.message ||
          'No valid pair code received'
        );
      }

      // Success edit
      await sock.sendMessage(
        from,
        {
          text:
`╭━━━〔 *✅ SUCCESS* 〕━━━⬣

🔐 Pair code generated successfully!

╰━━━━━━━━━━━━━━━━━━━━⬣`,
          edit: loadingKey
        }
      );

      // Final stylish message
      const finalText =
`╭━━━〔 *🔐 WHATSAPP PAIR CODE* 〕━━━⬣

📱 *Number:* ${number}

🔑 *Your Pair Code:*

\`${pairCode}\`

⚠️ *Important:*
• Do not share this code
• Code may expire soon
• Use immediately

╰━━━━━━━━━━━━━━━━━━━━⬣

🚀 _Powered By ${config.botName}_`;

      // Interactive copy button
      await sendInteractiveMessage(
        sock,
        from,
        {
          text: finalText,

          footer:
            config.botName ||
            'ALI-MD',

          interactiveButtons: [
            {
              name: 'cta_copy',

              buttonParamsJson:
                JSON.stringify({
                  display_text:
                    '📋 COPY CODE',

                  copy_code:
                    pairCode
                })
            }
          ]
        },
        { quoted: msg }
      );

      await react('✅');

    } catch (error) {

      console.error(
        '[PAIR ERROR]',
        error
      );

      let errorMessage =
        '❌ Failed to generate pair code.';

      if (
        error.code ===
        'ECONNABORTED'
      ) {
        errorMessage =
          '❌ Request timed out.\n' +
          'Server may be busy.\n' +
          'Please try again later.';
      }

      else if (error.response) {
        errorMessage =
          `❌ Server Error: ${error.response.status}`;
      }

      else if (error.message) {
        errorMessage =
          `❌ ${error.message}`;
      }

      await reply(errorMessage);

      await react('❌');
    }
  }
};