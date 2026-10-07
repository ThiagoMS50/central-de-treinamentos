import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTour } from '../hooks/useTour';
import { Icon } from './ui/Icon';

interface Caixa {
  top: number;
  left: number;
  width: number;
  height: number;
}

const FOLGA = 8; // espaço entre o elemento e a borda do destaque
const TEMPO_PULAR_OPCIONAL = 1500;

function encontrarAlvo(alvo: string | undefined): HTMLElement | null {
  if (!alvo) return null;
  return document.querySelector<HTMLElement>(`[data-tour="${alvo}"]`);
}

// Elemento existe mas está fora da tela ou escondido (ex.: menu lateral fechado no celular).
function visivel(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
}

// Tutorial estilo videogame: escurece a tela, ilumina o elemento da vez, explica o que ele faz e,
// nos passos de ação, espera o usuário clicar nele para continuar.
export function OnboardingTour() {
  const { t } = useTranslation();
  const { open, celebrando, stepIndex, steps, next, prev, skip, fecharCelebracao } = useTour();
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [concluidoAgora, setConcluidoAgora] = useState(false);
  const balaoRef = useRef<HTMLDivElement>(null);
  const [alturaBalao, setAlturaBalao] = useState(0);

  const passo = open ? steps[stepIndex] : undefined;

  // Acompanha a posição do elemento (rolagem, redimensionamento, telas que carregam depois).
  useEffect(() => {
    setCaixa(null);
    setConcluidoAgora(false);
    if (!passo?.alvo) return;

    let rolou = false;
    let frame = 0;
    const inicio = performance.now();
    const medir = () => {
      const el = encontrarAlvo(passo.alvo);
      if (el && visivel(el)) {
        if (!rolou) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          rolou = true;
        }
        const r = el.getBoundingClientRect();
        setCaixa((atual) =>
          atual && atual.top === r.top && atual.left === r.left && atual.width === r.width && atual.height === r.height
            ? atual
            : { top: r.top, left: r.left, width: r.width, height: r.height },
        );
      } else {
        setCaixa(null);
        // Elemento que não existe para este usuário/tela: pula o passo opcional.
        if (passo.opcional && !el && performance.now() - inicio > TEMPO_PULAR_OPCIONAL) {
          next();
          return;
        }
      }
      frame = requestAnimationFrame(medir);
    };
    frame = requestAnimationFrame(medir);
    return () => cancelAnimationFrame(frame);
  }, [passo, next]);

  // Passos de ação: avança quando o usuário clica no elemento destacado.
  useEffect(() => {
    if (!passo?.acao || !caixa) return;
    const el = encontrarAlvo(passo.alvo);
    if (!el) return;
    const aoClicar = () => {
      setConcluidoAgora(true);
      window.setTimeout(next, 650);
    };
    el.addEventListener('click', aoClicar, { once: true });
    return () => el.removeEventListener('click', aoClicar);
  }, [passo, caixa !== null, next]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (balaoRef.current) setAlturaBalao(balaoRef.current.offsetHeight);
  });

  if (celebrando) return <Celebracao onFechar={fecharCelebracao} />;
  if (!open || !passo) return null;

  const total = steps.length;
  const progresso = ((stepIndex + 1) / total) * 100;
  const destaque = caixa
    ? {
        top: caixa.top - FOLGA,
        left: caixa.left - FOLGA,
        width: caixa.width + FOLGA * 2,
        height: caixa.height + FOLGA * 2,
      }
    : null;
  // Passo de ação sem o elemento visível (ex.: menu lateral fechado no celular) vira "Próximo".
  const esperandoAcao = !!passo.acao && !!destaque;

  // Balão: abaixo do destaque se couber, senão acima; centralizado na tela quando não há alvo.
  const LARGURA = Math.min(360, window.innerWidth - 32);
  let estiloBalao: React.CSSProperties;
  if (destaque) {
    const cabeAbaixo = destaque.top + destaque.height + 16 + alturaBalao < window.innerHeight;
    const top = cabeAbaixo ? destaque.top + destaque.height + 16 : Math.max(16, destaque.top - 16 - alturaBalao);
    const left = Math.min(Math.max(16, destaque.left + destaque.width / 2 - LARGURA / 2), window.innerWidth - LARGURA - 16);
    estiloBalao = { top, left, width: LARGURA };
  } else {
    estiloBalao = { top: '50%', left: '50%', width: LARGURA, transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="tutorial" role="dialog" aria-modal="true" aria-live="polite">
      {/* Quatro painéis escuros em volta do destaque: bloqueiam cliques fora dele. */}
      {destaque ? (
        <>
          <div className="tutorial-sombra" style={{ top: 0, left: 0, right: 0, height: Math.max(0, destaque.top) }} />
          <div className="tutorial-sombra" style={{ top: destaque.top + destaque.height, left: 0, right: 0, bottom: 0 }} />
          <div className="tutorial-sombra" style={{ top: destaque.top, left: 0, width: Math.max(0, destaque.left), height: destaque.height }} />
          <div className="tutorial-sombra" style={{ top: destaque.top, left: destaque.left + destaque.width, right: 0, height: destaque.height }} />
          <div
            className={`tutorial-anel${esperandoAcao ? ' tutorial-anel-acao' : ''}${concluidoAgora ? ' tutorial-anel-ok' : ''}`}
            style={destaque}
          />
        </>
      ) : (
        <div className="tutorial-sombra" style={{ inset: 0 }} />
      )}

      <div ref={balaoRef} className="tutorial-balao" style={estiloBalao}>
        <div className="tutorial-topo">
          <span className="tutorial-missao">{t('tour.stepCounter', { current: stepIndex + 1, total })}</span>
          <button type="button" className="tutorial-pular" onClick={skip}>
            {t('tour.skip')}
          </button>
        </div>
        <div className="tutorial-barra" aria-hidden="true">
          <div className="tutorial-barra-fill" style={{ width: `${progresso}%` }} />
        </div>

        <h2>{t(`tour.steps.${passo.key}.title`)}</h2>
        <p>{t(`tour.steps.${passo.key}.body`)}</p>

        {esperandoAcao ? (
          <div className={`tutorial-acao${concluidoAgora ? ' tutorial-acao-ok' : ''}`}>
            <span className="tutorial-acao-icone">
              <Icon name={concluidoAgora ? 'check' : 'arrowUp'} size={16} />
            </span>
            {concluidoAgora ? t('tour.actionDone') : t(`tour.steps.${passo.key}.action`)}
          </div>
        ) : (
          <div className="tutorial-nav">
            {stepIndex > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={prev}>
                {t('tour.prev')}
              </button>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={next} autoFocus>
              {stepIndex === 0 ? t('tour.start') : stepIndex === total - 1 ? t('tour.finish') : t('tour.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tela de vitória ao concluir o tutorial.
function Celebracao({ onFechar }: { onFechar: () => void }) {
  const { t } = useTranslation();
  const pecas = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="tutorial" role="dialog" aria-modal="true">
      <div className="tutorial-sombra" style={{ inset: 0 }} onClick={onFechar} />
      <div className="confete" aria-hidden="true">
        {pecas.map((i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 9) * 0.12}s`,
              animationDuration: `${2.2 + (i % 5) * 0.35}s`,
              background: i % 3 === 0 ? '#ff7eb3' : i % 3 === 1 ? '#ffab5e' : '#ffffff',
              transform: `rotate(${i * 23}deg)`,
            }}
          />
        ))}
      </div>
      <div className="tutorial-vitoria">
        <span className="tutorial-trofeu" aria-hidden="true">
          <Icon name="trophy" size={40} />
        </span>
        <h2>{t('tour.doneTitle')}</h2>
        <p>{t('tour.doneBody')}</p>
        <button type="button" className="btn btn-primary" onClick={onFechar} autoFocus>
          {t('tour.doneAction')}
        </button>
      </div>
    </div>
  );
}
