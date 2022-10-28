# FG-AntiPub
## _Anti pub contre les liens de serveur discord_

# Utilisation
```javascript
const fg_antipub = require('fg-antipub')

fg_antipub.options(client, {
    botBlocked: false, // (true / false)
    
    banMember: false, // (true / false)
    banReason: "Pub interdite !",

    whitelistUser: [], // id membre autorisé
    whitelistGuild: [], // id des serveurs autorisé
    whitelistChannel: [], // id des salons autorisé
    whitelistCode: [], // code des invitations autorisé
    whitelistGName: [], // code nom serveur autorisé

    channelLogs: null, // ID du salon des logs. (null = désactivé)
})

client.on('messageCreate', async (message) => {
    await fg_antipub.checkAdMessage(message)
})

fg_antipub.on('fg_adBlocked', async (data) => {
    data.message.delete()
    data.message.channel.send(`> :warning: ${data.message.author}, **la pub est interdit sur ce serveur !** :warning:`)
})
```