const {Module} = require('../main'),
    imgToPDF = require('image-to-pdf'),
    fs = require('fs'),
    { fromBuffer } = require('file-type'),
    {MODE} = require('../config'),
    Fs = require("node:fs/promises"),
    pdfPath = './temp/pdf',
    res = './temp/converted.pdf',
    path = require('path');
Module({
    pattern: 'pdf ?(.*)',
    fromMe: MODE == 'private',
    desc: "Images to PDF",
    use: 'converters',
    usage:'.pdf help'
  },async (message, match) => {
    if (!fs.existsSync(pdfPath)) {
        fs.mkdirSync(pdfPath)
    }
  if (match[1]?.toLowerCase() == 'help'){
   await message.sendReply(`_1. Imágenes de entrada utilizando .pdf_\n_2. Obtenga el pdf de salida con .pdf get_\n_3. Si ha añadido imágenes por error, elimine todas las imágenes introducidas con .pdf delete_\n_4. Todos los archivos se eliminarán automáticamente después de la salida se produce_.`)
    }
  if (match[1]?.toLowerCase() == 'delete'){
    for (const file of await Fs.readdir(pdfPath)) {
        await Fs.unlink(path.join(pdfPath, file));
    }
    try { await Fs.unlink(res) } catch {}
    await message.sendReply(`_Successfully cleared all files!_`)
    }
  else if (match[1]?.toLowerCase() == 'get'){
    const pages = (await fs.readdirSync(pdfPath)).filter(e=>e.includes('topdf')).map(e=>pdfPath+'/'+e)  
    if (!pages.length) return await message.sendReply('_No files inputted_')
    imgToPDF(pages, imgToPDF.sizes.A4).pipe(fs.createWriteStream(res)).on('finish',async()=>{
        await message.client.sendMessage(message.jid,{document: {url:res},mimetype:'application/pdf',fileName:'converted.pdf'},{quoted: message.data})
        for (const file of await Fs.readdir(pdfPath)) {
            await Fs.unlink(path.join(pdfPath, file));
        }
        await Fs.unlink(res)
    })
    }
  else if (message.reply_message){
    let savedFile = await message.reply_message.download('buffer')
    let {mime} = await fromBuffer(savedFile)
    if (mime.includes('image')){
        const pages = (await fs.readdirSync(pdfPath)).filter(e=>e.includes('topdf'))    
        await fs.writeFileSync(pdfPath+'/topdf_'+pages.length+'.jpg',savedFile)
        return await message.sendReply(`*Imagen guardada con éxito *\n_*Total de imágenes guardadas: ${pages.length+1}*_\n*Después de guardar todas las imágenes, utilice '.pdf get' para obtener el resultado. Las imágenes se borrarán después de la conversión.*`)
    } else {
        return await message.sendReply('¡Responde a cualquier imagen!')
    }
  } else return await message.sendReply('Responde a cualquier imagen y obtén ayuda con el comando ".pdf help"')
});
