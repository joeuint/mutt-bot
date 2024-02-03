import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  Interaction,
} from 'discord.js';
import { fileURLToPath } from 'url';
import { Command } from './types';
import path from 'path';
import 'dotenv/config';
import fs from 'fs';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.on(Events.ClientReady, (readyClient) => {
  console.log(
    `Logged in as ${readyClient.user.username} (${readyClient.user.id})!`
  );
});

client.on(Events.GuildMemberAdd, (event) => {
  console.log(`${event.user.username} joined ${event.guild.name}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName}`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  }
});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseFolder = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(baseFolder);

console.log(`mutt-bot ${process.env.npm_package_version}`);

for (const folder of commandFolders) {
  console.log(`Loading ${folder} commands`);

  const commandPath = path.join(baseFolder, folder);
  if (!fs.lstatSync(commandPath).isDirectory()) {
    console.warn(`${commandPath} is not a directory! Skipping...`);
    continue;
  }

  const commandFiles = fs
    .readdirSync(commandPath)
    // Should work as we are compiling the ts first, instead of running the ts directly
    .filter((s) => s.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command: Command = (await import(filePath)).default;

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded ${file}`);
    } else {
      console.warn(`${filePath} is missing data and execute properties!`);
    }
  }
  console.log(`Finished loading ${folder} commands`);
}

client.login(process.env.DISCORD_BOT_TOKEN);
