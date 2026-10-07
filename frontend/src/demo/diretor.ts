// MODO DEMONSTRAÇÃO: camada visual do "diretor" do vídeo tutorial. Fica por cima do app e é
// controlada pelo script de gravação (via window.__diretor): cursor animado com clique, zoom
// suave, destaques com rótulo, legendas, cartões de capítulo, avisos e imagens em tela cheia.
import './diretor.css';

type Ret = { x: number; y: number; w: number; h: number };

const camada = document.createElement('div');
camada.id = 'diretor';
document.body.appendChild(camada);

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe: string, html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = classe;
  e.innerHTML = html;
  return e;
}

// ---------- Cursor ----------
const cursor = el('div', 'dir-cursor', `<svg width="30" height="34" viewBox="0 0 30 34"><path d="M3 2l22 15-10 2 6 11-4 2-6-11-8 7z" fill="#fff" stroke="#17141f" stroke-width="2" stroke-linejoin="round"/></svg>`);
camada.appendChild(cursor);
let posCursor = { x: 960, y: 620 };
cursor.style.transform = `translate(${posCursor.x}px, ${posCursor.y}px)`;

function moverCursor(x: number, y: number, ms: number) {
  cursor.style.transition = `transform ${ms}ms cubic-bezier(0.45, 0, 0.2, 1), opacity 0.3s`;
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  posCursor = { x, y };
  return new Promise((r) => setTimeout(r, ms));
}

function cliqueVisual() {
  const onda = el('div', 'dir-clique');
  onda.style.left = `${posCursor.x}px`;
  onda.style.top = `${posCursor.y}px`;
  camada.appendChild(onda);
  cursor.classList.add('dir-cursor-apertado');
  setTimeout(() => cursor.classList.remove('dir-cursor-apertado'), 160);
  setTimeout(() => onda.remove(), 700);
}

// ---------- Zoom (no app inteiro, a camada do diretor fica fora) ----------
const raiz = () => document.getElementById('root')!;
function zoom(seletor: string | null, escala = 1.6, ms = 900) {
  const r = raiz();
  r.style.transition = `transform ${ms}ms cubic-bezier(0.45, 0, 0.2, 1)`;
  if (!seletor) {
    r.style.transform = '';
    return new Promise((ok) => setTimeout(ok, ms));
  }
  // mede sem zoom para achar o ponto de origem
  const antes = r.style.transform;
  r.style.transition = 'none';
  r.style.transform = '';
  const alvo = document.querySelector(seletor)!.getBoundingClientRect();
  r.style.transform = antes;
  void r.offsetWidth;
  r.style.transition = `transform ${ms}ms cubic-bezier(0.45, 0, 0.2, 1)`;
  const cx = alvo.left + alvo.width / 2;
  const cy = alvo.top + alvo.height / 2;
  r.style.transformOrigin = `${cx}px ${cy}px`;
  r.style.transform = `scale(${escala})`;
  return new Promise((ok) => setTimeout(ok, ms));
}

// ---------- Destaque ----------
let destaques: HTMLElement[] = [];
function retangulo(seletor: string): Ret | null {
  const e = document.querySelector(seletor);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}
function destacar(seletor: string, rotulo?: string, escurecer = false) {
  const r = retangulo(seletor);
  if (!r) return;
  const pad = 8;
  const anel = el('div', `dir-destaque${escurecer ? ' dir-destaque-escuro' : ''}`);
  Object.assign(anel.style, { left: `${r.x - pad}px`, top: `${r.y - pad}px`, width: `${r.w + pad * 2}px`, height: `${r.h + pad * 2}px` });
  camada.appendChild(anel);
  destaques.push(anel);
  if (rotulo) {
    const chip = el('div', 'dir-rotulo', rotulo);
    const embaixo = r.y + r.h + 60 < innerHeight;
    Object.assign(chip.style, {
      left: `${Math.min(Math.max(16, r.x), innerWidth - 360)}px`,
      top: embaixo ? `${r.y + r.h + pad + 12}px` : `${Math.max(12, r.y - pad - 52)}px`,
    });
    camada.appendChild(chip);
    destaques.push(chip);
  }
}
function limparDestaques() {
  destaques.forEach((d) => {
    d.classList.add('dir-saindo');
    setTimeout(() => d.remove(), 350);
  });
  destaques = [];
}

// ---------- Legenda (narração) ----------
const legenda = el('div', 'dir-legenda');
camada.appendChild(legenda);
function legendar(texto: string | null) {
  if (!texto) {
    legenda.classList.remove('dir-visivel');
    return;
  }
  legenda.textContent = texto;
  legenda.classList.add('dir-visivel');
}

// ---------- Chamada (dica no canto) ----------
let chamadaAtual: HTMLElement | null = null;
function chamada(titulo: string | null, texto = '', icone = '💡') {
  chamadaAtual?.classList.add('dir-saindo');
  const antiga = chamadaAtual;
  setTimeout(() => antiga?.remove(), 350);
  chamadaAtual = null;
  if (!titulo) return;
  chamadaAtual = el('div', 'dir-chamada', `<span class="dir-chamada-icone">${icone}</span><div><strong>${titulo}</strong>${texto ? `<span>${texto}</span>` : ''}</div>`);
  camada.appendChild(chamadaAtual);
}

// ---------- Aviso rápido (toast) ----------
function aviso(texto: string, icone = '✓') {
  const t = el('div', 'dir-aviso', `<span>${icone}</span>${texto}`);
  camada.appendChild(t);
  setTimeout(() => t.classList.add('dir-saindo'), 2400);
  setTimeout(() => t.remove(), 2800);
}

// ---------- Cartão de capítulo / abertura / encerramento ----------
let cartao: HTMLElement | null = null;
function cartaoCapitulo(opcoes: { etiqueta?: string; numero?: string; titulo: string; subtitulo?: string; topicos?: string[]; tipo?: 'capitulo' | 'abertura' | 'encerramento' }) {
  fecharCartao();
  const topicos = opcoes.topicos?.length ? `<ul>${opcoes.topicos.map((x) => `<li>${x}</li>`).join('')}</ul>` : '';
  cartao = el('div', `dir-cartao dir-cartao-${opcoes.tipo ?? 'capitulo'}`, `
    <div class="dir-cartao-fundo"><span></span><span></span><span></span><span></span></div>
    <div class="dir-cartao-conteudo">
      ${opcoes.etiqueta ? `<span class="dir-cartao-etiqueta">${opcoes.etiqueta}</span>` : ''}
      ${opcoes.numero ? `<span class="dir-cartao-numero">${opcoes.numero}</span>` : ''}
      <h1>${opcoes.titulo}</h1>
      ${opcoes.subtitulo ? `<p>${opcoes.subtitulo}</p>` : ''}
      ${topicos}
    </div>`);
  camada.appendChild(cartao);
}
function fecharCartao() {
  if (!cartao) return;
  const c = cartao;
  c.classList.add('dir-saindo');
  setTimeout(() => c.remove(), 700);
  cartao = null;
}

// ---------- Imagem em destaque (ex.: certificado) ----------
let imagem: HTMLElement | null = null;
function mostrarImagem(url: string | null, legendaImg = '') {
  imagem?.classList.add('dir-saindo');
  const antiga = imagem;
  setTimeout(() => antiga?.remove(), 450);
  imagem = null;
  if (!url) return;
  imagem = el('div', 'dir-imagem', `<img src="${url}" alt="">${legendaImg ? `<span>${legendaImg}</span>` : ''}`);
  camada.appendChild(imagem);
}

// ---------- Cortina (fade de abertura e encerramento) ----------
const cortina = el('div', 'dir-cortina');
cortina.style.opacity = '0';
camada.appendChild(cortina);
function cortinaVisivel(v: boolean, ms = 1400) {
  cortina.style.transition = `opacity ${ms}ms ease`;
  cortina.style.opacity = v ? '1' : '0';
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- Utilidades para o script de gravação ----------
function centro(seletor: string) {
  const e = document.querySelector(seletor);
  if (!e) return null;
  e.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
function rolarAte(seletor: string, bloco: ScrollLogicalPosition = 'center') {
  document.querySelector(seletor)?.scrollIntoView({ behavior: 'smooth', block: bloco });
  return new Promise((r) => setTimeout(r, 700));
}
function rolarPara(y: number) {
  window.scrollTo({ top: y, behavior: 'smooth' });
  return new Promise((r) => setTimeout(r, 800));
}
// Escolhe uma opção de <select> como o usuário faria (o React precisa do setter nativo).
function escolher(seletor: string, valor: string) {
  const s = document.querySelector(seletor) as HTMLSelectElement;
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(s, valor);
  s.dispatchEvent(new Event('change', { bubbles: true }));
}
function existe(seletor: string) {
  return !!document.querySelector(seletor);
}
function textoContem(seletor: string, texto: string) {
  return Array.from(document.querySelectorAll(seletor)).some((e) => e.textContent?.includes(texto));
}
// Marca com data-dir um elemento achado pelo texto (para o script poder mirar nele).
function marcarPorTexto(seletor: string, texto: string, marca: string) {
  const e = Array.from(document.querySelectorAll(seletor)).find((x) => x.textContent?.trim().includes(texto));
  if (e) e.setAttribute('data-dir', marca);
  return !!e;
}
function cursorVisivel(v: boolean) {
  cursor.style.opacity = v ? '1' : '0';
}

const downloads: string[] = [];
window.addEventListener('demo-download', (e) => downloads.push(String((e as CustomEvent).detail)));

(window as unknown as { __diretor: unknown }).__diretor = {
  moverCursor, cliqueVisual, zoom, destacar, limparDestaques, legendar, chamada, aviso, cartaoCapitulo, fecharCartao,
  mostrarImagem, cortinaVisivel, centro, rolarAte, rolarPara, escolher, existe, textoContem, marcarPorTexto, cursorVisivel, downloads,
  pronto: true,
};
