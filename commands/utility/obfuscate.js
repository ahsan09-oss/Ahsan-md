/**
 * Advanced JavaScript Obfuscator
 * Stable + Connection Closed Fix
 */

const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'obfuscate',
    aliases: ['obf', 'obfuscator'],
    category: 'utility',
    description: 'Obfuscate JavaScript files',
    usage: '.obfuscate (reply to js file)',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {

        const {
            from,
            reply,
            react
        } = extra;

        try {

            let inputPath;
            let originalName = 'script.js';

            // ===============================
            // REPLY TO JS FILE
            // ===============================

            const quoted =
                msg.message?.extendedTextMessage
                    ?.contextInfo?.quotedMessage;

            if (
                quoted?.documentMessage &&
                quoted.documentMessage.fileName?.endsWith('.js')
            ) {

                await react('⏳');

                const buffer =
                    await downloadMediaMessage(
                        {
                            key: msg.key,
                            message: quoted
                        },
                        'buffer',
                        {},
                        {
                            logger: undefined,
                            reuploadRequest:
                                sock.updateMediaMessage
                        }
                    );

                inputPath = path.join(
                    tmpdir(),
                    `input_${Date.now()}.js`
                );

                fs.writeFileSync(inputPath, buffer);

                originalName =
                    quoted.documentMessage.fileName;

            } else {
                return reply(
                    '❌ Reply to a *.js* file'
                );
            }

            // ===============================
            // START
            // ===============================

            await reply(
                '🔐 *Obfuscating JavaScript...*\n\n⏳ Please wait...'
            );

            let JavaScriptObfuscator;

            try {

                JavaScriptObfuscator =
                    require('javascript-obfuscator');

            } catch {

                return reply(
                    '❌ Install package first:\n\nnpm install javascript-obfuscator'
                );
            }

            // ===============================
            // READ CODE
            // ===============================

            const code =
                fs.readFileSync(
                    inputPath,
                    'utf8'
                );

            // ===============================
            // OBFUSCATE
            // ===============================

            const result =
                JavaScriptObfuscator.obfuscate(
                    code,
                    {
                        compact: true,

                        controlFlowFlattening: false,

                        deadCodeInjection: false,

                        debugProtection: false,

                        disableConsoleOutput: false,

                        identifierNamesGenerator:
                            'hexadecimal',

                        renameGlobals: false,

                        selfDefending: false,

                        simplify: true,

                        splitStrings: true,

                        splitStringsChunkLength: 8,

                        stringArray: true,

                        stringArrayEncoding: [
                            'base64'
                        ],

                        stringArrayShuffle: true,

                        stringArrayRotate: true,

                        stringArrayThreshold: 0.75
                    }
                );

            // ===============================
            // SAVE FILE
            // ===============================

            const outputName =
                originalName.replace(
                    '.js',
                    '_obfuscated.js'
                );

            const outputPath =
                path.join(
                    tmpdir(),
                    outputName
                );

            fs.writeFileSync(
                outputPath,
                result.getObfuscatedCode()
            );

            // ===============================
            // SEND FILE
            // ===============================

            const fileBuffer =
                fs.readFileSync(outputPath);

            await sock.sendMessage(
                from,
                {
                    document: fileBuffer,
                    mimetype:
                        'application/javascript',
                    fileName: outputName,

                    caption:
`╭━━━〔 *🔐 OBFUSCATED* 〕━━━⬣

*📁 File:* _${outputName}_

*✅ Status:* _Success_

╰━━━━━━━━━━━━━━━━━━⬣`
                },
                {
                    quoted: msg
                }
            );

            // ===============================
            // CLEANUP
            // ===============================

            try {
                fs.unlinkSync(inputPath);
            } catch {}

            try {
                fs.unlinkSync(outputPath);
            } catch {}

            await react('✅');

        } catch (err) {

            console.error(
                '[OBFUSCATE ERROR]',
                err
            );

            await react('❌');

            return extra.reply(
`╭━━━〔 *❌ ERROR* 〕━━━⬣

${err.message}

╰━━━━━━━━━━━━━━━━━━⬣`
            );
        }
    }
};