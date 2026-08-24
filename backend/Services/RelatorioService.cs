using System.Text;
using LmsApi.Dtos;
using LmsApi.Models;
using LmsApi.Services.Supabase;

namespace LmsApi.Services;

public class RelatorioFiltro
{
    public DateTimeOffset? PeriodoInicio { get; set; }
    public DateTimeOffset? PeriodoFim { get; set; }
    public Guid? CursoId { get; set; }
    public Guid? UsuarioId { get; set; }
}

// Dado o tamanho pequeno do projeto (até ~100 usuários), a agregação é feita em memória com LINQ,
// trazendo as tabelas relevantes via SupabaseRestClient — sem views/RPC no Postgres. Se o volume
// de dados crescer muito, este é o primeiro ponto a revisitar.
public class RelatorioService
{
    private readonly ISupabaseRestClient _rest;

    public RelatorioService(ISupabaseRestClient rest)
    {
        _rest = rest;
    }

    private record DadosBrutos(
        List<ProfileRow> Profiles,
        List<CursoRow> Cursos,
        List<MatriculaRow> Matriculas,
        List<RespostaQuizRow> Respostas,
        List<AlternativaRow> Alternativas);

    private async Task<DadosBrutos> CarregarAsync(RelatorioFiltro filtro, List<Guid>? escopoAlunoIds)
    {
        var profiles = await _rest.SelectAsync<ProfileRow>("profiles");
        var cursos = await _rest.SelectAsync<CursoRow>("cursos");
        var matriculas = await _rest.SelectAsync<MatriculaRow>("matriculas");
        var respostas = await _rest.SelectAsync<RespostaQuizRow>("respostas_quiz");
        var alternativas = await _rest.SelectAsync<AlternativaRow>("alternativas");

        if (escopoAlunoIds is not null)
        {
            var escopoSet = escopoAlunoIds.ToHashSet();
            matriculas = matriculas.Where(m => escopoSet.Contains(m.AlunoId)).ToList();
        }

        if (filtro.CursoId.HasValue)
            matriculas = matriculas.Where(m => m.CursoId == filtro.CursoId.Value).ToList();
        if (filtro.UsuarioId.HasValue)
            matriculas = matriculas.Where(m => m.AlunoId == filtro.UsuarioId.Value).ToList();
        if (filtro.PeriodoInicio.HasValue)
            matriculas = matriculas.Where(m => m.IniciadoEm >= filtro.PeriodoInicio.Value).ToList();
        if (filtro.PeriodoFim.HasValue)
            matriculas = matriculas.Where(m => m.IniciadoEm <= filtro.PeriodoFim.Value).ToList();

        return new DadosBrutos(profiles, cursos, matriculas, respostas, alternativas);
    }

    public async Task<RelatorioDashboardDto> GerarDashboardAsync(RelatorioFiltro filtro, List<Guid>? escopoAlunoIds)
    {
        var dados = await CarregarAsync(filtro, escopoAlunoIds);
        var cursosPorId = dados.Cursos.ToDictionary(c => c.Id);
        var profilesPorId = dados.Profiles.ToDictionary(p => p.Id);

        var totalMatriculas = dados.Matriculas.Count;
        var totalConcluidas = dados.Matriculas.Count(m => m.ConcluidoEm.HasValue);
        var taxaGeral = totalMatriculas == 0 ? 0 : (double)totalConcluidas / totalMatriculas * 100;

        var tempoMedio = dados.Matriculas.Where(m => m.ConcluidoEm.HasValue)
            .Select(m => (m.ConcluidoEm!.Value - m.IniciadoEm).TotalDays)
            .DefaultIfEmpty(0)
            .Average();

        var conclusaoPorCurso = dados.Matriculas
            .GroupBy(m => m.CursoId)
            .Select(g =>
            {
                var concluidos = g.Count(m => m.ConcluidoEm.HasValue);
                return new CursoConclusaoDto(
                    g.Key,
                    cursosPorId.TryGetValue(g.Key, out var curso) ? curso.Titulo : "?",
                    g.Count(),
                    concluidos,
                    g.Count() == 0 ? 0 : (double)concluidos / g.Count() * 100);
            })
            .OrderBy(c => c.Titulo)
            .ToList();

        var agora = DateTimeOffset.UtcNow;
        var atrasados = new List<PendenciaDto>();
        foreach (var m in dados.Matriculas.Where(m => !m.ConcluidoEm.HasValue))
        {
            if (!cursosPorId.TryGetValue(m.CursoId, out var curso) || !curso.TemPrazo || curso.PrazoDias is null) continue;
            var prazoEm = m.IniciadoEm.AddDays(curso.PrazoDias.Value);
            if (prazoEm < agora)
            {
                atrasados.Add(new PendenciaDto(
                    m.AlunoId,
                    profilesPorId.TryGetValue(m.AlunoId, out var aluno) ? aluno.Nome : "?",
                    m.CursoId,
                    curso.Titulo,
                    prazoEm));
            }
        }

        var alternativasPorId = dados.Alternativas.ToDictionary(a => a.Id);
        var respostasEscopo = escopoAlunoIds is null
            ? dados.Respostas
            : dados.Respostas.Where(r => escopoAlunoIds.Contains(r.AlunoId)).ToList();
        var notaMedia = respostasEscopo.Count == 0
            ? 0
            : respostasEscopo.Count(r => alternativasPorId.TryGetValue(r.AlternativaId, out var alt) && alt.Correta) * 100.0 / respostasEscopo.Count;

        var progressoPorEquipe = new List<EquipeProgressoDto>();
        var gruposPorGestor = dados.Profiles.Where(p => p.ManagerId.HasValue).GroupBy(p => p.ManagerId!.Value);
        foreach (var grupo in gruposPorGestor)
        {
            if (!profilesPorId.TryGetValue(grupo.Key, out var gestor)) continue;
            var idsDoGrupo = grupo.Select(p => p.Id).ToHashSet();
            var matriculasDoGrupo = dados.Matriculas.Where(m => idsDoGrupo.Contains(m.AlunoId)).ToList();
            var progresso = matriculasDoGrupo.Count == 0
                ? 0
                : (double)matriculasDoGrupo.Count(m => m.ConcluidoEm.HasValue) / matriculasDoGrupo.Count * 100;
            progressoPorEquipe.Add(new EquipeProgressoDto(gestor.Id, gestor.Nome, grupo.Count(), progresso));
        }

        return new RelatorioDashboardDto(
            Math.Round(taxaGeral, 1),
            Math.Round(tempoMedio, 1),
            Math.Round(notaMedia, 1),
            conclusaoPorCurso,
            atrasados.OrderBy(a => a.PrazoEm).ToList(),
            progressoPorEquipe.OrderByDescending(p => p.TotalAlunos).ToList());
    }

    public async Task<byte[]> GerarCsvAsync(RelatorioFiltro filtro, List<Guid>? escopoAlunoIds)
    {
        var dados = await CarregarAsync(filtro, escopoAlunoIds);
        var cursosPorId = dados.Cursos.ToDictionary(c => c.Id);
        var profilesPorId = dados.Profiles.ToDictionary(p => p.Id);
        var alternativasPorId = dados.Alternativas.ToDictionary(a => a.Id);
        var respostasPorAluno = dados.Respostas.GroupBy(r => r.AlunoId).ToDictionary(g => g.Key, g => g.ToList());

        var sb = new StringBuilder();
        sb.AppendLine("aluno,equipe_gestor,curso,status,iniciado_em,concluido_em,prazo,atrasado,nota_quiz_media");

        foreach (var m in dados.Matriculas)
        {
            var aluno = profilesPorId.GetValueOrDefault(m.AlunoId);
            var curso = cursosPorId.GetValueOrDefault(m.CursoId);
            var gestorNome = aluno?.ManagerId is Guid gid && profilesPorId.TryGetValue(gid, out var gestor) ? gestor.Nome : "";
            var status = m.ConcluidoEm.HasValue ? "concluido" : "em_andamento";
            DateTimeOffset? prazoEm = curso is { TemPrazo: true, PrazoDias: not null }
                ? m.IniciadoEm.AddDays(curso.PrazoDias!.Value)
                : null;
            var atrasado = !m.ConcluidoEm.HasValue && prazoEm.HasValue && prazoEm.Value < DateTimeOffset.UtcNow;

            var minhasRespostas = respostasPorAluno.GetValueOrDefault(m.AlunoId) ?? new List<RespostaQuizRow>();
            double? notaMedia = minhasRespostas.Count == 0
                ? null
                : minhasRespostas.Count(r => alternativasPorId.TryGetValue(r.AlternativaId, out var a) && a.Correta) * 100.0 / minhasRespostas.Count;

            sb.AppendLine(string.Join(",",
                CsvEscape(aluno?.Nome ?? string.Empty),
                CsvEscape(gestorNome),
                CsvEscape(curso?.Titulo ?? string.Empty),
                status,
                m.IniciadoEm.ToString("yyyy-MM-dd"),
                m.ConcluidoEm?.ToString("yyyy-MM-dd") ?? string.Empty,
                prazoEm?.ToString("yyyy-MM-dd") ?? string.Empty,
                atrasado ? "sim" : "nao",
                notaMedia.HasValue ? notaMedia.Value.ToString("0.0") : string.Empty));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static string CsvEscape(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return "\"" + value.Replace("\"", "\"\"") + "\"";
        return value;
    }
}
