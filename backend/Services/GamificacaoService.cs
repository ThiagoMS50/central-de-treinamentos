using LmsApi.Auth;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

// Regras de pontuação seguem o padrão comum de gamificação em LMS: pontos por progresso
// (curso concluído, resposta certa no quiz, trilha inteira) + badges de marco + ranking geral.
public class GamificacaoService
{
    private const int PontosPorCurso = 10;
    private const int PontosPorRespostaCorreta = 2;
    private const int PontosPorTrilha = 50;

    private readonly ISupabaseRestClient _rest;

    public GamificacaoService(ISupabaseRestClient rest)
    {
        _rest = rest;
    }

    public async Task RegistrarConclusaoCursoAsync(Guid alunoId, Guid cursoId)
    {
        var jaRegistrado = await _rest.SelectAsync<PontosEventoRow>("pontos_eventos", PostgrestFilter.And(
            PostgrestFilter.Eq("aluno_id", alunoId),
            PostgrestFilter.Eq("tipo", "curso_concluido"),
            PostgrestFilter.Eq("referencia_id", cursoId)));
        if (jaRegistrado.Count > 0) return;

        await _rest.InsertAsync<PontosEventoRow>("pontos_eventos", new
        {
            aluno_id = alunoId,
            tipo = "curso_concluido",
            pontos = PontosPorCurso,
            referencia_id = cursoId
        });

        var totalCursos = (await _rest.SelectAsync<PontosEventoRow>("pontos_eventos", PostgrestFilter.And(
            PostgrestFilter.Eq("aluno_id", alunoId),
            PostgrestFilter.Eq("tipo", "curso_concluido")))).Count;

        if (totalCursos == 1) await ConcederBadgeAsync(alunoId, "primeiro_curso");
        if (totalCursos == 5) await ConcederBadgeAsync(alunoId, "cinco_cursos");
        if (totalCursos == 10) await ConcederBadgeAsync(alunoId, "dez_cursos");
    }

    public async Task RegistrarConclusaoTrilhaAsync(Guid alunoId, Guid trilhaId)
    {
        var jaRegistrado = await _rest.SelectAsync<PontosEventoRow>("pontos_eventos", PostgrestFilter.And(
            PostgrestFilter.Eq("aluno_id", alunoId),
            PostgrestFilter.Eq("tipo", "trilha_concluida"),
            PostgrestFilter.Eq("referencia_id", trilhaId)));
        if (jaRegistrado.Count > 0) return;

        await _rest.InsertAsync<PontosEventoRow>("pontos_eventos", new
        {
            aluno_id = alunoId,
            tipo = "trilha_concluida",
            pontos = PontosPorTrilha,
            referencia_id = trilhaId
        });

        await ConcederBadgeAsync(alunoId, "trilha_completa");
    }

    // Chamado a cada resposta de quiz — só pontua a primeira vez que aquela pergunta específica
    // é acertada por esse aluno (evita farmar pontos respondendo errado/certo repetidamente).
    public async Task RegistrarRespostaAsync(Guid alunoId, Guid perguntaId, Guid quizId, bool correta)
    {
        if (correta)
        {
            var jaPontuou = await _rest.SelectAsync<PontosEventoRow>("pontos_eventos", PostgrestFilter.And(
                PostgrestFilter.Eq("aluno_id", alunoId),
                PostgrestFilter.Eq("tipo", "quiz_correto"),
                PostgrestFilter.Eq("referencia_id", perguntaId)));

            if (jaPontuou.Count == 0)
            {
                await _rest.InsertAsync<PontosEventoRow>("pontos_eventos", new
                {
                    aluno_id = alunoId,
                    tipo = "quiz_correto",
                    pontos = PontosPorRespostaCorreta,
                    referencia_id = perguntaId
                });
            }
        }

        await VerificarQuizPerfeitoAsync(alunoId, quizId);
    }

    private async Task VerificarQuizPerfeitoAsync(Guid alunoId, Guid quizId)
    {
        var perguntas = await _rest.SelectAsync<PerguntaRow>("perguntas", PostgrestFilter.Eq("quiz_id", quizId));
        if (perguntas.Count == 0) return;

        var perguntaIds = perguntas.Select(p => p.Id).ToList();
        var respostas = await _rest.SelectAsync<RespostaQuizRow>("respostas_quiz", PostgrestFilter.And(
            PostgrestFilter.Eq("aluno_id", alunoId),
            PostgrestFilter.In("pergunta_id", perguntaIds.Cast<object>())));

        if (respostas.Count < perguntas.Count) return;

        var alternativas = await _rest.SelectAsync<AlternativaRow>("alternativas",
            PostgrestFilter.In("pergunta_id", perguntaIds.Cast<object>()));
        var corretasPorPergunta = alternativas.Where(a => a.Correta).ToDictionary(a => a.PerguntaId, a => a.Id);

        var todasCorretas = respostas.All(r => corretasPorPergunta.TryGetValue(r.PerguntaId, out var altCorreta) && altCorreta == r.AlternativaId);
        if (todasCorretas) await ConcederBadgeAsync(alunoId, "quiz_perfeito");
    }

    private async Task ConcederBadgeAsync(Guid alunoId, string codigoBadge)
    {
        var badge = (await _rest.SelectAsync<BadgeRow>("badges", PostgrestFilter.Eq("codigo", codigoBadge))).FirstOrDefault();
        if (badge is null) return;

        var jaTem = await _rest.SelectAsync<AlunoBadgeRow>("aluno_badges", PostgrestFilter.And(
            PostgrestFilter.Eq("aluno_id", alunoId),
            PostgrestFilter.Eq("badge_id", badge.Id)));
        if (jaTem.Count > 0) return;

        await _rest.InsertAsync<AlunoBadgeRow>("aluno_badges", new { aluno_id = alunoId, badge_id = badge.Id });
    }

    private async Task<Dictionary<Guid, int>> ObterTotalPontosPorAlunoAsync()
    {
        var eventos = await _rest.SelectAsync<PontosEventoRow>("pontos_eventos");
        return eventos.GroupBy(e => e.AlunoId).ToDictionary(g => g.Key, g => g.Sum(e => e.Pontos));
    }

    public async Task<MeuProgressoGamificacaoDto> ObterMeuProgressoAsync(Guid alunoId)
    {
        var pontosPorAluno = await ObterTotalPontosPorAlunoAsync();
        var meusPontos = pontosPorAluno.GetValueOrDefault(alunoId);

        var posicao = pontosPorAluno
            .OrderByDescending(kv => kv.Value)
            .Select((kv, i) => new { kv.Key, Posicao = i + 1 })
            .FirstOrDefault(x => x.Key == alunoId)?.Posicao ?? pontosPorAluno.Count + 1;

        var badgesDto = await ObterBadgesDoAlunoAsync(alunoId);

        return new MeuProgressoGamificacaoDto(meusPontos, posicao, badgesDto);
    }

    private async Task<List<BadgeDto>> ObterBadgesDoAlunoAsync(Guid alunoId)
    {
        var badges = await _rest.SelectAsync<BadgeRow>("badges", order: "nome.asc");
        var meusBadges = await _rest.SelectAsync<AlunoBadgeRow>("aluno_badges", PostgrestFilter.Eq("aluno_id", alunoId));
        var conquistadosPorBadge = meusBadges.ToDictionary(b => b.BadgeId, b => b.ConquistadoEm);

        return badges.Select(b =>
        {
            var conquistado = conquistadosPorBadge.TryGetValue(b.Id, out var conquistadoEm);
            return new BadgeDto(b.Codigo, b.Nome, b.Descricao, b.Icone, conquistado, conquistado ? conquistadoEm : null);
        }).ToList();
    }

    // Detalhe de um participante do ranking: quais cursos/trilhas concluiu (com os pontos de
    // cada um) e as conquistas — usado no pop-up de detalhes clicado a partir do ranking.
    public async Task<DetalheParticipanteDto?> ObterDetalheParticipanteAsync(Guid alunoId)
    {
        var perfil = await _rest.GetByIdAsync<ProfileRow>("profiles", alunoId);
        if (perfil is null) return null;

        var eventos = await _rest.SelectAsync<PontosEventoRow>("pontos_eventos", PostgrestFilter.Eq("aluno_id", alunoId));
        var totalPontos = eventos.Sum(e => e.Pontos);

        var eventosCurso = eventos.Where(e => e.Tipo == "curso_concluido" && e.ReferenciaId.HasValue).ToList();
        var eventosTrilha = eventos.Where(e => e.Tipo == "trilha_concluida" && e.ReferenciaId.HasValue).ToList();

        var cursoIds = eventosCurso.Select(e => e.ReferenciaId!.Value).ToList();
        var cursos = cursoIds.Count == 0
            ? new List<CursoRow>()
            : await _rest.SelectAsync<CursoRow>("cursos", PostgrestFilter.In("id", cursoIds.Cast<object>()));
        var cursosPorId = cursos.ToDictionary(c => c.Id);

        var trilhaIds = eventosTrilha.Select(e => e.ReferenciaId!.Value).ToList();
        var trilhas = trilhaIds.Count == 0
            ? new List<TrilhaRow>()
            : await _rest.SelectAsync<TrilhaRow>("trilhas", PostgrestFilter.In("id", trilhaIds.Cast<object>()));
        var trilhasPorId = trilhas.ToDictionary(t => t.Id);

        var cursosDto = eventosCurso
            .Select(e => new ItemConcluidoDto(
                cursosPorId.TryGetValue(e.ReferenciaId!.Value, out var c) ? c.Titulo : "?",
                e.Pontos,
                e.CriadoEm))
            .OrderByDescending(c => c.ConcluidoEm)
            .ToList();

        var trilhasDto = eventosTrilha
            .Select(e => new ItemConcluidoDto(
                trilhasPorId.TryGetValue(e.ReferenciaId!.Value, out var t) ? t.Titulo : "?",
                e.Pontos,
                e.CriadoEm))
            .OrderByDescending(t => t.ConcluidoEm)
            .ToList();

        var badgesDto = await ObterBadgesDoAlunoAsync(alunoId);

        return new DetalheParticipanteDto(perfil.Nome, totalPontos, cursosDto, trilhasDto, badgesDto);
    }

    public async Task<List<RankingItemDto>> ObterRankingAsync(Guid chamadorId, int top = 20)
    {
        var pontosPorAluno = await ObterTotalPontosPorAlunoAsync();
        var alunoIds = pontosPorAluno.Keys.ToList();
        var profiles = alunoIds.Count == 0
            ? new List<ProfileRow>()
            : await _rest.SelectAsync<ProfileRow>("profiles", PostgrestFilter.In("id", alunoIds.Cast<object>()));

        // Administrador gerencia o conteúdo mas não "estuda" — não faz sentido ele competir no
        // ranking com quem de fato está fazendo os cursos.
        var idsAdmin = profiles.Where(p => p.Role == RoleNames.Admin).Select(p => p.Id).ToHashSet();
        pontosPorAluno = pontosPorAluno.Where(kv => !idsAdmin.Contains(kv.Key)).ToDictionary(kv => kv.Key, kv => kv.Value);
        var nomesPorId = profiles.ToDictionary(p => p.Id, p => p.Nome);

        // Visibilidade dos detalhes: aluno só o próprio, gestor o próprio + liderados, admin todos.
        var chamador = await _rest.GetByIdAsync<ProfileRow>("profiles", chamadorId);
        var idsLiderados = chamador?.Role == RoleNames.Gestor
            ? (await _rest.SelectAsync<ProfileRow>("profiles", PostgrestFilter.Eq("manager_id", chamadorId))).Select(p => p.Id).ToHashSet()
            : new HashSet<Guid>();

        bool PodeVerDetalhes(Guid alunoId) =>
            chamador?.Role == RoleNames.Admin || alunoId == chamadorId || idsLiderados.Contains(alunoId);

        var ranking = pontosPorAluno
            .OrderByDescending(kv => kv.Value)
            .Select((kv, i) => new RankingItemDto(i + 1, kv.Key, nomesPorId.GetValueOrDefault(kv.Key, "?"), kv.Value, kv.Key == chamadorId, PodeVerDetalhes(kv.Key)))
            .ToList();

        var topN = ranking.Take(top).ToList();
        if (topN.Any(r => r.SouEu)) return topN;

        // Garante que o próprio usuário apareça na lista mesmo fora do top, pra ele ver sua posição.
        var minhaLinha = ranking.FirstOrDefault(r => r.SouEu);
        if (minhaLinha is not null) topN.Add(minhaLinha);
        return topN;
    }

    // Mesma regra de visibilidade acima, usada pelo endpoint de detalhe do participante
    // (aluno só o próprio, gestor o próprio + liderados, admin qualquer um).
    public async Task<bool> PodeVerDetalhesAsync(Guid chamadorId, Guid alvoId)
    {
        if (chamadorId == alvoId) return true;

        var chamador = await _rest.GetByIdAsync<ProfileRow>("profiles", chamadorId);
        if (chamador?.Role == RoleNames.Admin) return true;
        if (chamador?.Role != RoleNames.Gestor) return false;

        var alvo = await _rest.GetByIdAsync<ProfileRow>("profiles", alvoId);
        return alvo?.ManagerId == chamadorId;
    }
}
