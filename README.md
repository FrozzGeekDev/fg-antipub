# FG-AntiPub
## _Anti pub contre les liens de serveur discord_

# Utilisation
```javascript
const AntiPub = require('fg-antipub')

const fg_antipub = new AntiPub({
    botBlocked: false, // (true / false)
    
    timeoutCount: 2, // Nombre d'avertissement avant le timeout
    banCount: 3, // Nombre d'avertissement avant le ban

    whitelistUser: [], // IDs membre autorisé
    whitelistGuild: [], // IDs des serveurs autorisé
    whitelistChannel: [], // IDs des salons autorisé
    whitelistCode: [], // Code des invitations autorisé
    whitelistGName: [], // Code nom serveur autorisé

    channelLogs: null, // ID du salon des logs. (null = désactivé)
})

client.on('messageCreate', async (message) => {
    await fg_antipub.checkAdMessage(client, message)
})

fg_antipub.on('adBlocked', async (message, data, warning) => {
    message.delete()
    message.channel.send(`> :warning: ${message.author}, la pub est interdit sur ce serveur ! (\`${warning}\`/\`${banCount}\`) :warning:`)
})

fg_antipub.on('adTimeoutUser', async (message, member) => {
    var memberGuild = message.guild.members.cache.get(member.id)
    memberGuild.timeout(60_000*5, 'Pub discord interdit')
})

fg_antipub.on('adBanUser', async (message, member) => {
    var memberGuild = message.guild.members.cache.get(member.id)
    memberGuild.ban({ reason: 'Pub discord interdit', deleteMessageSeconds: 3 * 24 * 60 * 60 })
})
```