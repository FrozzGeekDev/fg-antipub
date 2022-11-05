const { EmbedBuilder } = require('discord.js')
const { request } = require('undici')
const { EventEmitter } = require('events')

const functions = require('./utils/functions')

class AntiPub extends EventEmitter {
    constructor() {
        super()
    }

    options(client, options) {
        this.client = client
        this.config = {
            botBlocked: options.botBlocked ? options.botBlocked : false,

            banMember: options.banMember ? options.banMember : false,
            banReason: options.banReason ? options.banReason : "Pub interdite !",

            whitelistUser: options.whitelistUser ? options.whitelistUser : [],
            whitelistGuild: options.whitelistGuild ? options.whitelistGuild : [],
            whitelistChannel: options.whitelistChannel ? options.whitelistChannel : [],
            whitelistCode: options.whitelistCode ? options.whitelistCode : [],
            whitelistGName: options.whitelistGName ? options.whitelistGName : [],

            channelLogs: options.channelLogs ? options.channelLogs : null,
        }
    }

    async checkAdMessage(msg) {
        if(msg.channel.type == 1) return
        if(msg.content.includes('discord.gg') || msg.content.includes('discord.com/invite')) {
            var invite = /(discord\.gg|discord.com\/invite)\/.+[A-Z-a-z-0-9]/
            var link = invite.exec(msg.content)

            if(link) {
                if(msg.content.includes('discord.gg')) {
                    var invite_info = link[0].split('/')[1]
                } else if(msg.content.includes('discord.com/invite')) {
                    var invite_info = link[0].split('/')[2]
                }

                const result = await request(`https://discord.com/api/v8/invites/${invite_info}?with_counts=1`)
                const data = await functions.parseData(result.body)

                if(data) {
                    if(data.code == 10006) return

                    if(data.guild.id == msg.guild.id) return
                    if(this.config.whitelistUser.includes(msg.author.id)) return
                    if(this.config.whitelistGuild.includes(data.guild.id)) return
                    if(this.config.whitelistChannel.includes(msg.channel.id)) return
                    if(this.config.whitelistCode.includes(data.code)) return
                    if(this.config.whitelistGName) {
                        var guildName = data.guild.name.toLowerCase()
                        for(var i = 0; i < this.config.whitelistGName.length; i++) {
                            if(guildName.includes(this.config.whitelistGName[i])) return
                        }
                    }
                    if(!this.config.botBlocked) {
                        if(msg.author.bot) {
                            return
                        }
                    }

                    this.emit('fg_adBlocked', {
                        message: msg,
                        invite: data,
                    })

                    if(this.config.banMember) {
                        var member = msg.guild.members.cache.get(msg.author.id)
                        if(member) {
                            member.ban({ reason: this.config.banReason }).catch(() => {
                                return console.log(`[FG AntiPub] Je ne peux pas bannir "${member.user.tag}" (${member.id}).`)
                            })
                        }
                    }

                    if(this.config.channelLogs) {
                        var channel = this.client.channels.cache.get(this.config.channelLogs)
                        if(channel) {
                            const embedLogs = new EmbedBuilder()
                                embedLogs.setColor('#0070FF')
                                embedLogs.setThumbnail(`https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`)
                                embedLogs.setTitle(`⚠️ Anti-Pub`)
                                embedLogs.addFields({ name: `✍️ Auteur`, value: `> Membre : ${msg.author} (\`${msg.author.id}\`) \n> Salon : ${msg.channel} (\`${msg.channel.id}\`) \n Serveur : \`${msg.guild.name}\` (\`${msg.guild.id}\`)` })
                                embedLogs.addFields({ name: `❓ Informations`, value: `> Nom du serveur : \`${data.guild.name}\` (\`${data.guild.id}\`) \n> Description: \`${data.guild.description ? data.guild.description : 'Non défini'}\` \n> Invitation : https://discord.gg/${invite_info}` })
                                embedLogs.setFooter({ text: 'FG - AntiPub', iconURL: this.client.user.avatarURL() })
                                embedLogs.setTimestamp()

                            channel.send({ embeds: [embedLogs] })
                        }
                    }
                }
            }
        }
    }
}

module.exports = new AntiPub()