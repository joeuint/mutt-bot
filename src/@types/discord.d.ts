import { Collection } from 'discord.js';
import { Command } from '../types';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
  }
}
