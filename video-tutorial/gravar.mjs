// Grava o vídeo: abre o modo demonstração no Chrome, executa as cenas do roteiro sincronizadas com
// a narração, captura a tela a 30 fps (1920×1080) e salva a linha do tempo dos áudios.
// Pré-requisitos: Vite rodando em http://localhost:5199 (npx vite --port 5199) e node tts.mjs.
// Uso: node gravar.mjs [idInicial] [idFinal]   (opcional, para gravar só um trecho de teste)
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CENAS } from './cenas.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SAIDA = path.join(AQUI, 'saida');
fs.mkdirSync(SAIDA, { recursive: true });
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL_DEMO = 'http://localhost:5199/demo.html?reiniciar';
const LARGURA = 1600;
const ALTURA = 900;
const ESCALA = 1.2; // 1600×900 CSS → 1920×1080 pixels
const FPS = 30;
const MATERIAL_PDF = path.join(AQUI, 'guia-escuta-ativa.pdf');
const CERTIFICADO_PNG = path.join(AQUI, 'certificado.png');

const duracoes = JSON.parse(fs.readFileSync(path.join(AQUI, 'audio', 'duracoes.json'), 'utf8'));
const [idIni, idFim] = process.argv.slice(2);
const iIni = idIni ? CENAS.findIndex((c) => c.id === idIni) : 0;
const iFim = idFim ? CENAS.findIndex((c) => c.id === idFim) : CENAS.length - 1;
const cenas = CENAS.slice(iIni, iFim + 1);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------------------------------------------------------------- Chrome + DevTools Protocol
const porta = 9400 + Math.floor(Math.random() * 300);
const perfil = path.join(process.env.TEMP, `video-tutorial-perfil-${Date.now()}`);
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${porta}`, `--window-size=${LARGURA},${ALTURA}`, `--user-data-dir=${perfil}`,
  '--lang=pt-BR', '--hide-scrollbars', '--mute-audio', '--force-color-profile=srgb', '--autoplay-policy=no-user-gesture-required',
  'about:blank',
]);

let ws;
let seq = 0;
const pendentes = new Map();
const ouvintes = [];
async function conectar() {
  let alvo;
  for (let i = 0; i < 60 && !alvo; i++) {
    await esperar(250);
    try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ }
  }
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); }
    else if (m.method) ouvintes.forEach((f) => f(m));
  });
}
const cdp = (method, params = {}) => new Promise((r) => { const n = ++seq; pendentes.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
async function js(expr) {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text);
  return r.result?.result?.value;
}
const dir = (metodo, ...args) => js(`window.__diretor.${metodo}(${args.map((a) => JSON.stringify(a)).join(',')})`);

// ---------------------------------------------------------------- Captura (screencast → ffmpeg a 30 fps)
let ultimoQuadro = null;
let t0 = 0;
let escritos = 0;
const ffmpeg = spawn('ffmpeg', [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-vf', 'scale=1920:1080:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
  path.join(SAIDA, 'video.mp4'),
]);
ffmpeg.stderr.on('data', (d) => process.stderr.write('[ffmpeg] ' + d));
const agora = () => performance.now() - t0;
let relogio = null;
function iniciarRelogio() {
  t0 = performance.now();
  relogio = setInterval(() => {
    const alvo = Math.floor((agora() / 1000) * FPS);
    while (escritos < alvo && ultimoQuadro) {
      ffmpeg.stdin.write(ultimoQuadro);
      escritos++;
    }
  }, 8);
}

// ---------------------------------------------------------------- Linha do tempo (áudio)
const linhaDoTempo = { narracoes: [], sons: [], cenas: [] };
const som = (tipo) => linhaDoTempo.sons.push({ tipo, ms: Math.round(agora()) });

// ---------------------------------------------------------------- API do diretor usada nas cenas
// Contador global: cada busca por texto ganha uma marca única durante toda a gravação (marcas
// repetidas entre cenas faziam o diretor clicar num elemento antigo com o mesmo nome).
let marcas = 0;
let posicao = { x: 960, y: 620 };
function criarDiretor(ctx) {
  const d = {
    esperar,
    async noTempo(fracao) {
      const alvo = ctx.inicio + ctx.duracao * fracao;
      const falta = alvo - performance.now();
      if (falta > 0) await esperar(falta);
    },
    async aguardar(seletor, limite = 6000) {
      const fim = performance.now() + limite;
      while (performance.now() < fim) {
        if (await dir('existe', seletor)) return;
        await esperar(80);
      }
      throw new Error(`não apareceu: ${seletor}`);
    },
    // Espera o elemento parar de se mexer (rolagens e animações reposicionam balões e menus).
    async posicaoEstavel(seletor) {
      await d.aguardar(seletor);
      let anterior = await dir('centro', seletor);
      for (let i = 0; i < 12; i++) {
        await esperar(110);
        const atual = await dir('centro', seletor);
        if (atual && anterior && Math.hypot(atual.x - anterior.x, atual.y - anterior.y) < 1.5) return atual;
        anterior = atual;
      }
      return anterior;
    },
    async moverPara(seletor) {
      let c = await d.posicaoEstavel(seletor);
      const dist = Math.hypot(c.x - posicao.x, c.y - posicao.y);
      const ms = Math.round(Math.min(1100, Math.max(420, 300 + dist * 0.55)));
      await dir('cursorVisivel', true);
      dir('moverCursor', c.x, c.y, ms);
      await esperar(ms);
      // Se o alvo mudou de lugar durante o movimento, corrige antes de agir.
      const final = await d.posicaoEstavel(seletor);
      if (Math.hypot(final.x - c.x, final.y - c.y) > 3) {
        dir('moverCursor', final.x, final.y, 220);
        await esperar(230);
        c = final;
      }
      posicao = c;
      await cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y });
      return c;
    },
    async clicar(seletor) {
      const c = await d.moverPara(seletor);
      await esperar(120);
      await dir('cliqueVisual');
      som('clique');
      await cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await esperar(280);
    },
    async clicarTexto(seletor, texto) {
      const marca = `alvo-${++marcas}`;
      await d.aguardar(seletor);
      if (!(await dir('marcarPorTexto', seletor, texto, marca))) throw new Error(`texto não encontrado: ${seletor} "${texto}"`);
      await d.clicar(`[data-dir="${marca}"]`);
    },
    async clicarAnel() {
      await d.clicar('.tutorial-anel');
    },
    async digitar(seletor, texto, opcoes = {}) {
      await d.clicar(seletor);
      if (opcoes.limpar) {
        await cdp('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 });
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 });
        await cdp('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
        await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 });
      }
      for (const ch of texto) {
        await cdp('Input.insertText', { text: ch });
        if (ch !== ' ') som('tecla');
        await esperar((opcoes.rapido ? 22 : 48) + Math.random() * (opcoes.rapido ? 26 : 50));
      }
      await esperar(200);
    },
    async tecla(nome) {
      const codigos = { Escape: 27, Tab: 9, Enter: 13 };
      await cdp('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: nome, code: nome, windowsVirtualKeyCode: codigos[nome] });
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: nome, code: nome, windowsVirtualKeyCode: codigos[nome] });
      await esperar(200);
    },
    async arquivo(seletor) {
      const { result: doc } = await cdp('DOM.getDocument', { depth: -1 });
      const { result: no } = await cdp('DOM.querySelector', { nodeId: doc.root.nodeId, selector: seletor });
      await cdp('DOM.setFileInputFiles', { files: [MATERIAL_PDF], nodeId: no.nodeId });
    },
    destacar: (seletor, rotulo, escurecer = false) => dir('destacar', seletor, rotulo ?? null, escurecer),
    limpar: () => dir('limparDestaques'),
    zoom: (seletor, escala = 1.6) => dir('zoom', seletor, escala, 900),
    chamada: (titulo, texto = '', icone = '💡') => dir('chamada', titulo, texto, icone),
    aviso: (texto, icone = '✓') => dir('aviso', texto, icone),
    cartao: (opcoes) => dir('cartaoCapitulo', opcoes),
    fecharCartao: () => dir('fecharCartao'),
    imagem: (nome, legenda = '') => {
      if (!nome) return dir('mostrarImagem', null);
      const dados = `data:image/png;base64,${fs.readFileSync(CERTIFICADO_PNG).toString('base64')}`;
      return dir('mostrarImagem', dados, legenda);
    },
    rolar: (seletor, bloco = 'center') => dir('rolarAte', seletor, bloco),
    rolarPara: (y) => dir('rolarPara', y),
    marcarLinha: (texto, marca) => dir('marcarPorTexto', 'tr', texto, marca),
    existe: (seletor) => dir('existe', seletor),
    ir: (caminho) => js(`window.__navegar(${JSON.stringify(caminho)})`),
    som,
  };
  return d;
}

// Legendas: divide a narração em trechos curtos e distribui no tempo pelo tamanho de cada um.
function trechosDeLegenda(texto) {
  const frases = texto.split(/(?<=[.!?])\s+/);
  const trechos = [];
  for (const frase of frases) {
    if (frase.length <= 110) { trechos.push(frase); continue; }
    let atual = '';
    for (const parte of frase.split(/(?<=[,:;])\s+/)) {
      if ((atual + ' ' + parte).trim().length > 110 && atual) { trechos.push(atual.trim()); atual = parte; }
      else atual = (atual + ' ' + parte).trim();
    }
    if (atual) trechos.push(atual);
  }
  return trechos;
}

// ---------------------------------------------------------------- Execução
async function principal() {
  await conectar();
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('DOM.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: LARGURA, height: ALTURA, deviceScaleFactor: ESCALA, mobile: false });
  ouvintes.push((m) => {
    if (m.method === 'Page.screencastFrame') {
      ultimoQuadro = Buffer.from(m.params.data, 'base64');
      cdp('Page.screencastFrameAck', { sessionId: m.params.sessionId });
    }
    if (m.method === 'Runtime.exceptionThrown') log('ERRO NA PÁGINA:', m.params.exceptionDetails?.exception?.description?.slice(0, 300));
  });
  await cdp('Page.navigate', { url: URL_DEMO });
  for (let i = 0; i < 80; i++) {
    await esperar(150);
    try { if (await js('!!(window.__diretor && window.__diretor.pronto && document.querySelector(".auth-card"))')) break; } catch { /* carregando */ }
  }
  await esperar(1500); // fontes e imagens
  await dir('cortinaVisivel', true, 10);
  await dir('cursorVisivel', false);
  await cdp('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  while (!ultimoQuadro) await esperar(20);
  iniciarRelogio();
  await esperar(300);

  let primeira = true;
  for (const cena of cenas) {
    const duracao = (duracoes[cena.id]?.segundos ?? 3) * 1000;
    const ctx = { inicio: performance.now(), duracao };
    const msInicio = Math.round(agora());
    linhaDoTempo.narracoes.push({ id: cena.id, ms: msInicio });
    log(`▶ ${cena.id} (${(duracao / 1000).toFixed(1)}s)`);

    // legendas sincronizadas
    const trechos = trechosDeLegenda(cena.texto);
    const totalChars = trechos.reduce((s, t) => s + t.length, 0);
    let acumulado = 0;
    const timers = trechos.map((t) => {
      const atraso = (acumulado / totalChars) * duracao;
      acumulado += t.length;
      return setTimeout(() => dir('legendar', t).catch(() => {}), atraso);
    });

    const d = criarDiretor(ctx);
    const acao = cena.acao(d).catch((e) => log(`⚠ ${cena.id}: ${e.message}`));
    if (primeira) {
      primeira = false;
      await esperar(250);
      dir('cortinaVisivel', false, 1600);
    }
    await Promise.all([esperar(duracao + 450), acao]);
    timers.forEach(clearTimeout);
    await dir('legendar', null);
    const fimMs = Math.round(agora());
    linhaDoTempo.cenas.push({ id: cena.id, cap: cena.cap, inicioMs: msInicio, fimMs });
    await esperar(cena.id.startsWith('cap') ? 500 : 250);
  }

  await dir('cortinaVisivel', true, 1800);
  await esperar(2200);
  clearInterval(relogio);
  linhaDoTempo.duracaoMs = Math.round(agora());
  fs.writeFileSync(path.join(SAIDA, 'linha-do-tempo.json'), JSON.stringify(linhaDoTempo, null, 2));
  await cdp('Page.stopScreencast');
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on('close', r));
  log(`gravação concluída: ${(linhaDoTempo.duracaoMs / 60000).toFixed(1)} min, ${escritos} quadros`);
}

principal()
  .catch((e) => { console.error('FALHOU:', e); process.exitCode = 1; })
  .finally(() => { try { ws?.close(); } catch { /* */ } chrome.kill(); });
