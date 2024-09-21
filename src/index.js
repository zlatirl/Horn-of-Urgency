// Import the modules we need
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions, Embed } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Paths to JSON
const configFilePath = path.join(__dirname, 'config.json');

// Read the names from the JSON file
const rawNames = fs.readFileSync(configFilePath);
const namesData = JSON.parse(rawNames);
const namesArray = namesData.names;

// ID of the specific channel where the command should be allowed
const allowedChannelId = process.env.CHANNEL_ID;

// Event listener for when the bot is ready
client.on("ready", (c) => {
    console.log(`${c.user.tag} is ready!`);

    // Define the /roulette command
    const roulette = new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Randomly select 4 NMs')

    // Register the command
    client.application.commands.create(roulette); 
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Check if the interaction happened in the allowed channel
    const { channelId } = interaction;
    if (channelId !== allowedChannelId) {
        interaction.reply( { content: 'This command can only be used in a specific channel.', ephemeral: true });
        return;
    }

    // Shuffle the array to ensure randomness
    const shuffledNames = namesArray.sort(() => Math.random() - 0.5);

    // Seperate joke and normal NMs
    const jokeNMs = shuffledNames.filter((nm) => nm.joke);
    const normalNMs = shuffledNames.filter((nm) => !nm.joke);
    
    // Start with 3 normal NMs
    let selectedNames = normalNMs.slice (0, 3);

    // Add a joke NM
    const shouldIncludeJokeNM = Math.random() < 0.5; // 50% chance

    if (shouldIncludeJokeNM && jokeNMs.length > 0) {
        selectedNames.push(jokeNMs[0]);
    } else if (normalNMs.length > 3) {
        // If no joke NM, pick another normal NM to make it 4 NMs
        selectedNames.push(normalNMs[3]);
    }

    // Log the names to the console
    console.log('Selected NMs:');
    selectedNames.forEach((names, index) => {
        console.log(`${index + 1}. ${names.name}`)
    });

    // Create embeds for each selected name
    const embeds = selectedNames.map((names) => {
        return new EmbedBuilder()
        .setTitle(names.name)
        .setImage(names.image)
        .setDescription(`Bank: ${names.bank}`)
        .setColor(0x00AE86);
    });

    // Respond with the selected names
    interaction.reply({ embeds });
});

// Login to Discord with the bot token from the .env file
client.login(process.env.BOT_TOKEN);