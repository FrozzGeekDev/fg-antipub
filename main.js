const { EmbedBuilder } = require('discord.js')
const { request } = require('undici')
const { EventEmitter } = require('events')

const functions = require('./utils/functions')

class AntiPub extends EventEmitter {
    /**
     * @param {Object} options: Les options de l'antipub
     * @param {Boolean} options.botBlocked: Autorisé ou non les pub des robots
     * @param {Array.<String>} options.whitelistUser: Les ids des personnes autorisé
     * @param {Array.<String>} options.whitelistGuild: Les ids des serveurs autorisé
     * @param {Array.<String>} options.whitelistChannel: Les ids des salons autorisé
     * @param {Array.<String>} options.whitelistCode: Les ids des code d'invitations autorisé
     * @param {Array.<String>} options.whitelistGName: Les noms des serveurs autorisé
     * @param {Number} options.banCount: Nombre d'avertissement pour ban
     * @param {Number} options.timeoutCount: Nombre d'avertissement pour timeout
     * @param {String} options.channelLogs: Le salon logs des pubs
    */

    constructor(client, options) {
        super()

        this.client = client
        this.config = options
        this.warnings = new Map()
    }

    /**
     * Ceci initialise l'AntiPub et démarre le filtre
     * @param {Message} message: Le message filtrer
    */

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

                    if(this.config.whitelistUser && this.config.whitelistUser.includes(msg.author.id)) return
                    if(this.config.whitelistGuild && this.config.whitelistGuild.includes(data.guild.id)) return
                    if(this.config.whitelistChannel && this.config.whitelistChannel.includes(msg.channel.id)) return
                    if(this.config.whitelistCode && this.config.whitelistCode.includes(data.code)) return
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

                    const currentWarns = this.warnings.get(msg.author.id)
                    this.warnings.set(msg.author.id, currentWarns == undefined ? 1 : currentWarns + 1)

                    this.emit('adBlocked', msg, data, this.warnings.get(msg.author.id))

                    switch (parseInt(this.warnings.get(msg.author.id))) {
                        case parseInt(this.config.banCount):
                            this.warnings.delete(msg.author.id)
                            this.emit("adBanUser", msg, msg.author)
                            break
                        case parseInt(this.config.timeoutCount):
                            this.warnings.delete(msg.author.id)
                            this.emit("adTimeoutUser", msg, msg.author)
                            break
                    }

                    if(this.config.channelLogs) {
                        var channel = this.client.channels.cache.get(this.config.channelLogs)
                        if(channel) {
                            const embedLogs = new EmbedBuilder()
                                embedLogs.setColor('#0070FF')
                                embedLogs.setThumbnail(`https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`)
                                embedLogs.setTitle(`⚠️ Anti-Pub`)
                                embedLogs.addFields({ name: `✍️ Auteur`, value: `> Membre : ${msg.author} (\`${msg.author.id}\`) \n> Salon : ${msg.channel} (\`${msg.channel.id}\`) \n> Serveur : \`${msg.guild.name}\` (\`${msg.guild.id}\`)` })
                                embedLogs.addFields({ name: `❓ Informations`, value: `> Nom du serveur : \`${data.guild.name}\` (\`${data.guild.id}\`) \n> Description: \`${data.guild.description ? data.guild.description : 'Non défini'}\` \n> Invitation : https://discord.gg/${invite_info}` })
                                embedLogs.setFooter({ text: `${this.client.user.username} - AntiPub`, iconURL: this.client.user.avatarURL() })
                                embedLogs.setTimestamp()

                            channel.send({ embeds: [embedLogs] })
                        }
                    }
                }
            }
        }
    }
}

module.exports = AntiPub