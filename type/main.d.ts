import { Message, User } from "discord.js";

export interface AntiPubOptions {
    botBlocked?: boolean;
    whitelistUser?: string[];
    whitelistGuild?: string[];
    whitelistChannel?: string[];
    whitelistCode?: string[];
    whitelistGName?: string[];
    banCount?: number;
    timeoutCount?: number;
    channelLogs?: string;
}

export interface AntiPubEvents {
  adBlocked: [msg: Message, data: String, warning: Number];
  adBanUser: [msg: Message, user: User];
  adTimeoutUser: [msg: Message, user: User];
}

export class AntiPub {
  public constructor(options: AntiPubOptions);
  public checkAdMessage(message: Message): void;
  public on<K extends keyof AntiPubEvents>(
    event: K,
    listener: (...args: AntiPubEvents[K]) => void
  ): this;
}
