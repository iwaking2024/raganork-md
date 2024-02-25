const {
    Module
} = require('../main');
const {
    processOnwa
} = require('./misc/misc');
Module({
    pattern: 'onwa ?(.*)',
    fromMe: true,
    desc: 'Enumera los números registrados en WhatsApp, no registrados, etc.',
    use: 'whatsapp',
    usage: 'onwa +48888888xxx'
}, (async (message, match) => {
    if (!match[1]) return await message.sendReply("_Need number!_");
    let x = await message.send("Procesando...");
    await processOnwa(message,match[1])
    return await message.edit('Tarea completada ✅',message.jid,x.key)
}));
