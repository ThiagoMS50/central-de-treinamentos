// Converte o certificado em PDF (gerado pelo próprio serviço do sistema) em PNG para aparecer no
// vídeo. Usa o pdf.js dentro do Chrome. Uso: node certificado.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const tipos = { '.mjs': 'text/javascript', '.html': 'text/html', '.pdf': 'application/pdf' };
const servidor = http.createServer((req, res) => {
  const arq = path.join(AQUI, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(arq)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(arq)] ?? 'application/octet-stream' });
  fs.createReadStream(arq).pipe(res);
}).listen(5288);

fs.writeFileSync(path.join(AQUI, 'render-pdf.html'), `<!doctype html><html><body style="margin:0">
<script type="module">
import * as pdfjs from '/node_modules/pdfjs-dist/build/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
const doc = await pdfjs.getDocument('/certificado-lucas.pdf').promise;
const pagina = await doc.getPage(1);
const vp = pagina.getViewport({ scale: 2.4 });
const c = document.createElement('canvas');
c.width = vp.width; c.height = vp.height;
await pagina.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
window.__png = c.toDataURL('image/png');
</script></body></html>`);

const porta = 9711;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${process.env.TEMP}/render-pdf-perfil`, 'http://localhost:5288/render-pdf.html']);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let alvo;
  for (let i = 0; i < 40 && !alvo; i++) { await esperar(250); try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((t) => t.type === 'page'); } catch { /* */ } }
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const pend = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (pend.has(m.id)) pend.get(m.id)(m); });
  const avaliar = (expr) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } })); });
  let png;
  for (let i = 0; i < 60 && !png; i++) { await esperar(300); png = (await avaliar('window.__png || null')).result?.result?.value; }
  fs.writeFileSync(path.join(AQUI, 'certificado.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log('certificado.png gerado');
  ws.close();
} finally {
  chrome.kill();
  servidor.close();
  fs.rmSync(path.join(AQUI, 'render-pdf.html'), { force: true });
}
