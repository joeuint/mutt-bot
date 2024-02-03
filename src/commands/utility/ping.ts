import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns your ping'),
  async execute(interaction: ChatInputCommandInteraction) {
    // This returns API latency
    await interaction.reply(`Pong ${interaction.client.ws.ping}ms`);
  },
} as Command;
