import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    DiscordAPIError,
} from 'discord.js';
import { Command } from '../../types';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addBooleanOption((option) =>
            option
                .setName('ephemeral')
                .setDescription(
                    'Whether or not the ban should produce a message Default: False'
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('target', true);
        const ephemeral =
            interaction.options.getBoolean('ephemeral', false) ?? false;

        const targetMember = interaction.guild?.members.cache.get(user.id);
        const member = interaction.guild?.members.cache.get(
            interaction.user.id
        );

        if (
            member &&
            targetMember &&
            member.roles.highest.position > targetMember.roles.highest.position
        ) {
            await targetMember?.ban();
            await interaction.reply(`Banned ${targetMember.user.username}`);
            return;
        }

        await interaction.reply('You do not have the permission to do that!');
    },
} as Command;
