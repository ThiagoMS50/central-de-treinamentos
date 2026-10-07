// Gera roteiro.md a partir do roteiro em código (cenas.mjs) e dos tempos reais da gravação.
// Uso: node roteiro.mjs
import fs from 'node:fs';
import path from 'node:path';
import { CAPITULOS, CENAS, DIR_SAIDA, META, ROTEIRO } from './config.mjs';

const arqTl = path.join(DIR_SAIDA, 'linha-do-tempo.json');
const tl = fs.existsSync(arqTl) ? JSON.parse(fs.readFileSync(arqTl, 'utf8')) : null;
const tempoCena = Object.fromEntries((tl?.cenas ?? []).map((c) => [c.id, c]));
const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

const linhas = [];
const L = (s = '') => linhas.push(s);

L(`# ${META.titulo}`);
L();
L(META.descricao);
L();
L(`> Este documento é gerado a partir de \`video-tutorial/${META.arquivoCenas}\` — o mesmo arquivo que comanda a gravação. Para mudar uma fala ou uma ação, edite as cenas e gere o vídeo de novo (veja "Como regenerar" no final).`);
L();
L('## Ficha técnica');
L();
L('| Item | Definição |');
L('|---|---|');
L(`| Duração total | ${tl ? mmss(tl.duracaoMs) : '≈ 7 min'} |`);
L('| Formato | MP4, 1920 × 1080 (Full HD), 30 quadros por segundo, áudio AAC estéreo 192 kbps, volume normalizado (−16 LUFS) |');
L('| Narração | Voz neural feminina em português do Brasil (Microsoft Thalita), ritmo levemente desacelerado (−3%) para ficar didático |');
L('| Legendas | Toda a narração aparece como legenda na parte de baixo da tela, em trechos curtos, sincronizados com a fala |');
L('| Identidade visual | Tema escuro da plataforma, degradê rosa → laranja da marca, fonte Plus Jakarta Sans, losangos decorativos |');
L('| Ambiente gravado | A plataforma real, em modo demonstração (dados fictícios, sem afetar o banco de produção) |');
L('| Personagens | **Ana Ribeiro** (administradora) e **Lucas Almeida** (aluno); colegas no ranking: Mariana, Pedro, Juliana, Rafael |');
L();
L('## Linguagem visual (vale para o vídeo inteiro)');
L();
L('- **Cursor guiado:** um cursor animado se desloca com aceleração suave até cada elemento e mostra uma "onda" rosa a cada clique — o espectador sempre vê onde clicar.');
L('- **Destaques:** anel rosa pulsante em volta do elemento explicado, com um rótulo em pílula no degradê da marca (ex.: "Menu principal").');
L('- **Zoom:** aproximação suave (≈ 1,3× a 1,5×, 0,9 s) em áreas pequenas, como o menu, as etapas do cadastro, os indicadores e o cabeçalho do curso; volta ao normal ao fim da explicação.');
L('- **Chamadas (dicas):** cartão no canto superior direito com ícone, para regras importantes (ex.: "Sem rascunho", "Regra do quiz", "Atenção — exclusão").');
L('- **Avisos rápidos:** pílula verde no topo para confirmações (ex.: "Trilha publicada", "Material baixado").');
L('- **Cartões de capítulo:** tela cheia com fundo escuro animado (brilhos rosa/laranja e losangos flutuando), etiqueta da parte, número do capítulo, título grande e subtítulo.');
L('- **Abertura e encerramento:** fade a partir do preto e de volta ao preto.');
L(META.notaTutorial ?? '- **O tutorial interativo da própria plataforma** aparece de verdade no vídeo: no admin ele é apresentado e pulado; no aluno ele é jogado até a tela de vitória.');
L();
L('## Trilha sonora e efeitos');
L();
L('- **Trilha:** pad ambiente, moderno e otimista (progressão Dó maior 7 – Lá menor 7 – Fá maior 7 – Sol 6, 4 s por acorde) com arpejo leve em 90 bpm e eco estéreo. Entra em fade-in na abertura e sai em fade-out no fim.');
L('- **Ducking automático:** a música abaixa sozinha (≈ −10 dB) sempre que a narradora fala e volta nas pausas.');
L('- **Efeitos:** clique suave em cada clique do cursor; teclas discretas durante a digitação; *whoosh* em cada cartão de capítulo; acorde ascendente de sucesso ao salvar e ao concluir missões; tom grave curto no erro do quiz; fanfarra curta na vitória do tutorial e no certificado.');
L('- **Sugestões, se quiser trocar a trilha por uma faixa licenciada:** estilos "corporate ambient", "tech inspiring" ou "lo-fi corporate", entre 85 e 100 bpm, sem vocal (ex.: bibliotecas YouTube Audio Library ou Pixabay Music, com licença de uso comercial).');
L();
L('## Capítulos');
L();
L('| # | Capítulo | Início | Duração |');
L('|---|---|---|---|');
for (const cap of CAPITULOS) {
  const cenasCap = CENAS.filter((c) => c.cap === cap.id).map((c) => tempoCena[c.id]).filter(Boolean);
  const ini = cenasCap[0]?.inicioMs;
  const fim = cenasCap.at(-1)?.fimMs;
  L(`| ${cap.parte} | ${cap.titulo} | ${ini != null ? mmss(ini) : '—'} | ${ini != null ? mmss(fim - ini) : cap.alvo} |`);
}
L();

let n = 0;
for (const cap of CAPITULOS) {
  L(`## ${cap.parte} — ${cap.titulo}`);
  L();
  for (const cena of CENAS.filter((c) => c.cap === cap.id)) {
    n++;
    const t = tempoCena[cena.id];
    L(`### Cena ${n} · ${cena.tela}${t ? ` · ${mmss(t.inicioMs)}–${mmss(t.fimMs)}` : ''}`);
    L();
    L(`**Narração:** ${cena.texto}`);
    L();
    L(`**Na tela:** ${cena.visual}`);
    L();
    if (cena.sons) {
      L(`**Som:** ${cena.sons}`);
      L();
    }
  }
}

L('## O que o vídeo cobre (checklist)');
L();
if (META.cobertura) for (const p of META.cobertura) { L(p); L(); }
else {
L('**Administrador:** login, idioma, recuperação de senha e autocadastro · tutorial interativo · menu (Aprender e Gestão), idioma, tema e menu da conta · painel e Primeiros passos · Administração → Cursos (lista, editar, excluir) · novo curso em 3 etapas (capa da galeria ou upload, título obrigatório, descrição, carga horária, prazo em dias) · aulas (ordem, exclusão, link de vídeo, salvamento automático) · materiais de apoio · quiz (alternativa correta, tentativas ilimitadas, salvar quiz) · publicação imediata e "Ver como aluno" · trilhas (capa, cursos, ordem, salvar) · Usuários (papel, ver progresso, redefinir tutorial, excluir) · Relatórios (indicadores, filtros, colaboradores, exportar CSV) · Configurações (ligar/desligar ranking) · sair.');
L();
L('**Aluno:** login · tutorial interativo completo com missões de ação e tela de vitória · painel (destaque com prazo vencido, pontos e regras de pontuação, conquistas, Primeiros passos, trilhas, filtros e busca) · curso (cabeçalho, conteúdo com etapas bloqueadas, vídeo, baixar material, avançar e concluir aulas, quiz com erro e acerto) · certificado em PDF com QR code · continuar de onde parou · trilha em linha do tempo · ranking e detalhes · alterar nome, rever tutorial, sair, tema claro/escuro · validação pública do certificado.');
L();
L('**Fora do vídeo (existem na plataforma, mas não foram demonstrados):** cadastro completo de uma conta nova (só é mostrado o link), o e-mail de redefinição de senha, envio de capa a partir do computador (só é mostrado o botão), edição e exclusão de curso/trilha (explicadas na narração, sem execução) e o tema "mesmo do sistema".');
L();
}
L('## Como regenerar o vídeo');
L();
const pre = ROTEIRO === 'tutorial' ? '' : `ROTEIRO=${ROTEIRO} `;
L('```bash');
L('# 1) suba o modo demonstração (na pasta frontend)');
L('npx vite --port 5199');
L('# 2) na pasta video-tutorial');
L('npm install            # primeira vez');
L(`${pre}node tts.mjs           # narração (só refaz as falas alteradas)`);
L('node certificado.mjs   # imagem do certificado mostrada no capítulo 7');
L(`${pre}node gravar.mjs        # grava a tela, cena a cena (${tl ? '≈ ' + Math.ceil(tl.duracaoMs / 60000) + ' min' : 'alguns minutos'} em tempo real)`);
L(`${pre}node montar.mjs        # mixa narração + efeitos + trilha e gera o MP4 final`);
L(`${pre}node roteiro.mjs       # atualiza este documento com os tempos reais`);
L('```');
L();
L('Para trocar a voz: `VOZ=pt-BR-FranciscaNeural node tts.mjs` (outra voz feminina) ou `pt-BR-AntonioNeural` (masculina).');

fs.writeFileSync(META.arquivoRoteiro, linhas.join('\n') + '\n');
console.log(`${META.arquivoRoteiro} gerado (${n} cenas)`);
