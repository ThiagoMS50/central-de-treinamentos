const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
(async () => {
  for (const voz of ['pt-BR-FranciscaNeural', 'pt-BR-ThalitaMultilingualNeural']) {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voz, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream('Bem-vindo à Central de Treinamentos. Antes de começarmos, vamos conhecer rapidamente o ambiente.', { rate: '-4%' });
    const partes = [];
    await new Promise((ok, falha) => { audioStream.on('data', (d) => partes.push(d)); audioStream.on('close', ok); audioStream.on('error', falha); });
    fs.writeFileSync(`teste-${voz}.mp3`, Buffer.concat(partes));
    console.log(voz, Buffer.concat(partes).length, 'bytes');
  }
})().catch((e) => console.error('ERRO', e));
